import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useGameBuffsStore } from '@/stores/gameBuffs'
import type { GameBuffStoreStatus } from '@/stores/gameBuffs'
import { useWindowManagerStore } from '@/stores/windowManager'
import { watch } from 'vue'
import {
  BUFF_LIST_WINDOW_ID,
  type BuffId,
  type GameBuffDefinition,
  type GameBuffPatch,
  type GameBuffRecord,
  type GameBuffRuntimeEvent,
  type GameBuffSnapshot,
} from '@/views/game/types/gameBuffs'
import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { validateGameBuffRecord, validateGameBuffSnapshot } from './gameBuffValidation'

export type GameBuffCommandError =
  | 'developer-mutations-disabled'
  | 'duplicate-id'
  | 'invalid-buff'
  | 'invalid-duration'
  | 'invalid-revision'
  | 'unknown-buff'
  | 'window-unavailable'

export type GameBuffCommandResult<T = undefined> =
  | { ok: true; revision: number; value: T }
  | { ok: false; error: GameBuffCommandError; path?: string }

export interface AddGameBuffInput {
  buffId: BuffId
  definition: GameBuffDefinition
  appliedAtMs?: number
  endsAtMs?: number | null
  order?: number
}

export interface GameBuffDeveloperApi {
  replaceSnapshot(snapshot: GameBuffSnapshot): GameBuffCommandResult
  addBuff(input: AddGameBuffInput): GameBuffCommandResult<GameBuffRecord>
  upsertBuff(record: GameBuffRecord): GameBuffCommandResult<GameBuffRecord>
  upsertBuffs(records: readonly GameBuffRecord[]): GameBuffCommandResult
  patchBuff(buffId: BuffId, patch: GameBuffPatch): GameBuffCommandResult<GameBuffRecord>
  removeBuff(buffId: BuffId): GameBuffCommandResult
  clearBuffs(): GameBuffCommandResult
  setEndTime(buffId: BuffId, endsAtMs: number | null): GameBuffCommandResult
  setRemainingTime(buffId: BuffId, durationMs: number, nowMs?: number): GameBuffCommandResult
  adjustEndTime(buffId: BuffId, deltaMs: number): GameBuffCommandResult
  makePermanent(buffId: BuffId): GameBuffCommandResult
  expireNow(buffId: BuffId, nowMs?: number): GameBuffCommandResult
  setOrder(buffId: BuffId, order: number): GameBuffCommandResult
  getBuff(buffId: BuffId): Readonly<GameBuffRecord> | null
  getSnapshot(): GameBuffSnapshot
  listBuffs(): readonly GameBuffRecord[]
  listTimedBuffs(): readonly GameBuffRecord[]
  list(): readonly GameBuffRecord[]
  listPermanent(): readonly GameBuffRecord[]
  listPermanentBuffs(): readonly GameBuffRecord[]
  remove(buffId: BuffId): GameBuffCommandResult
  has(buffId: BuffId): boolean
  getStatus(): {
    status: GameBuffStoreStatus
    revision: number
    count: number
    lastError: string | null
    lastUpdatedAtMs: number | null
  }
  getRevision(): number
  getWindowState(): Readonly<{
    id: string
    open: boolean
    zOrder: number
    props: Record<string, unknown>
  }> | null
  removeMany(buffIds: readonly BuffId[]): GameBuffCommandResult
  setDefinition(
    buffId: BuffId,
    definition: Partial<Omit<GameBuffDefinition, 'skillId'>>,
  ): GameBuffCommandResult
  setIcon(buffId: BuffId, icon: GameBuffDefinition['icon']): GameBuffCommandResult
  setName(buffId: BuffId, name: GameBuffDefinition['name']): GameBuffCommandResult
  setDescription(
    buffId: BuffId,
    description: GameBuffDefinition['description'],
  ): GameBuffCommandResult
  setLevel(buffId: BuffId, level: number): GameBuffCommandResult
  setFacts(buffId: BuffId, facts: GameBuffDefinition['facts']): GameBuffCommandResult
  setUpgrades(buffId: BuffId, upgrades: GameBuffDefinition['upgrades']): GameBuffCommandResult
  setAppliedAt(buffId: BuffId, appliedAtMs: number): GameBuffCommandResult
  expireDue(nowMs?: number): GameBuffCommandResult<readonly BuffId[]>
  restartDuration(buffId: BuffId, durationMs: number, nowMs?: number): GameBuffCommandResult
  moveBefore(buffId: BuffId, targetId: BuffId): GameBuffCommandResult
  moveAfter(buffId: BuffId, targetId: BuffId): GameBuffCommandResult
  applyRuntimeEvent(event: GameBuffRuntimeEvent): GameBuffCommandResult<string>
  subscribe(listener: (snapshot: GameBuffSnapshot) => void): () => void
  openWindow(): GameBuffCommandResult
  closeWindow(): GameBuffCommandResult
  focusWindow(): GameBuffCommandResult
  isWindowOpen(): boolean
  resetWindowLayout(): GameBuffCommandResult
  setDebugMetadataVisible(visible: boolean): GameBuffCommandResult
}

