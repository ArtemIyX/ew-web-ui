import { computed, ref, shallowRef, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import type {
  BuffId,
  GameBuffPatch,
  GameBuffRecord,
  GameBuffRuntimeEvent,
  GameBuffSnapshot,
} from '@/views/game/types/gameBuffs'
import { getGameBuffGateway } from '@/services/game/buffs/gameBuffService'
import type { GameBuffGateway } from '@/services/game/buffs/gameBuffGateway'
import {
  cloneGameBuff,
  validateGameBuffRecord,
  validateGameBuffSnapshot,
} from '@/services/game/buffs/gameBuffValidation'

export type GameBuffStoreStatus = 'idle' | 'loading' | 'ready' | 'stale' | 'error'

export const useGameBuffsStore = defineStore('game-buffs', () => {
  const status = ref<GameBuffStoreStatus>('idle')
  const revision = ref(0)
  const records = ref<Record<BuffId, GameBuffRecord>>({})
  const lastError = ref<string | null>(null)
  const lastUpdatedAtMs = ref<number | null>(null)
  const gateway = shallowRef<GameBuffGateway | null>(null)
  let unsubscribe: (() => void) | undefined
  let initialization: Promise<void> | undefined
  let resync: Promise<void> | undefined

  const allBuffs: ComputedRef<readonly GameBuffRecord[]> = computed(() =>
    Object.values(records.value)
      .sort(
        (first, second) =>
          first.order - second.order ||
          first.appliedAtMs - second.appliedAtMs ||
          first.buffId.localeCompare(second.buffId),
      )
      .map(cloneGameBuff),
  )
  const timedBuffs = computed(() => allBuffs.value.filter((buff) => buff.endsAtMs !== null))
  const hasTimedBuffs = computed(() => timedBuffs.value.length > 0)
  const count = computed(() => allBuffs.value.length)

  function setError(error: string): void {
    lastError.value = error
  }

  function commitSnapshot(snapshot: GameBuffSnapshot): boolean {
    const validated = validateGameBuffSnapshot(snapshot)
    if (!validated.ok) {
      setError('invalid-buff')
      return false
    }
    if (validated.value.revision < revision.value) return false
    records.value = Object.fromEntries(
      validated.value.buffs.map((buff) => [buff.buffId, cloneGameBuff(buff)]),
    )
    revision.value = validated.value.revision
    lastUpdatedAtMs.value = Date.now()
    lastError.value = null
    status.value = 'ready'
    return true
  }

  function applyLocalRecords(
    nextRecords: readonly GameBuffRecord[],
    nextRevision = revision.value + 1,
  ): boolean {
    if (!Number.isInteger(nextRevision) || nextRevision < revision.value) {
      setError('invalid-revision')
      return false
    }
    return commitSnapshot({ revision: nextRevision, buffs: nextRecords })
  }

  async function loadFromGateway(activeGateway: GameBuffGateway): Promise<void> {
    const snapshot = await activeGateway.load()
    if (!commitSnapshot(snapshot)) throw new Error(lastError.value ?? 'invalid-buff')
  }

  async function resyncFromGateway(): Promise<void> {
    if (!gateway.value || resync) return resync
    const activeGateway = gateway.value
    resync = loadFromGateway(activeGateway)
      .then(() => undefined)
      .catch((error: unknown) => {
        status.value = 'error'
        setError(error instanceof Error ? error.message : 'load-failed')
      })
      .finally(() => {
        resync = undefined
      })
    return resync
  }

  function onRuntimeEvent(event: GameBuffRuntimeEvent): void {
    const result = applyRuntimeEvent(event)
    if (result === 'needs-resync') void resyncFromGateway()
  }

  async function initialize(options: { force?: boolean } = {}): Promise<void> {
    if (initialization && !options.force) return initialization
    if (status.value === 'ready' && !options.force) return
    initialization = (async () => {
      status.value = 'loading'
      const activeGateway = getGameBuffGateway()
      gateway.value = activeGateway
      try {
        await loadFromGateway(activeGateway)
        unsubscribe?.()
        unsubscribe = activeGateway.subscribe(onRuntimeEvent)
      } catch (error: unknown) {
        status.value = 'error'
        setError(error instanceof Error ? error.message : 'load-failed')
      }
    })().finally(() => {
      initialization = undefined
    })
    return initialization
  }

  function dispose(): void {
    unsubscribe?.()
    unsubscribe = undefined
    gateway.value = null
    initialization = undefined
    resync = undefined
  }

  async function refresh(): Promise<void> {
    await initialize({ force: true })
  }

  function replaceSnapshot(snapshot: GameBuffSnapshot): boolean {
    return commitSnapshot(snapshot)
  }

  function applyRuntimeEvent(event: GameBuffRuntimeEvent): 'applied' | 'ignored' | 'needs-resync' {
    if (event.kind === 'snapshot') return replaceSnapshot(event.snapshot) ? 'applied' : 'ignored'
    if (event.revision <= revision.value) return 'ignored'
    if (event.revision !== revision.value + 1) {
      status.value = 'stale'
      setError('revision-gap')
      return 'needs-resync'
    }
    if (event.kind === 'clear') {
      records.value = {}
      revision.value = event.revision
      lastUpdatedAtMs.value = Date.now()
      status.value = 'ready'
      lastError.value = null
      return 'applied'
    }
    if (event.kind === 'remove') {
      const next = { ...records.value }
      delete next[event.buffId]
      records.value = next
      revision.value = event.revision
      lastUpdatedAtMs.value = Date.now()
      status.value = 'ready'
      lastError.value = null
      return 'applied'
    }
    const validated = validateGameBuffRecord(event.buff)
    if (!validated.ok) {
      setError('invalid-buff')
      return 'ignored'
    }
    records.value = { ...records.value, [event.buff.buffId]: cloneGameBuff(event.buff) }
    revision.value = event.revision
    lastUpdatedAtMs.value = Date.now()
    status.value = 'ready'
    lastError.value = null
    return 'applied'
  }

  function record(buffId: BuffId): Readonly<GameBuffRecord> | undefined {
    const value = records.value[buffId]
    return value ? cloneGameBuff(value) : undefined
  }

  function upsertBuff(buff: GameBuffRecord, nextRevision = revision.value + 1): boolean {
    return upsertBuffs([buff], nextRevision)
  }

  function upsertBuffs(
    buffList: readonly GameBuffRecord[],
    nextRevision = revision.value + 1,
  ): boolean {
    const next = { ...records.value }
    const batchIds = new Set<BuffId>()
    for (const buff of buffList) {
      if (batchIds.has(buff.buffId)) {
        setError('invalid-buff')
        return false
      }
      batchIds.add(buff.buffId)
      const validated = validateGameBuffRecord(buff)
      if (!validated.ok) {
        setError('invalid-buff')
        return false
      }
      next[buff.buffId] = cloneGameBuff(buff)
    }
    return applyLocalRecords(Object.values(next), nextRevision)
  }

  function patchBuff(
    buffId: BuffId,
    patch: GameBuffPatch,
    nextRevision = revision.value + 1,
  ): boolean {
    const current = records.value[buffId]
    if (!current) return false
    const next = { ...current, definition: { ...current.definition, ...patch.definition } }
    next.definition.skillId = current.definition.skillId
    if (patch.appliedAtMs !== undefined) next.appliedAtMs = patch.appliedAtMs
    if (patch.endsAtMs !== undefined) next.endsAtMs = patch.endsAtMs
    if (patch.order !== undefined) next.order = patch.order
    return upsertBuff(next, nextRevision)
  }

  function removeBuff(buffId: BuffId, nextRevision = revision.value + 1): boolean {
    if (!records.value[buffId]) return false
    const next = { ...records.value }
    delete next[buffId]
    return applyLocalRecords(Object.values(next), nextRevision)
  }

  function removeBuffs(buffIds: readonly BuffId[], nextRevision = revision.value + 1): boolean {
    const next = { ...records.value }
    if (buffIds.some((buffId) => !next[buffId])) return false
    buffIds.forEach((buffId) => delete next[buffId])
    return applyLocalRecords(Object.values(next), nextRevision)
  }

  function moveBuff(buffId: BuffId, targetId: BuffId, after: boolean): boolean {
    if (!records.value[buffId] || !records.value[targetId] || buffId === targetId) return false
    const ordered = allBuffs.value.filter((buff) => buff.buffId !== buffId)
    const targetIndex = ordered.findIndex((buff) => buff.buffId === targetId)
    ordered.splice(targetIndex + (after ? 1 : 0), 0, records.value[buffId]!)
    return applyLocalRecords(ordered.map((buff, index) => ({ ...buff, order: index })))
  }

  function clearBuffs(nextRevision = revision.value + 1): boolean {
    return applyLocalRecords([], nextRevision)
  }

  function setEndTime(
    buffId: BuffId,
    endsAtMs: number | null,
    nextRevision = revision.value + 1,
  ): boolean {
    return patchBuff(buffId, { endsAtMs }, nextRevision)
  }

  function setRemainingTime(
    buffId: BuffId,
    durationMs: number,
    nowMs = Date.now(),
    nextRevision = revision.value + 1,
  ): boolean {
    if (!Number.isFinite(durationMs) || durationMs < 0 || !Number.isFinite(nowMs)) return false
    return setEndTime(buffId, nowMs + durationMs, nextRevision)
  }

  function adjustEndTime(
    buffId: BuffId,
    deltaMs: number,
    nextRevision = revision.value + 1,
  ): boolean {
    const current = records.value[buffId]
    if (!current || current.endsAtMs === null || !Number.isFinite(deltaMs)) return false
    return setEndTime(buffId, current.endsAtMs + deltaMs, nextRevision)
  }

  function expireDueBuffs(nowMs = Date.now()): readonly BuffId[] {
    const expired = allBuffs.value.filter(
      (buff) => buff.endsAtMs !== null && buff.endsAtMs <= nowMs,
    )
    if (expired.length === 0) return []
    const next = { ...records.value }
    expired.forEach((buff) => delete next[buff.buffId])
    records.value = next
    lastUpdatedAtMs.value = nowMs
    return expired.map((buff) => buff.buffId)
  }

  function resetForTests(): void {
    dispose()
    status.value = 'idle'
    revision.value = 0
    records.value = {}
    lastError.value = null
    lastUpdatedAtMs.value = null
  }

  return {
    status,
    revision,
    records,
    lastError,
    lastUpdatedAtMs,
    allBuffs,
    timedBuffs,
    hasTimedBuffs,
    count,
    initialize,
    dispose,
    refresh,
    replaceSnapshot,
    applyRuntimeEvent,
    record,
    upsertBuff,
    upsertBuffs,
    patchBuff,
    removeBuff,
    removeBuffs,
    moveBefore: (buffId: BuffId, targetId: BuffId) => moveBuff(buffId, targetId, false),
    moveAfter: (buffId: BuffId, targetId: BuffId) => moveBuff(buffId, targetId, true),
    clearBuffs,
    setEndTime,
    setRemainingTime,
    adjustEndTime,
    expireDueBuffs,
    resetForTests,
  }
})
