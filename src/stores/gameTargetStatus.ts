import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getGameTargetStatusGateway } from '@/services/game/targetStatus/gameTargetStatusService'
import { cloneGameTargetStatusSnapshot, validateGameTargetStatusSnapshot, validateTarget } from '@/services/game/targetStatus/gameTargetStatusValidation'
import type {
  GameTargetStatusRuntimeEvent,
  GameTargetStatusSnapshot,
  SelectedTargetPatch,
  SelectedTargetSnapshot,
} from '@/views/game/types/gameTargetStatus'

export type GameTargetStatusStoreStatus = 'idle' | 'loading' | 'ready' | 'stale' | 'error'
export const useGameTargetStatusStore = defineStore('game-target-status', () => {
  const status = ref<GameTargetStatusStoreStatus>('idle')
  const revision = ref(0)
  const target = ref<SelectedTargetSnapshot | null>(null)
  const lastError = ref<string | null>(null)
  const lastUpdatedAtMs = ref<number | null>(null)
  let gateway: ReturnType<typeof getGameTargetStatusGateway> | undefined
  let unsubscribe: (() => void) | undefined
  let initialization: Promise<void> | undefined
  let resync: Promise<void> | undefined
  let lifecycleToken = 0
  const hasTarget = computed(() => target.value !== null)
  const isPlayerTarget = computed(() => target.value?.entityKind === 'player')
  const hasTimedEffects = computed(() => [...(target.value?.buffs ?? []), ...(target.value?.debuffs ?? [])].some((effect) => effect.endsAtMs !== null))
  const hasActiveCast = computed(() => {
    const cast = target.value?.activeCast
    return cast !== null && cast !== undefined && cast.endsAtMs > Date.now()
  })

  function commitSnapshot(snapshot: GameTargetStatusSnapshot): boolean {
    const result = validateGameTargetStatusSnapshot(snapshot)
    if (!result.ok) { lastError.value = result.issues[0]?.code ?? 'invalid-snapshot'; status.value = 'error'; return false }
    if (result.value.revision < revision.value) return false
    revision.value = result.value.revision; target.value = result.value.target; status.value = 'ready'; lastError.value = null; lastUpdatedAtMs.value = Date.now(); return true
  }
  async function load(activeGateway: ReturnType<typeof getGameTargetStatusGateway>, token: number): Promise<void> {
    const snapshot = await activeGateway.load()
    if (token !== lifecycleToken || activeGateway !== gateway) return
    if (!commitSnapshot(snapshot)) throw new Error(lastError.value ?? 'invalid-snapshot')
  }
  async function resyncFromGateway(): Promise<void> {
    if (!gateway || resync) return resync
    const activeGateway = gateway; const token = lifecycleToken
    resync = load(activeGateway, token).catch((error: unknown) => { if (token === lifecycleToken) { status.value = 'error'; lastError.value = error instanceof Error ? error.message : 'load-failed' } }).finally(() => { resync = undefined })
    return resync
  }
  function onEvent(event: GameTargetStatusRuntimeEvent): void { if (applyRuntimeEvent(event) === 'needs-resync') void resyncFromGateway() }
  async function initialize(options: { force?: boolean } = {}): Promise<void> {
    if (initialization && !options.force) return initialization
    if (status.value === 'ready' && !options.force) return
    if (options.force) { lifecycleToken += 1; unsubscribe?.(); unsubscribe = undefined; gateway = undefined }
    const token = lifecycleToken
    const pending = (async () => { status.value = 'loading'; const activeGateway = getGameTargetStatusGateway(); gateway = activeGateway; try { await load(activeGateway, token); if (token === lifecycleToken) unsubscribe = activeGateway.subscribe(onEvent) } catch (error: unknown) { if (token === lifecycleToken) { status.value = 'error'; lastError.value = error instanceof Error ? error.message : 'load-failed' } } })().finally(() => { if (initialization === pending) initialization = undefined })
    initialization = pending; return pending
  }
  function replaceSnapshot(snapshot: GameTargetStatusSnapshot): boolean { return commitSnapshot(snapshot) }
  function applyRuntimeEvent(event: GameTargetStatusRuntimeEvent): 'applied' | 'ignored' | 'needs-resync' {
    if (event.kind === 'snapshot') return replaceSnapshot(event.snapshot) ? 'applied' : 'ignored'
    if (!Number.isInteger(event.revision) || event.revision <= revision.value) return 'ignored'
    if (event.revision !== revision.value + 1) { status.value = 'stale'; lastError.value = 'revision-gap'; return 'needs-resync' }
    if (event.kind === 'target-selected') {
      const result = validateTarget(event.target)
      if (!result.ok) { lastError.value = result.issues[0]?.code ?? 'invalid-snapshot'; return 'ignored' }
      target.value = result.value
    } else if (event.kind === 'target-cleared') {
      if (event.targetId !== null && event.targetId !== target.value?.targetId) return 'ignored'
      target.value = null
    } else {
      if (event.targetId !== target.value?.targetId || !target.value) return 'ignored'
      const result = validateTarget({ ...target.value, ...event.patch })
      if (!result.ok) { lastError.value = result.issues[0]?.code ?? 'invalid-snapshot'; return 'ignored' }
      target.value = result.value
    }
    revision.value = event.revision; status.value = 'ready'; lastError.value = null; lastUpdatedAtMs.value = Date.now(); return 'applied'
  }
  function getSnapshot(): GameTargetStatusSnapshot { return cloneGameTargetStatusSnapshot({ revision: revision.value, target: target.value }) }
  function dispose(): void { lifecycleToken += 1; unsubscribe?.(); unsubscribe = undefined; gateway = undefined; initialization = undefined; resync = undefined }
  function resetForTests(): void { dispose(); status.value = 'idle'; revision.value = 0; target.value = null; lastError.value = null; lastUpdatedAtMs.value = null }
  return { status, revision, target, lastError, lastUpdatedAtMs, hasTarget, isPlayerTarget, hasTimedEffects, hasActiveCast, getSnapshot, selectedTarget: () => target.value ? cloneGameTargetStatusSnapshot({ revision: revision.value, target: target.value }).target : null, initialize, refresh: () => initialize({ force: true }), dispose, replaceSnapshot, applyRuntimeEvent, resetForTests }
})
