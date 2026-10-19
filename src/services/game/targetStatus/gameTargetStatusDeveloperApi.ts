import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { useTargetStatusPresentationStore } from '@/stores/targetStatusPresentation'
import { useWindowManagerStore } from '@/stores/windowManager'
import { TARGET_STATUS_WINDOW_ID, type SelectedTargetPatch, type SelectedTargetSnapshot, type TargetMarker, type GameTargetStatusRuntimeEvent, type GameTargetStatusSnapshot } from '@/views/game/types/gameTargetStatus'
import type { AbilityCastId, AbilityId, AbilityCastSnapshot } from '@/views/game/types/gameAbilityCast'
import type { IconSource, TextContent } from '@/shared/types/components'
import type { ResourceDisplayMode } from '@/views/game/types/gameResources'
import type { GameStatusEffectRecord, GameStatusEffectPatch } from '@/views/game/types/gameStatusEffects'
import { RuntimeIntegrationMode, runtimeIntegrationMode } from '@/services/runtime/runtimeIntegrationMode'
import { cloneGameTargetStatusSnapshot } from './gameTargetStatusValidation'

export type TargetStatusCommandError = 'developer-mutations-disabled' | 'invalid-snapshot' | 'invalid-patch' | 'invalid-revision' | 'revision-gap' | 'no-target' | 'target-mismatch' | 'duplicate-effect-id' | 'unknown-effect' | 'invalid-duration' | 'window-unavailable'
export type TargetStatusCommandResult<T = undefined> = { ok: true; revision: number; value: T } | { ok: false; error: TargetStatusCommandError; path?: string }
export interface GameTargetStatusDeveloperApi {
  getSnapshot(): GameTargetStatusSnapshot
  getTarget(): SelectedTargetSnapshot | null
  getStatus(): { status: string; revision: number; hasTarget: boolean; lastError: string | null; lastUpdatedAtMs: number | null }
  subscribe(listener: (snapshot: GameTargetStatusSnapshot) => void, options?: { emitCurrent?: boolean }): () => void
  replaceSnapshot(snapshot: GameTargetStatusSnapshot): TargetStatusCommandResult
  selectTarget(target: SelectedTargetSnapshot): TargetStatusCommandResult<SelectedTargetSnapshot>
  patchTarget(targetId: string, patch: SelectedTargetPatch): TargetStatusCommandResult
  clearTarget(): TargetStatusCommandResult
  setHealth(current: number, maximum?: number): TargetStatusCommandResult
  setMarker(marker: TargetMarker): TargetStatusCommandResult
  setPortrait(portrait: IconSource | null): TargetStatusCommandResult
  setGuild(guild: SelectedTargetSnapshot['guild']): TargetStatusCommandResult
  setOrder(order: SelectedTargetSnapshot['order']): TargetStatusCommandResult
  replaceEffects(kind: 'buff' | 'debuff', records: readonly GameStatusEffectRecord[]): TargetStatusCommandResult
  addEffect(kind: 'buff' | 'debuff', record: GameStatusEffectRecord): TargetStatusCommandResult<GameStatusEffectRecord>
  patchEffect(kind: 'buff' | 'debuff', id: string, patch: GameStatusEffectPatch): TargetStatusCommandResult
  removeEffect(kind: 'buff' | 'debuff', id: string): TargetStatusCommandResult
  clearEffects(kind: 'buff' | 'debuff'): TargetStatusCommandResult
  startCast(input: { castId: AbilityCastId; abilityId: AbilityId; abilityName: TextContent; durationMs: number; nowMs?: number }): TargetStatusCommandResult<AbilityCastSnapshot>
  setCast(cast: AbilityCastSnapshot | null): TargetStatusCommandResult
  interruptCast(): TargetStatusCommandResult
  finishCast(): TargetStatusCommandResult
  applyRuntimeEvent(event: GameTargetStatusRuntimeEvent): TargetStatusCommandResult<'applied' | 'ignored'>
  refresh(): Promise<TargetStatusCommandResult>
  focusWindow(): TargetStatusCommandResult<boolean>
  isWindowOpen(): boolean
  resetWindowLayout(): TargetStatusCommandResult
  getHealthDisplayMode(): ResourceDisplayMode
  setHealthDisplayMode(mode: ResourceDisplayMode): TargetStatusCommandResult
}

