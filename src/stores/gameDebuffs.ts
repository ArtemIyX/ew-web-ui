import { computed } from 'vue'
import { defineStore } from 'pinia'
import { createGameStatusEffectStore } from './statusEffects/createGameStatusEffectStore'
import { getGameDebuffGateway } from '@/services/game/debuffs/gameDebuffService'
import type {
  GameDebuffRecord,
  GameDebuffRuntimeEvent,
  GameDebuffSnapshot,
} from '@/views/game/types/gameDebuffs'
import type {
  GameStatusEffectRuntimeEvent,
  GameStatusEffectSnapshot,
} from '@/views/game/types/gameStatusEffects'

function toCore(record: GameDebuffRecord) {
  return {
    id: record.debuffId,
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
        definition: GameDebuffRecord['definition']
        appliedAtMs: number
        endsAtMs: number | null
        order: number
      }
    | undefined,
) {
  return record
    ? {
        debuffId: record.id,
        definition: record.definition,
        appliedAtMs: record.appliedAtMs,
        endsAtMs: record.endsAtMs,
        order: record.order,
      }
    : undefined
}
function toCoreEvent(event: GameDebuffRuntimeEvent): GameStatusEffectRuntimeEvent {
  if (event.kind === 'snapshot')
    return {
      kind: 'snapshot',
      snapshot: { revision: event.snapshot.revision, effects: event.snapshot.debuffs.map(toCore) },
    }
  if (event.kind === 'upsert')
    return { kind: 'upsert', revision: event.revision, record: toCore(event.debuff) }
  if (event.kind === 'remove')
    return { kind: 'remove', revision: event.revision, id: event.debuffId }
  return event
}
const useGameDebuffCoreStore = createGameStatusEffectStore('game-debuffs-core', () => ({
  load: async () => {
    const snapshot = await getGameDebuffGateway().load()
    return { revision: snapshot.revision, effects: snapshot.debuffs.map(toCore) }
  },
  subscribe: (listener: (event: GameStatusEffectRuntimeEvent) => void) =>
    getGameDebuffGateway().subscribe((event) => listener(toCoreEvent(event))),
}))
export const useGameDebuffsStore = defineStore('game-debuffs', () => {
  const core = useGameDebuffCoreStore()
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
    applyRuntimeEvent: (event: GameDebuffRuntimeEvent) =>
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
    allDebuffs: computed(() => core.allEffects.map(fromCore).filter(Boolean) as GameDebuffRecord[]),
    timedDebuffs: computed(
      () => core.timedEffects.map(fromCore).filter(Boolean) as GameDebuffRecord[],
    ),
    hasTimedDebuffs: computed(() => core.hasTimedEffects),
    record: (id: string) => fromCore(core.record(id)),
    upsertDebuff: (record: GameDebuffRecord, nextRevision?: number) =>
      core.upsert(toCore(record), nextRevision),
    upsertDebuffs: (records: readonly GameDebuffRecord[], nextRevision?: number) =>
      core.upsertMany(records.map(toCore), nextRevision),
    patchDebuff: (
      id: string,
      patch: import('@/views/game/types/gameDebuffs').GameDebuffPatch,
      nextRevision?: number,
    ) => core.patch(id, patch, nextRevision),
    removeDebuff: (id: string, nextRevision?: number) => core.remove(id, nextRevision),
    removeDebuffs: (ids: readonly string[], nextRevision?: number) =>
      core.removeMany(ids, nextRevision),
    clearDebuffs: (nextRevision?: number) => core.clear(nextRevision),
    setEndTime: (id: string, endsAtMs: number | null, nextRevision?: number) =>
      core.setEndTime(id, endsAtMs, nextRevision),
    setRemainingTime: (id: string, durationMs: number, nowMs?: number, nextRevision?: number) =>
      core.setRemainingTime(id, durationMs, nowMs, nextRevision),
    adjustEndTime: (id: string, deltaMs: number, nextRevision?: number) =>
      core.adjustEndTime(id, deltaMs, nextRevision),
    expireDueDebuffs: (nowMs?: number) => core.expireDue(nowMs),
    expireDue: (nowMs?: number) => core.expireDue(nowMs),
    replaceSnapshot: (snapshot: GameDebuffSnapshot) =>
      core.replaceSnapshot({ revision: snapshot.revision, effects: snapshot.debuffs.map(toCore) }),
  }
})
export function useGameDebuffDomain() {
  return useGameDebuffsStore()
}
