import { watch } from 'vue'
import { useGameSettingsStore } from '@/stores/gameSettings'
import {
  cloneSettings,
  type DeepPartial,
  type GameSettingsCapabilities,
  type GameSettingsSnapshot,
} from '@/views/game/types/gameSettings'
import type { ApplyOutcome } from '@/stores/gameSettings'

export interface SetGameSettingsOptions {
  apply?: boolean
  closeSettingsWindowAfterApply?: boolean
  expectedRevision?: number
}
export type GameSettingsControllerEvent = {
  type:
    | 'loaded'
    | 'draft-changed'
    | 'applied'
    | 'display-preview-started'
    | 'display-preview-reverted'
    | 'conflict'
    | 'error'
  snapshot: Readonly<GameSettingsSnapshot> | null
}
export interface GameSettingsController {
  getSnapshot(): Readonly<GameSettingsSnapshot> | null
  getDraft(): Readonly<GameSettingsSnapshot> | null
  getCapabilities(): Readonly<GameSettingsCapabilities> | null
  setDraft(
    patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>>,
  ): ReturnType<typeof storeValidation>
  setAndApply(
    patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>>,
    options?: SetGameSettingsOptions,
  ): Promise<ApplyOutcome>
  reset(scope?: 'video' | 'input' | 'all'): void
  refresh(): Promise<void>
  subscribe(listener: (event: GameSettingsControllerEvent) => void): () => void
}
function storeValidation() {
  return [] as ReturnType<ReturnType<typeof useGameSettingsStore>['validateDraft']>
}
export function useGameSettingsController(): GameSettingsController {
  const store = useGameSettingsStore()
  const listeners = new Set<(event: GameSettingsControllerEvent) => void>()
  let stop: (() => void) | null = null
  const emit = (type: GameSettingsControllerEvent['type']): void =>
    listeners.forEach((listener) =>
      listener({ type, snapshot: store.authoritative ? cloneSettings(store.authoritative) : null }),
    )
  function ensureWatchers(): void {
    if (stop) return
    stop = watch(
      [() => store.status, () => store.draft, () => store.runtimeError],
      ([status, draft, error], previous) => {
        if (status === 'ready' && previous?.[0] === 'loading') emit('loaded')
        if (draft) emit('draft-changed')
        if (error === '#SETTINGS_ERROR_CONFLICT') emit('conflict')
        if (error) emit('error')
      },
      { deep: true },
    )
  }
  ensureWatchers()
  return {
    getSnapshot: () => (store.authoritative ? cloneSettings(store.authoritative) : null),
    getDraft: () => (store.draft ? cloneSettings(store.draft) : null),
    getCapabilities: () => (store.capabilities ? cloneSettings(store.capabilities) : null),
    setDraft: (patch) => {
      store.updateDraft(patch)
      return store.validateDraft()
    },
    setAndApply: async (patch, options = {}) => {
      await store.initialize()
      if (
        options.expectedRevision !== undefined &&
        store.lastApplied?.revision !== options.expectedRevision
      ) {
        emit('conflict')
        return { kind: 'revision-conflict', current: cloneSettings(store.authoritative!) }
      }
      store.updateDraft(patch)
      if (options.apply === false) return { kind: 'invalid', issues: store.validateDraft() }
      const outcome = await store.apply({
        closeAfterSuccess: options.closeSettingsWindowAfterApply,
      })
      if (outcome.kind === 'applied') emit('applied')
      if (outcome.kind === 'display-preview') emit('display-preview-started')
      if (outcome.kind === 'revision-conflict') emit('conflict')
      if (outcome.kind === 'rejected' || outcome.kind === 'error') emit('error')
      return outcome
    },
    reset: (scope = 'all') => store.restoreDefaults(scope),
    refresh: () => store.refresh(),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