export interface GameBuffDeveloperApiDependencies {
  store?: ReturnType<typeof useGameBuffsStore>
  windowStore?: ReturnType<typeof useWindowManagerStore>
  shortcutsStore?: ReturnType<typeof useGameShortcutsStore>
  now?: () => number
  allowMutations?: () => boolean
}

function error(error: GameBuffCommandError, path?: string): GameBuffCommandResult<never> {
  return path ? { ok: false, error, path } : { ok: false, error }
}

export function createGameBuffDeveloperApi(
  dependencies: GameBuffDeveloperApiDependencies = {},
): GameBuffDeveloperApi {
  const store = dependencies.store ?? useGameBuffsStore()
  const windowStore = dependencies.windowStore ?? useWindowManagerStore()
  const shortcutsStore = dependencies.shortcutsStore ?? useGameShortcutsStore()
  const now = dependencies.now ?? Date.now
  const allowMutations =
    dependencies.allowMutations ??
    (() =>
      import.meta.env.DEV || runtimeIntegrationMode.get() === RuntimeIntegrationMode.Disconnected)
  const listeners = new Set<(snapshot: GameBuffSnapshot) => void>()

  function result<T>(value: T): GameBuffCommandResult<T> {
    return { ok: true, revision: store.revision, value }
  }

  function canMutate(): GameBuffCommandResult<never> | undefined {
    return allowMutations() ? undefined : error('developer-mutations-disabled')
  }

  function notify(): void {
    const snapshot = getSnapshot()
    listeners.forEach((listener) => listener(snapshot))
  }

  function changed<T>(value: T): GameBuffCommandResult<T> {
    return result(value)
  }

  watch(
    () => store.revision,
    () => notify(),
    { flush: 'sync' },
  )

  function getSnapshot(): GameBuffSnapshot {
    return {
      revision: store.revision,
      buffs: store.allBuffs.map((buff) => structuredClone(buff)),
    }
  }

  function invalidRecord(record: GameBuffRecord): GameBuffCommandResult<never> {
    const validation = validateGameBuffRecord(record)
    return validation.ok ? error('invalid-buff') : error('invalid-buff', validation.issues[0]?.path)
  }

  function replaceSnapshot(snapshot: GameBuffSnapshot): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    if (!validateGameBuffSnapshot(snapshot).ok) return error('invalid-buff')
    if (!store.replaceSnapshot(snapshot)) return error('invalid-revision')
    return changed(undefined)
  }

  function addBuff(input: AddGameBuffInput): GameBuffCommandResult<GameBuffRecord> {
    const guard = canMutate()
    if (guard) return guard
    if (store.record(input.buffId)) return error('duplicate-id')
    const orders = store.allBuffs.map((buff) => buff.order)
    const record: GameBuffRecord = {
      buffId: input.buffId,
      definition: structuredClone(input.definition),
      appliedAtMs: input.appliedAtMs ?? now(),
      endsAtMs: input.endsAtMs ?? null,
      order: input.order ?? (orders.length ? Math.max(...orders) + 1 : 0),
    }
    if (!validateGameBuffRecord(record).ok) return invalidRecord(record)
    return store.upsertBuff(record) ? changed(structuredClone(record)) : error('invalid-buff')
  }

  function upsertBuff(record: GameBuffRecord): GameBuffCommandResult<GameBuffRecord> {
    const guard = canMutate()
    if (guard) return guard
    if (!validateGameBuffRecord(record).ok) return invalidRecord(record)
    return store.upsertBuff(record) ? changed(structuredClone(record)) : error('invalid-buff')
  }

  function upsertBuffs(records: readonly GameBuffRecord[]): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    const invalid = records.find((record) => !validateGameBuffRecord(record).ok)
    if (invalid) return invalidRecord(invalid)
    return store.upsertBuffs(records) ? changed(undefined) : error('invalid-buff')
  }

  function patchBuff(buffId: BuffId, patch: GameBuffPatch): GameBuffCommandResult<GameBuffRecord> {
    const guard = canMutate()
    if (guard) return guard
    const current = store.record(buffId)
    if (!current) return error('unknown-buff')
    const next = { ...current, definition: { ...current.definition, ...patch.definition } }
    next.definition.skillId = current.definition.skillId
    if (patch.appliedAtMs !== undefined) next.appliedAtMs = patch.appliedAtMs
    if (patch.endsAtMs !== undefined) next.endsAtMs = patch.endsAtMs
    if (patch.order !== undefined) next.order = patch.order
    if (!validateGameBuffRecord(next).ok) return invalidRecord(next)
    return store.patchBuff(buffId, patch) ? changed(structuredClone(next)) : error('invalid-buff')
  }

  function removeBuff(buffId: BuffId): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    return store.removeBuff(buffId) ? changed(undefined) : error('unknown-buff')
  }

  function clearBuffs(): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    return store.clearBuffs() ? changed(undefined) : error('invalid-buff')
  }

  function setEndTime(buffId: BuffId, endsAtMs: number | null): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    if (endsAtMs !== null && !Number.isFinite(endsAtMs)) return error('invalid-duration')
    return store.setEndTime(buffId, endsAtMs) ? changed(undefined) : error('unknown-buff')
  }

  function setRemainingTime(
    buffId: BuffId,
    durationMs: number,
    nowMs = now(),
  ): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    if (!Number.isFinite(durationMs) || durationMs < 0) return error('invalid-duration')
    return store.setRemainingTime(buffId, durationMs, nowMs)
      ? changed(undefined)
      : error('unknown-buff')
  }

  function adjustEndTime(buffId: BuffId, deltaMs: number): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    if (!Number.isFinite(deltaMs)) return error('invalid-duration')
    return store.adjustEndTime(buffId, deltaMs) ? changed(undefined) : error('invalid-duration')
  }

  function makePermanent(buffId: BuffId): GameBuffCommandResult {
    return setEndTime(buffId, null)
  }

  function expireNow(buffId: BuffId, _nowMs = now()): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    return store.removeBuff(buffId) ? changed(undefined) : error('unknown-buff')
  }

  function setOrder(buffId: BuffId, order: number): GameBuffCommandResult {
    const guard = canMutate()
    if (guard) return guard
    if (!Number.isInteger(order) || order < 0) return error('invalid-buff', 'order')
    const response = patchBuff(buffId, { order })
    return response.ok ? result(undefined) : response
  }

  function voidResult(response: GameBuffCommandResult<unknown>): GameBuffCommandResult {
    return response.ok ? result(undefined) : response
  }

  function subscribe(listener: (snapshot: GameBuffSnapshot) => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function windowResult(action: () => boolean): GameBuffCommandResult {
    return action() ? changed(undefined) : error('window-unavailable')
  }

  return {
    replaceSnapshot,
    addBuff,
    upsertBuff,
    upsertBuffs,
    patchBuff,
    removeBuff,
    clearBuffs,
    setEndTime,
    setRemainingTime,
    adjustEndTime,
    makePermanent,
    expireNow,
    setOrder,
    getBuff: (buffId: BuffId) => {
      const buff = store.record(buffId)
      return buff ? structuredClone(buff) : null
    },
    getSnapshot,
    listBuffs: () => store.allBuffs.map((buff) => structuredClone(buff)),
    listTimedBuffs: () => store.timedBuffs.map((buff) => structuredClone(buff)),
    list: () => store.allBuffs.map((buff) => structuredClone(buff)),
    listPermanent: () =>
      store.allBuffs.filter((buff) => buff.endsAtMs === null).map((buff) => structuredClone(buff)),
    listPermanentBuffs: () =>
      store.allBuffs.filter((buff) => buff.endsAtMs === null).map((buff) => structuredClone(buff)),
    remove: removeBuff,
    has: (buffId: BuffId) => store.record(buffId) !== undefined,
    getStatus: () => ({
      status: store.status,
      revision: store.revision,
      count: store.count,
      lastError: store.lastError,
      lastUpdatedAtMs: store.lastUpdatedAtMs,
    }),
    getRevision: () => store.revision,
    getWindowState: () => windowStore.managedWindows[BUFF_LIST_WINDOW_ID] ?? null,
    removeMany: (buffIds: readonly BuffId[]) => {
      const guard = canMutate()
      if (guard) return guard
      if (buffIds.some((buffId) => !store.record(buffId))) return error('unknown-buff')
      return store.removeBuffs(buffIds) ? changed(undefined) : error('invalid-buff')
    },
    setDefinition: (buffId: BuffId, definition: Partial<Omit<GameBuffDefinition, 'skillId'>>) =>
      voidResult(patchBuff(buffId, { definition })),
    setIcon: (buffId: BuffId, icon: GameBuffDefinition['icon']) =>
      voidResult(patchBuff(buffId, { definition: { icon } })),
    setName: (buffId: BuffId, name: GameBuffDefinition['name']) =>
      voidResult(patchBuff(buffId, { definition: { name } })),
    setDescription: (buffId: BuffId, description: GameBuffDefinition['description']) =>
      voidResult(patchBuff(buffId, { definition: { description } })),
    setLevel: (buffId: BuffId, level: number) =>
      voidResult(patchBuff(buffId, { definition: { level } })),
    setFacts: (buffId: BuffId, facts: GameBuffDefinition['facts']) =>
      voidResult(patchBuff(buffId, { definition: { facts } })),
    setUpgrades: (buffId: BuffId, upgrades: GameBuffDefinition['upgrades']) =>
      voidResult(patchBuff(buffId, { definition: { upgrades } })),
    setAppliedAt: (buffId: BuffId, appliedAtMs: number) =>
      voidResult(patchBuff(buffId, { appliedAtMs })),
    expireDue: (nowMs = now()) => {
      const guard = canMutate()
      if (guard) return guard
      return changed(store.expireDueBuffs(nowMs))
    },
    restartDuration: (buffId: BuffId, durationMs: number, nowMs = now()) => {
      if (!Number.isFinite(durationMs) || durationMs < 0) return error('invalid-duration')
      return voidResult(patchBuff(buffId, { appliedAtMs: nowMs, endsAtMs: nowMs + durationMs }))
    },
    applyRuntimeEvent: (event: GameBuffRuntimeEvent) => {
      const outcome = store.applyRuntimeEvent(event)
      return result(outcome)
    },
    moveBefore: (buffId: BuffId, targetId: BuffId) => {
      const guard = canMutate()
      if (guard) return guard
      return store.moveBefore(buffId, targetId) ? changed(undefined) : error('unknown-buff')
    },
    moveAfter: (buffId: BuffId, targetId: BuffId) => {
      const guard = canMutate()
      if (guard) return guard
      return store.moveAfter(buffId, targetId) ? changed(undefined) : error('unknown-buff')
    },
    subscribe,
    openWindow: () =>
      windowResult(() => windowStore.openManagedWindow(BUFF_LIST_WINDOW_ID, { closable: false })),
    closeWindow: () =>
      windowResult(() => windowStore.closeManagedWindow(BUFF_LIST_WINDOW_ID, true)),
    focusWindow: () => windowResult(() => windowStore.focusWindow(BUFF_LIST_WINDOW_ID)),
    isWindowOpen: () => windowStore.managedWindows[BUFF_LIST_WINDOW_ID]?.open ?? false,
    resetWindowLayout: () => {
      windowStore.resetWindowLayout(BUFF_LIST_WINDOW_ID)
      return changed(undefined)
    },
    setDebugMetadataVisible: (visible: boolean) => {
      const guard = canMutate()
      if (guard) return guard
      shortcutsStore.setDebugMetadataVisible(visible)
      return changed(undefined)
    },
  }
}

export function installGameBuffDeveloperApi(
  api: GameBuffDeveloperApi,
  target: Window = window,
): () => void {
  const existing = (target.ew ?? {}) as EwDeveloperApi
  target.ew = existing
  existing.buffList = api
  return () => {
    if (target.ew?.buffList === api) Reflect.deleteProperty(target.ew, 'buffList')
  }
}
