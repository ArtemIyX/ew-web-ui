import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { getGameSettingsGateway } from '@/services/game/settings/gameSettingsService'
import {
  applyPatch,
  cloneSettings,
  createPatch,
  normalizeSettings,
  setPath,
  validateSnapshot,
  type SettingsValidationIssue,
} from '@/services/game/settings/gameSettingsValidation'
import type {
  ApplyGameSettingsResult,
  GameSettingsGateway,
} from '@/services/game/settings/gameSettingsGateway'
import type {
  DeepPartial,
  GameSettingsCapabilities,
  GameSettingsPath,
  GameSettingsPathValue,
  GameSettingsSnapshot,
} from '@/views/game/types/gameSettings'

export type GameSettingsStatus =
  'idle' | 'loading' | 'ready' | 'applying' | 'awaiting-display-confirmation' | 'error'
export interface DisplayPreviewState {
  token: string
  expiresAtMs: number
  requestedCloseAfterConfirm: boolean
}
export type DisplayRevertReason = 'timeout' | 'cancel' | 'unmount' | 'disconnect'
export type ApplyOutcome =
  | ApplyGameSettingsResult
  | { kind: 'invalid'; issues: SettingsValidationIssue[] }
  | { kind: 'error' }
let sequence = 0
export const useGameSettingsStore = defineStore('game-settings', () => {
  const status = ref<GameSettingsStatus>('idle')
  const capabilities = ref<GameSettingsCapabilities | null>(null)
  const defaults = ref<GameSettingsSnapshot | null>(null)
  const authoritative = ref<GameSettingsSnapshot | null>(null)
  const lastApplied = ref<GameSettingsSnapshot | null>(null)
  const draft = ref<GameSettingsSnapshot | null>(null)
  const validationIssues = ref<SettingsValidationIssue[]>([])
  const runtimeError = ref<string | null>(null)
  const displayPreview = ref<DisplayPreviewState | null>(null)
  const activeTab = ref<'video' | 'input'>('video')
  const lastLoadedAtMs = ref<number | null>(null)
  const gateway = shallowRef<GameSettingsGateway | null>(null)
  let unsubscribe: (() => void) | null = null
  let loading: Promise<void> | null = null
  const isLoaded = computed(
    () => status.value !== 'idle' && capabilities.value !== null && draft.value !== null,
  )
  const isDirty = computed(() =>
    Boolean(
      lastApplied.value &&
      draft.value &&
      JSON.stringify(lastApplied.value) !== JSON.stringify(draft.value),
    ),
  )
  const isVideoDirty = computed(() =>
    Boolean(
      lastApplied.value &&
      draft.value &&
      JSON.stringify(lastApplied.value.video) !== JSON.stringify(draft.value.video),
    ),
  )
  const isInputDirty = computed(() =>
    Boolean(
      lastApplied.value &&
      draft.value &&
      JSON.stringify(lastApplied.value.input) !== JSON.stringify(draft.value.input),
    ),
  )
  const changedPaths = computed(() => {
    if (!lastApplied.value || !draft.value) return []
    const paths: string[] = []
    if (isVideoDirty.value) paths.push('video')
    if (isInputDirty.value) paths.push('input')
    return paths
  })
  const canApply = computed(
    () =>
      isLoaded.value &&
      isDirty.value &&
      validationIssues.value.length === 0 &&
      status.value === 'ready',
  )
  const canCloseImmediately = computed(
    () =>
      !isDirty.value &&
      status.value !== 'applying' &&
      status.value !== 'awaiting-display-confirmation',
  )
  const isResolutionDisabled = computed(
    () => draft.value?.video.display.windowMode === 'borderless',
  )
  const isDlssModeDisabled = computed(() => draft.value?.video.superResolution.method !== 'dlss')
  const isAntiAliasingMethodDisabled = computed(
    () => draft.value?.video.superResolution.method === 'dlss',
  )
  const isFrameGenerationDisabled = computed(
    () =>
      !capabilities.value?.frameGeneration.supported ||
      (Boolean(capabilities.value?.frameGeneration.requiresDlssSuperResolution) &&
        draft.value?.video.superResolution.method !== 'dlss'),
  )
  const isRenderScaleDisabled = computed(
    () => draft.value?.video.superResolution.dlssMode === 'dlaa',
  )
  const validationIssuesByPath = computed(() =>
    Object.fromEntries(validationIssues.value.map((issue) => [issue.path, issue])),
  )
  async function initialize(options: { force?: boolean } = {}): Promise<void> {
    if (loading) return loading
    if (isLoaded.value && !options.force) return
    gateway.value = getGameSettingsGateway()
    status.value = 'loading'
    runtimeError.value = null
    loading = gateway.value
      .load()
      .then((result) => {
        capabilities.value = result.capabilities
        defaults.value = result.defaults
        authoritative.value = result.current
        lastApplied.value = cloneSettings(result.current)
        draft.value = cloneSettings(result.current)
        status.value = 'ready'
        lastLoadedAtMs.value = Date.now()
        validationIssues.value = []
        unsubscribe?.()
        unsubscribe = gateway.value?.subscribe(onExternalSnapshot) ?? null
      })
      .catch(() => {
        status.value = 'error'
        runtimeError.value = '#SETTINGS_ERROR_LOAD'
      })
      .finally(() => {
        loading = null
      })
    return loading
  }
  function onExternalSnapshot(snapshot: GameSettingsSnapshot): void {
    if (!authoritative.value || snapshot.revision >= authoritative.value.revision) {
      authoritative.value = cloneSettings(snapshot)
      if (!isDirty.value) {
        lastApplied.value = cloneSettings(snapshot)
        draft.value = cloneSettings(snapshot)
      } else runtimeError.value = '#SETTINGS_ERROR_CONFLICT'
    }
  }
  async function refresh(): Promise<void> {
    await initialize({ force: true })
  }
  function setActiveTab(tab: 'video' | 'input'): void {
    activeTab.value = tab
  }
  function updateDraft(patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>>): void {
    if (!draft.value || !capabilities.value) return
    draft.value = normalizeSettings(applyPatch(draft.value, patch), capabilities.value)
    validationIssues.value = validateSnapshot(draft.value, capabilities.value)
  }
  function setField<P extends GameSettingsPath>(path: P, value: GameSettingsPathValue<P>): void {
    if (!draft.value || !capabilities.value) return
    if (path === 'video.graphics.overallQuality' && value !== 'custom') {
      const graphics = Object.fromEntries(
        capabilities.value.graphicsGroups
          .filter((group) => group !== 'overallQuality')
          .map((group) => [group, value]),
      ) as DeepPartial<GameSettingsSnapshot['video']['graphics']>
      updateDraft({ video: { graphics } })
      return
    }
    draft.value = normalizeSettings(setPath(draft.value, path, value), capabilities.value)
    validationIssues.value = validateSnapshot(draft.value, capabilities.value)
  }
  function restoreDefaults(scope: 'video' | 'input' | 'all' = 'all'): void {
    if (!draft.value || !defaults.value) return
    if (scope === 'all') draft.value = cloneSettings(defaults.value)
    else draft.value = { ...draft.value, [scope]: cloneSettings(defaults.value[scope]) }
    if (capabilities.value)
      validationIssues.value = validateSnapshot(draft.value, capabilities.value)
  }
  function discardDraft(): void {
    if (lastApplied.value) draft.value = cloneSettings(lastApplied.value)
    validationIssues.value = []
    runtimeError.value = null
  }
  function validateDraft(): SettingsValidationIssue[] {
    validationIssues.value =
      draft.value && capabilities.value ? validateSnapshot(draft.value, capabilities.value) : []
    return validationIssues.value
  }
  async function apply(options: { closeAfterSuccess?: boolean } = {}): Promise<ApplyOutcome> {
    if (!draft.value || !lastApplied.value || !gateway.value || !canApply.value)
      return { kind: 'invalid', issues: validateDraft() }
    const requestId = `settings-${++sequence}`
    status.value = 'applying'
    const result = await gateway.value.apply({
      requestId,
      baseRevision: lastApplied.value.revision,
      patch: createPatch(lastApplied.value, draft.value),
      origin: 'settings-window',
    })
    if (result.kind === 'applied') {
      authoritative.value = cloneSettings(result.current)
      lastApplied.value = cloneSettings(result.current)
      draft.value = cloneSettings(result.current)
      status.value = 'ready'
      return result
    }
    if (result.kind === 'display-preview') {
      displayPreview.value = {
        token: result.previewToken,
        expiresAtMs: result.expiresAtMs,
        requestedCloseAfterConfirm: options.closeAfterSuccess ?? false,
      }
      status.value = 'awaiting-display-confirmation'
      return result
    }
    if (result.kind === 'revision-conflict') {
      authoritative.value = cloneSettings(result.current)
      status.value = 'ready'
      runtimeError.value = '#SETTINGS_ERROR_CONFLICT'
      return result
    }
    validationIssues.value = result.issues
    status.value = 'ready'
    return result
  }
  async function confirmDisplayPreview(): Promise<void> {
    if (!displayPreview.value || !gateway.value) return
    const preview = displayPreview.value
    const result = await gateway.value.confirmDisplayPreview(preview.token)
    authoritative.value = cloneSettings(result)
    lastApplied.value = cloneSettings(result)
    draft.value = cloneSettings(result)
    displayPreview.value = null
    status.value = 'ready'
  }
  async function revertDisplayPreview(_reason: DisplayRevertReason): Promise<void> {
    if (!displayPreview.value || !gateway.value) return
    const result = await gateway.value.revertDisplayPreview(displayPreview.value.token)
    authoritative.value = cloneSettings(result)
    lastApplied.value = cloneSettings(result)
    draft.value = cloneSettings(result)
    displayPreview.value = null
    status.value = 'ready'
  }
  async function reloadAfterConflict(): Promise<void> {
    discardDraft()
    await refresh()
  }
  function resetForTests(): void {
    unsubscribe?.()
    unsubscribe = null
    status.value = 'idle'
    capabilities.value = null
    defaults.value = null
    authoritative.value = null
    lastApplied.value = null
    draft.value = null
    validationIssues.value = []
    runtimeError.value = null
    displayPreview.value = null
    loading = null
  }
  return {
    status,
    capabilities,
    defaults,
    authoritative,
    lastApplied,
    draft,
    validationIssues,
    runtimeError,
    displayPreview,
    activeTab,
    lastLoadedAtMs,
    isLoaded,
    isDirty,
    isVideoDirty,
    isInputDirty,
    changedPaths,
    canApply,
    canCloseImmediately,
    isResolutionDisabled,
    isDlssModeDisabled,
    isAntiAliasingMethodDisabled,
    isFrameGenerationDisabled,
    isRenderScaleDisabled,
    validationIssuesByPath,
    initialize,
    refresh,
    setActiveTab,
    updateDraft,
    setField,
    restoreDefaults,
    discardDraft,
    validateDraft,
    apply,
    confirmDisplayPreview,
    revertDisplayPreview,
    reloadAfterConflict,
    resetForTests,
  }
})