export function createGameTargetStatusDeveloperApi(): GameTargetStatusDeveloperApi {
  const store = useGameTargetStatusStore(); const presentation = useTargetStatusPresentationStore(); const windows = useWindowManagerStore()
  const enabled = () => import.meta.env.DEV || runtimeIntegrationMode.get() === RuntimeIntegrationMode.Disconnected
  const failure = <T>(error: TargetStatusCommandError): TargetStatusCommandResult<T> => ({ ok: false, error })
  const result = <T>(value: T): TargetStatusCommandResult<T> => ({ ok: true, revision: store.revision, value })
  const mutate = (patch: SelectedTargetPatch): TargetStatusCommandResult => {
    if (!enabled()) return failure('developer-mutations-disabled'); const current = store.target; if (!current) return failure('no-target')
    return store.applyRuntimeEvent({ kind: 'target-patched', revision: store.revision + 1, targetId: current.targetId, patch }) === 'applied' ? result(undefined) : failure('invalid-patch')
  }
  const api: GameTargetStatusDeveloperApi = {
    getSnapshot: store.getSnapshot,
    getTarget: () => store.target ? cloneGameTargetStatusSnapshot({ revision: store.revision, target: store.target }).target : null,
    getStatus: () => ({ status: store.status, revision: store.revision, hasTarget: store.hasTarget, lastError: store.lastError, lastUpdatedAtMs: store.lastUpdatedAtMs }),
    subscribe: (listener, options = {}) => { const stop = store.$subscribe(() => listener(store.getSnapshot())); if (options.emitCurrent) listener(store.getSnapshot()); return stop },
    replaceSnapshot: (snapshot) => enabled() && store.replaceSnapshot(snapshot) ? result(undefined) : failure(enabled() ? 'invalid-snapshot' : 'developer-mutations-disabled'),
    selectTarget: (target) => { if (!enabled()) return failure('developer-mutations-disabled'); return store.applyRuntimeEvent({ kind: 'target-selected', revision: store.revision + 1, target }) === 'applied' ? result(cloneGameTargetStatusSnapshot({ revision: store.revision, target }).target!) : failure('invalid-snapshot') },
    patchTarget: (targetId, patch) => store.target?.targetId === targetId ? mutate(patch) : failure(store.target ? 'target-mismatch' : 'no-target'),
    clearTarget: () => { if (!enabled()) return failure('developer-mutations-disabled'); return store.applyRuntimeEvent({ kind: 'target-cleared', revision: store.revision + 1, targetId: store.target?.targetId ?? null }) === 'applied' ? result(undefined) : failure('invalid-patch') },
    setHealth: (current, maximum = store.target?.hp.maximum ?? 0) => mutate({ hp: { current, maximum } }),
    setMarker: (marker) => mutate({ marker }), setPortrait: (portrait) => mutate({ portrait }), setGuild: (guild) => mutate({ guild }), setOrder: (order) => mutate({ order }),
    replaceEffects: (kind, records) => mutate({ [kind === 'buff' ? 'buffs' : 'debuffs']: records }),
    addEffect: (kind, record) => { const current = store.target; if (!current) return failure('no-target'); const records = [...current[kind === 'buff' ? 'buffs' : 'debuffs'], record]; return mutate({ [kind === 'buff' ? 'buffs' : 'debuffs']: records }).ok ? result(record) : failure('invalid-patch') },
    patchEffect: (kind, id, patch) => {
      const current = store.target
      if (!current) return failure('no-target')
      const key = kind === 'buff' ? 'buffs' : 'debuffs'
      const records = current[key].map((record) => record.id === id ? { ...record, ...patch, definition: { ...record.definition, ...patch.definition } } : record)
      return records.some((record, index) => record.id === id && current[key][index] !== record) ? mutate({ [key]: records }) : failure('unknown-effect')
    },
    removeEffect: (kind, id) => {
      const current = store.target
      if (!current) return failure('no-target')
      const key = kind === 'buff' ? 'buffs' : 'debuffs'; const records = current[key].filter((record) => record.id !== id)
      return records.length === current[key].length ? failure('unknown-effect') : mutate({ [key]: records })
    },
    clearEffects: (kind) => mutate({ [kind === 'buff' ? 'buffs' : 'debuffs']: [] }),
    startCast: (input) => { if (!Number.isFinite(input.durationMs) || input.durationMs <= 0) return failure('invalid-duration'); const now = input.nowMs ?? Date.now(); const cast = { castId: input.castId, abilityId: input.abilityId, abilityName: input.abilityName, startedAtMs: now, endsAtMs: now + input.durationMs }; return mutate({ activeCast: cast }).ok ? result(cast) : failure('invalid-patch') },
    setCast: (cast) => mutate({ activeCast: cast }), interruptCast: () => mutate({ activeCast: null }), finishCast: () => mutate({ activeCast: null }),
    applyRuntimeEvent: (event) => { if (!enabled()) return failure('developer-mutations-disabled'); const applied = store.applyRuntimeEvent(event); return applied === 'needs-resync' ? failure('revision-gap') : result(applied) },
    refresh: async () => { await store.refresh(); return result(undefined) },
    focusWindow: () => store.hasTarget ? result(windows.focusWindow(TARGET_STATUS_WINDOW_ID)) : failure('no-target'),
    isWindowOpen: () => windows.isWindowOpen(TARGET_STATUS_WINDOW_ID).value,
    resetWindowLayout: () => { windows.resetWindowLayout(TARGET_STATUS_WINDOW_ID); return result(undefined) },
    getHealthDisplayMode: () => presentation.hpDisplayMode,
    setHealthDisplayMode: (mode) => { presentation.setHpDisplayMode(mode); return result(undefined) },
  }
  return api
}
export function installGameTargetStatusDeveloperApi(api: GameTargetStatusDeveloperApi, target: Window = window): () => void {
  const existing = (target.ew ?? {}) as EwDeveloperApi; target.ew = existing; existing.targetStatus = api
  return () => { if (target.ew?.targetStatus === api) Reflect.deleteProperty(target.ew, 'targetStatus') }
}
