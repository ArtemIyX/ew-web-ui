import { computed, ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import type {
  GameStatusEffectPatch,
  GameStatusEffectRecord,
  GameStatusEffectRuntimeEvent,
  GameStatusEffectSnapshot,
} from '@/views/game/types/gameStatusEffects'
import {
  cloneStatusEffect,
  validateStatusEffectRecord,
  validateStatusEffectSnapshot,
} from '@/services/game/statusEffects/gameStatusEffectValidation'

export type StatusEffectStoreStatus = 'idle' | 'loading' | 'ready' | 'stale' | 'error'

export interface GameStatusEffectGateway<Id extends string> {
  load(): Promise<GameStatusEffectSnapshot<Id>>
  subscribe(listener: (event: GameStatusEffectRuntimeEvent<Id>) => void): () => void
}

export interface GameStatusEffectStore<Id extends string> {
  status: { value: StatusEffectStoreStatus }
  revision: { value: number }
  lastError: { value: string | null }
  lastUpdatedAtMs: { value: number | null }
  allEffects: ComputedRef<readonly GameStatusEffectRecord<Id>[]>
  timedEffects: ComputedRef<readonly GameStatusEffectRecord<Id>[]>
  hasTimedEffects: ComputedRef<boolean>
  count: ComputedRef<number>
  initialize: (options?: { force?: boolean }) => Promise<void>
  dispose: () => void
  refresh: () => Promise<void>
  replaceSnapshot: (snapshot: GameStatusEffectSnapshot<Id>) => boolean
  applyRuntimeEvent: (
    event: GameStatusEffectRuntimeEvent<Id>,
  ) => 'applied' | 'ignored' | 'needs-resync'
  record: (id: Id) => GameStatusEffectRecord<Id> | undefined
  upsert: (record: GameStatusEffectRecord<Id>, nextRevision?: number) => boolean
  upsertMany: (records: readonly GameStatusEffectRecord<Id>[], nextRevision?: number) => boolean
  patch: (id: Id, patch: GameStatusEffectPatch, nextRevision?: number) => boolean
  remove: (id: Id, nextRevision?: number) => boolean
  removeMany: (ids: readonly Id[], nextRevision?: number) => boolean
  clear: (nextRevision?: number) => boolean
  setEndTime: (id: Id, endsAtMs: number | null, nextRevision?: number) => boolean
  setRemainingTime: (id: Id, durationMs: number, nowMs?: number, nextRevision?: number) => boolean
  adjustEndTime: (id: Id, deltaMs: number, nextRevision?: number) => boolean
  expireDue: (nowMs?: number) => readonly Id[]
  moveBefore: (id: Id, targetId: Id, nextRevision?: number) => boolean
  moveAfter: (id: Id, targetId: Id, nextRevision?: number) => boolean
  resetForTests: () => void
}

export function createGameStatusEffectStore<Id extends string>(
  storeId: string,
  getGateway: () => GameStatusEffectGateway<Id>,
) {
  return defineStore(storeId, () => {
    const status = ref<StatusEffectStoreStatus>('idle')
    const revision = ref(0)
    const records = ref<Record<Id, GameStatusEffectRecord<Id>>>(
      {} as Record<Id, GameStatusEffectRecord<Id>>,
    )
    const lastError = ref<string | null>(null)
    const lastUpdatedAtMs = ref<number | null>(null)
    let gateway: GameStatusEffectGateway<Id> | undefined
    let unsubscribe: (() => void) | undefined
    let initialization: Promise<void> | undefined
    let resync: Promise<void> | undefined
    let lifecycleToken = 0

    const allEffects = computed<GameStatusEffectRecord<Id>[]>(() =>
      (Object.values(records.value) as GameStatusEffectRecord<Id>[])
        .sort(
          (first, second) =>
            first.order - second.order ||
            first.appliedAtMs - second.appliedAtMs ||
            first.id.localeCompare(second.id),
        ),
    )
    const timedEffects = computed<GameStatusEffectRecord<Id>[]>(() =>
      allEffects.value.filter((effect) => effect.endsAtMs !== null),
    )
    const hasTimedEffects = computed(() => timedEffects.value.length > 0)
    const count = computed(() => allEffects.value.length)

    function commitSnapshot(snapshot: GameStatusEffectSnapshot<Id>): boolean {
      const validated = validateStatusEffectSnapshot(snapshot)
      if (!validated.ok) {
        lastError.value = 'invalid-record'
        return false
      }
      if (validated.value.revision < revision.value) return false
      records.value = Object.fromEntries(
        validated.value.effects.map((effect) => [effect.id, effect]),
      ) as Record<Id, GameStatusEffectRecord<Id>>
      revision.value = validated.value.revision
      status.value = 'ready'
      lastError.value = null
      lastUpdatedAtMs.value = Date.now()
      return true
    }

    async function load(
      activeGateway: GameStatusEffectGateway<Id>,
      token: number,
    ): Promise<boolean> {
      const snapshot = await activeGateway.load()
      if (token !== lifecycleToken || activeGateway !== gateway) return false
      if (!commitSnapshot(snapshot)) throw new Error(lastError.value ?? 'invalid-record')
      return true
    }

    async function resyncFromGateway(): Promise<void> {
      if (!gateway || resync) return resync
      const activeGateway = gateway
      const token = lifecycleToken
      resync = load(activeGateway, token)
        .then(() => undefined)
        .catch((error: unknown) => {
          status.value = 'error'
          lastError.value = error instanceof Error ? error.message : 'load-failed'
        })
        .finally(() => {
          resync = undefined
        })
      return resync
    }

    async function initialize(options: { force?: boolean } = {}): Promise<void> {
      if (initialization && !options.force) return initialization
      if (status.value === 'ready' && !options.force) return
      if (options.force) {
        lifecycleToken += 1
        unsubscribe?.()
        unsubscribe = undefined
        gateway = undefined
      }
      const token = lifecycleToken
      const pending = (async () => {
        status.value = 'loading'
        const activeGateway = getGateway()
        gateway = activeGateway
        try {
          if (await load(activeGateway, token))
            unsubscribe = activeGateway.subscribe(applyRuntimeEventFromSubscription)
        } catch (error: unknown) {
          if (token !== lifecycleToken) return
          status.value = 'error'
          lastError.value = error instanceof Error ? error.message : 'load-failed'
        }
      })().finally(() => {
        if (initialization === pending) initialization = undefined
      })
      initialization = pending
      return pending
    }

    function applyRuntimeEventFromSubscription(event: GameStatusEffectRuntimeEvent<Id>): void {
      if (applyRuntimeEvent(event) === 'needs-resync') void resyncFromGateway()
    }

    function applyRuntimeEvent(
      event: GameStatusEffectRuntimeEvent<Id>,
    ): 'applied' | 'ignored' | 'needs-resync' {
      if (event.kind === 'snapshot') return replaceSnapshot(event.snapshot) ? 'applied' : 'ignored'
      if (event.revision <= revision.value) return 'ignored'
      if (event.revision !== revision.value + 1) {
        status.value = 'stale'
        lastError.value = 'revision-gap'
        return 'needs-resync'
      }
      if (event.kind === 'clear') records.value = {} as Record<Id, GameStatusEffectRecord<Id>>
      else if (event.kind === 'remove') {
        const next = { ...records.value }
        delete next[event.id]
        records.value = next
      } else {
        const validated = validateStatusEffectRecord(event.record)
        if (!validated.ok) {
          lastError.value = 'invalid-record'
          return 'ignored'
        }
        records.value = { ...records.value, [event.record.id]: validated.value }
      }
      revision.value = event.revision
      status.value = 'ready'
      lastError.value = null
      lastUpdatedAtMs.value = Date.now()
      return 'applied'
    }

    function replaceSnapshot(snapshot: GameStatusEffectSnapshot<Id>): boolean {
      return commitSnapshot(snapshot)
    }
    function applyLocal(
      next: readonly GameStatusEffectRecord<Id>[],
      nextRevision = revision.value + 1,
    ): boolean {
      if (!Number.isInteger(nextRevision) || nextRevision < revision.value) {
        lastError.value = 'invalid-revision'
        return false
      }
      return commitSnapshot({ revision: nextRevision, effects: next })
    }
    function record(id: Id): GameStatusEffectRecord<Id> | undefined {
      return records.value[id] ? cloneStatusEffect(records.value[id]) : undefined
    }
    function upsert(recordValue: GameStatusEffectRecord<Id>, nextRevision?: number): boolean {
      return upsertMany([recordValue], nextRevision)
    }
    function upsertMany(
      values: readonly GameStatusEffectRecord<Id>[],
      nextRevision = revision.value + 1,
    ): boolean {
      const next = { ...records.value }
      const ids = new Set<Id>()
      for (const value of values) {
        if (ids.has(value.id) || !validateStatusEffectRecord(value).ok) {
          lastError.value = ids.has(value.id) ? 'duplicate-id' : 'invalid-record'
          return false
        }
        ids.add(value.id)
        next[value.id] = value
      }
      return applyLocal(Object.values(next), nextRevision)
    }
    function patch(id: Id, patchValue: GameStatusEffectPatch, nextRevision?: number): boolean {
      const current = records.value[id]
      if (!current) return false
      return upsert(
        {
          ...current,
          definition: {
            ...current.definition,
            ...patchValue.definition,
            skillId: current.definition.skillId,
          },
          appliedAtMs: patchValue.appliedAtMs ?? current.appliedAtMs,
          endsAtMs: patchValue.endsAtMs === undefined ? current.endsAtMs : patchValue.endsAtMs,
          order: patchValue.order ?? current.order,
        },
        nextRevision,
      )
    }
    function remove(id: Id, nextRevision?: number): boolean {
      if (!records.value[id]) return false
      return removeMany([id], nextRevision)
    }
    function removeMany(ids: readonly Id[], nextRevision = revision.value + 1): boolean {
      if (new Set(ids).size !== ids.length || ids.some((id) => !records.value[id])) {
        lastError.value = new Set(ids).size !== ids.length ? 'duplicate-id' : 'unknown-effect'
        return false
      }
      const next = { ...records.value }
      for (const id of ids) delete next[id]
      return applyLocal(Object.values(next), nextRevision)
    }
    function clear(nextRevision?: number): boolean {
      return applyLocal([], nextRevision)
    }
    function setEndTime(id: Id, endsAtMs: number | null, nextRevision?: number): boolean {
      return patch(id, { endsAtMs }, nextRevision)
    }
    function setRemainingTime(
      id: Id,
      durationMs: number,
      nowMs = Date.now(),
      nextRevision?: number,
    ): boolean {
      if (!Number.isFinite(durationMs) || durationMs < 0 || !Number.isFinite(nowMs)) return false
      return setEndTime(id, nowMs + durationMs, nextRevision)
    }
    function adjustEndTime(id: Id, deltaMs: number, nextRevision?: number): boolean {
      const current = records.value[id]
      return current && current.endsAtMs !== null && Number.isFinite(deltaMs)
        ? setEndTime(id, current.endsAtMs + deltaMs, nextRevision)
        : false
    }
    function expireDue(nowMs = Date.now()): readonly Id[] {
      const expired = allEffects.value
        .filter((effect) => effect.endsAtMs !== null && effect.endsAtMs <= nowMs)
        .map((effect) => effect.id)
      if (!expired.length) return []
      const next = { ...records.value }
      expired.forEach((id) => delete next[id])
      records.value = next
      lastUpdatedAtMs.value = nowMs
      return expired
    }
    function move(
      id: Id,
      targetId: Id,
      after: boolean,
      nextRevision = revision.value + 1,
    ): boolean {
      if (!records.value[id] || !records.value[targetId] || id === targetId) return false
      const ordered = allEffects.value.filter((effect) => effect.id !== id)
      const targetIndex = ordered.findIndex((effect) => effect.id === targetId)
      ordered.splice(targetIndex + (after ? 1 : 0), 0, records.value[id])
      return applyLocal(
        ordered.map((effect, index) => ({ ...effect, order: index })),
        nextRevision,
      )
    }
    function moveBefore(id: Id, targetId: Id, nextRevision?: number): boolean {
      return move(id, targetId, false, nextRevision)
    }
    function moveAfter(id: Id, targetId: Id, nextRevision?: number): boolean {
      return move(id, targetId, true, nextRevision)
    }
    function dispose(): void {
      lifecycleToken += 1
      unsubscribe?.()
      unsubscribe = undefined
      gateway = undefined
      initialization = undefined
      resync = undefined
    }
    async function refresh(): Promise<void> {
      await initialize({ force: true })
    }
    function resetForTests(): void {
      dispose()
      status.value = 'idle'
      revision.value = 0
      records.value = {} as Record<Id, GameStatusEffectRecord<Id>>
      lastError.value = null
      lastUpdatedAtMs.value = null
    }

    return {
      status,
      revision,
      records,
      lastError,
      lastUpdatedAtMs,
      allEffects,
      timedEffects,
      hasTimedEffects,
      count,
      initialize,
      dispose,
      refresh,
      replaceSnapshot,
      applyRuntimeEvent,
      record,
      upsert,
      upsertMany,
      patch,
      remove,
      removeMany,
      clear,
      setEndTime,
      setRemainingTime,
      adjustEndTime,
      expireDue,
      moveBefore,
      moveAfter,
      resetForTests,
    }
  })
}
