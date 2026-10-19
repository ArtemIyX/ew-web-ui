import { computed } from 'vue'
import { defineStore } from 'pinia'
import { createGameStatusEffectStore } from './statusEffects/createGameStatusEffectStore'
import { getGameToggleGateway } from '@/services/game/toggles/gameToggleService'
import type {
  GameToggleRecord,
  GameToggleRuntimeEvent,
  GameToggleSnapshot,
} from '@/views/game/types/gameToggles'
import type { GameStatusEffectRuntimeEvent } from '@/views/game/types/gameStatusEffects'
function toCore(record: GameToggleRecord) {
  return {
    id: record.toggleId,
    definition: record.definition,
    appliedAtMs: record.appliedAtMs,
    endsAtMs: record.endsAtMs,
    order: record.order,
  }
}
function fromCore(
  record:
    | {
        id: string
        definition: GameToggleRecord['definition']
        appliedAtMs: number
        endsAtMs: number | null
        order: number
      }
    | undefined,
) {
  return record
    ? {
        toggleId: record.id,
        definition: record.definition,
        appliedAtMs: record.appliedAtMs,
        endsAtMs: record.endsAtMs,
        order: record.order,
      }
    : undefined
}
function toCoreEvent(event: GameToggleRuntimeEvent): GameStatusEffectRuntimeEvent {
  if (event.kind === 'snapshot')
    return {
      kind: 'snapshot',
      snapshot: { revision: event.snapshot.revision, effects: event.snapshot.toggles.map(toCore) },
    }
  if (event.kind === 'upsert')
    return { kind: 'upsert', revision: event.revision, record: toCore(event.toggle) }
  if (event.kind === 'remove')
    return { kind: 'remove', revision: event.revision, id: event.toggleId }
  return event
}
const useGameToggleCoreStore = createGameStatusEffectStore('game-toggles-core', () => ({
  load: async () => {
    const snapshot = await getGameToggleGateway().load()
    return { revision: snapshot.revision, effects: snapshot.toggles.map(toCore) }
  },
  subscribe: (listener: (event: GameStatusEffectRuntimeEvent) => void) =>
    getGameToggleGateway().subscribe((event) => listener(toCoreEvent(event))),
}))
export const useGameTogglesStore = defineStore('game-toggles', () => {
  const core = useGameToggleCoreStore()
  return {
    status: computed(() => core.status),
    revision: computed(() => core.revision),
    records: computed(() => core.records),
    lastError: computed(() => core.lastError),
    lastUpdatedAtMs: computed(() => core.lastUpdatedAtMs),
    allEffects: computed(() => core.allEffects),
    timedEffects: computed(() => core.timedEffects),
    hasTimedEffects: computed(() => core.hasTimedEffects),
    count: computed(() => core.count),
    initialize: core.initialize,
    dispose: core.dispose,
    refresh: core.refresh,
    applyRuntimeEvent: (event: GameToggleRuntimeEvent) =>
      core.applyRuntimeEvent(toCoreEvent(event)),
    upsert: core.upsert,
    upsertMany: core.upsertMany,
    patch: core.patch,
    remove: core.remove,
    removeMany: core.removeMany,
    clear: core.clear,
    resetForTests: core.resetForTests,
    moveBefore: core.moveBefore,
    moveAfter: core.moveAfter,
    allToggles: computed(() => core.allEffects.map(fromCore).filter(Boolean) as GameToggleRecord[]),
    timedToggles: computed(
      () => core.timedEffects.map(fromCore).filter(Boolean) as GameToggleRecord[],
    ),
    hasTimedToggles: computed(() => core.hasTimedEffects),
    record: (id: string) => fromCore(core.record(id)),
    upsertToggle: (record: GameToggleRecord, nextRevision?: number) =>
      core.upsert(toCore(record), nextRevision),
    upsertToggles: (records: readonly GameToggleRecord[], nextRevision?: number) =>
      core.upsertMany(records.map(toCore), nextRevision),
    patchToggle: (
      id: string,
      patch: import('@/views/game/types/gameToggles').GameTogglePatch,
      nextRevision?: number,
    ) => core.patch(id, patch, nextRevision),
    removeToggle: (id: string, nextRevision?: number) => core.remove(id, nextRevision),
    removeToggles: (ids: readonly string[], nextRevision?: number) =>
      core.removeMany(ids, nextRevision),
    clearToggles: (nextRevision?: number) => core.clear(nextRevision),
    setEndTime: (id: string, endsAtMs: number | null, nextRevision?: number) =>
      core.setEndTime(id, endsAtMs, nextRevision),
    setRemainingTime: (id: string, durationMs: number, nowMs?: number, nextRevision?: number) =>
      core.setRemainingTime(id, durationMs, nowMs, nextRevision),
    adjustEndTime: (id: string, deltaMs: number, nextRevision?: number) =>
      core.adjustEndTime(id, deltaMs, nextRevision),
    expireDueToggles: (nowMs?: number) => core.expireDue(nowMs),
    expireDue: (nowMs?: number) => core.expireDue(nowMs),
    replaceSnapshot: (snapshot: GameToggleSnapshot) =>
      core.replaceSnapshot({ revision: snapshot.revision, effects: snapshot.toggles.map(toCore) }),
  }
})
export function useGameToggleDomain() {
  return useGameTogglesStore()
}
