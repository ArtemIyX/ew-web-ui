import { useGameDebuffDomain } from '@/stores/gameDebuffs'
import { watch } from 'vue'
import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useWindowManagerStore } from '@/stores/windowManager'
import {
  DEBUFF_LIST_WINDOW_ID,
  type GameDebuffRuntimeEvent,
  type GameDebuffRecord,
  type GameDebuffSnapshot,
} from '@/views/game/types/gameDebuffs'
import type { GameStatusEffectRuntimeEvent } from '@/views/game/types/gameStatusEffects'

function toCoreEvent(
  event: import('@/views/game/types/gameDebuffs').GameDebuffRuntimeEvent,
): GameStatusEffectRuntimeEvent {
  if (event.kind === 'snapshot')
    return {
      kind: 'snapshot',
      snapshot: {
        revision: event.snapshot.revision,
        effects: event.snapshot.debuffs.map((record) => ({
          id: record.debuffId,
          definition: record.definition,
          appliedAtMs: record.appliedAtMs,
          endsAtMs: record.endsAtMs,
          order: record.order,
        })),
      },
    }
  if (event.kind === 'upsert')
    return {
      kind: 'upsert',
      revision: event.revision,
      record: {
        id: event.debuff.debuffId,
        definition: event.debuff.definition,
        appliedAtMs: event.debuff.appliedAtMs,
        endsAtMs: event.debuff.endsAtMs,
        order: event.debuff.order,
      },
    }
  if (event.kind === 'remove')
    return { kind: 'remove', revision: event.revision, id: event.debuffId }
  return event
}
export function createGameDebuffDeveloperApi(
  dependencies: { allowMutations?: () => boolean; now?: () => number } = {},
) {
  const store = useGameDebuffDomain()
  const windows = useWindowManagerStore()
  const shortcuts = useGameShortcutsStore()
  const allowMutations =
    dependencies.allowMutations ??
    (() =>
      import.meta.env.DEV || runtimeIntegrationMode.get() === RuntimeIntegrationMode.Disconnected)
  const now = dependencies.now ?? Date.now
  const normalize = (record: GameDebuffRecord) => ({
    id: record.debuffId,
    definition: record.definition,
    appliedAtMs: record.appliedAtMs,
    endsAtMs: record.endsAtMs,
    order: record.order,
  })
  const snapshot = (): GameDebuffSnapshot => ({
    revision: store.revision,
    debuffs: store.allEffects.map((record) => ({
      debuffId: record.id,
      definition: record.definition,
      appliedAtMs: record.appliedAtMs,
      endsAtMs: record.endsAtMs,
      order: record.order,
    })),
  })
  const result = (value: unknown = undefined) => ({
    ok: true as const,
    revision: store.revision,
    value,
  })
  const listeners = new Set<(value: GameDebuffSnapshot) => void>()
  watch(
    () => store.revision,
    () => {
      const value = snapshot()
      listeners.forEach((listener) => listener(value))
    },
    { flush: 'sync' },
  )
  const api = {
    getSnapshot: snapshot,
    list: () => snapshot().debuffs,
    listDebuffs: () => snapshot().debuffs,
    listTimed: () => snapshot().debuffs.filter((record) => record.endsAtMs !== null),
    listTimedDebuffs: () => snapshot().debuffs.filter((record) => record.endsAtMs !== null),
    listPermanent: () => snapshot().debuffs.filter((record) => record.endsAtMs === null),
    listPermanentDebuffs: () => snapshot().debuffs.filter((record) => record.endsAtMs === null),
    listAll: () => snapshot().debuffs,
    has: (id: string) => snapshot().debuffs.some((record) => record.debuffId === id),
    getStatus: () => ({
      status: store.status,
      revision: store.revision,
      count: store.count,
      lastError: store.lastError,
      lastUpdatedAtMs: store.lastUpdatedAtMs,
    }),
    getRevision: () => store.revision,
    getWindowState: () => windows.managedWindows[DEBUFF_LIST_WINDOW_ID] ?? null,
    getById: (id: string) => store.allDebuffs.find((record) => record.debuffId === id) ?? null,
    getDebuff: (id: string) => store.allDebuffs.find((record) => record.debuffId === id) ?? null,
    addDebuff: (record: GameDebuffRecord) =>
      store.upsert(normalize(record))
        ? result(record)
        : { ok: false as const, error: 'invalid-record' as const },
    add: (
      input: Omit<GameDebuffRecord, 'appliedAtMs' | 'endsAtMs' | 'order'> &
        Partial<Pick<GameDebuffRecord, 'appliedAtMs' | 'endsAtMs' | 'order'>>,
    ) => {
      const record: GameDebuffRecord = {
        ...input,
        appliedAtMs: input.appliedAtMs ?? now(),
        endsAtMs: input.endsAtMs ?? null,
        order: input.order ?? store.count,
      }
      return store.upsert(normalize(record))
        ? result(record)
        : { ok: false as const, error: 'invalid-record' as const }
    },
    upsert: (record: GameDebuffRecord) =>
      store.upsert(normalize(record))
        ? result(record)
        : { ok: false as const, error: 'invalid-record' as const },
    patch: (id: string, patchValue: import('@/views/game/types/gameDebuffs').GameDebuffPatch) =>
      store.patch(id, patchValue)
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    upsertMany: (records: readonly GameDebuffRecord[]) =>
      store.upsertMany(records.map(normalize))
        ? result()
        : { ok: false as const, error: 'invalid-record' as const },
    remove: (id: string) =>
      store.remove(id) ? result() : { ok: false as const, error: 'unknown-effect' as const },
    removeMany: (ids: readonly string[]) =>
      store.removeMany(ids)
        ? result()
        : {
            ok: false as const,
            error:
              store.lastError === 'duplicate-id'
                ? ('duplicate-id' as const)
                : ('unknown-effect' as const),
          },
    clearDebuffs: () =>
      store.clear() ? result() : { ok: false as const, error: 'invalid-record' as const },
    setEndTime: (id: string, end: number | null) =>
      store.setEndTime(id, end)
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setRemainingTime: (id: string, duration: number, nowMs = now()) =>
      store.setRemainingTime(id, duration, nowMs)
        ? result()
        : { ok: false as const, error: 'invalid-duration' as const },
    adjustEndTime: (id: string, delta: number) =>
      store.adjustEndTime(id, delta)
        ? result()
        : { ok: false as const, error: 'invalid-duration' as const },
    makePermanent: (id: string) =>
      store.setEndTime(id, null)
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    expireNow: (id: string) =>
      store.remove(id) ? result() : { ok: false as const, error: 'unknown-effect' as const },
    replaceSnapshot: (value: GameDebuffSnapshot) =>
      store.replaceSnapshot(value)
        ? result()
        : { ok: false as const, error: 'invalid-record' as const },
    setDefinition: (id: string, definition: GameDebuffRecord['definition']) =>
      store.patch(id, { definition })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setIcon: (id: string, icon: GameDebuffRecord['definition']['icon']) =>
      store.patch(id, { definition: { icon } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setName: (id: string, name: GameDebuffRecord['definition']['name']) =>
      store.patch(id, { definition: { name } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setDescription: (id: string, description: GameDebuffRecord['definition']['description']) =>
      store.patch(id, { definition: { description } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setLevel: (id: string, level: number) =>
      store.patch(id, { definition: { level } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setFacts: (id: string, facts: GameDebuffRecord['definition']['facts']) =>
      store.patch(id, { definition: { facts } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setUpgrades: (id: string, upgrades: GameDebuffRecord['definition']['upgrades']) =>
      store.patch(id, { definition: { upgrades } })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setOrder: (id: string, order: number) =>
      store.patch(id, { order })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    setAppliedAt: (id: string, appliedAtMs: number) =>
      store.patch(id, { appliedAtMs })
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    expireDue: (nowMs?: number) => result(store.expireDue(nowMs)),
    restartDuration: (id: string, durationMs: number, nowMs = Date.now()) =>
      Number.isFinite(durationMs) &&
      durationMs >= 0 &&
      store.patch(id, { appliedAtMs: nowMs, endsAtMs: nowMs + durationMs })
        ? result()
        : { ok: false as const, error: 'invalid-duration' as const },
    moveBefore: (id: string, targetId: string) =>
      store.moveBefore(id, targetId)
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    moveAfter: (id: string, targetId: string) =>
      store.moveAfter(id, targetId)
        ? result()
        : { ok: false as const, error: 'unknown-effect' as const },
    applyRuntimeEvent: (event: GameDebuffRuntimeEvent) => result(store.applyRuntimeEvent(event)),
    refresh: () => store.refresh().then(() => result(undefined)),
    subscribe: (
      listener: (value: GameDebuffSnapshot) => void,
      options: { emitCurrent?: boolean } = {},
    ) => {
      listeners.add(listener)
      if (options.emitCurrent) listener(snapshot())
      return () => listeners.delete(listener)
    },
    openWindow: () => result(windows.openManagedWindow(DEBUFF_LIST_WINDOW_ID, { closable: false })),
    closeWindow: () => result(windows.closeManagedWindow(DEBUFF_LIST_WINDOW_ID, true)),
    focusWindow: () => result(windows.focusWindow(DEBUFF_LIST_WINDOW_ID)),
    isWindowOpen: () => windows.managedWindows[DEBUFF_LIST_WINDOW_ID]?.open ?? false,
    resetWindowLayout: () => {
      windows.resetWindowLayout(DEBUFF_LIST_WINDOW_ID)
      return result()
    },
    setDebugMetadataVisible: (visible: boolean) => {
      shortcuts.setDebugMetadataVisible(visible)
      return result()
    },
  }
  const mutationNames = new Set([
    'replaceSnapshot',
    'add',
    'addDebuff',
    'upsert',
    'upsertMany',
    'remove',
    'removeMany',
    'clearDebuffs',
    'setDefinition',
    'setIcon',
    'setName',
    'setDescription',
    'setLevel',
    'setFacts',
    'setUpgrades',
    'setOrder',
    'setAppliedAt',
    'setEndTime',
    'setRemainingTime',
    'adjustEndTime',
    'makePermanent',
    'expireNow',
    'expireDue',
    'restartDuration',
    'applyRuntimeEvent',
    'setDebugMetadataVisible',
    'moveBefore',
    'moveAfter',
  ])
  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (!mutationNames.has(String(property)) || typeof value !== 'function') return value
      return (...args: unknown[]) =>
        allowMutations()
          ? value(...args)
          : { ok: false as const, error: 'developer-mutations-disabled' as const }
    },
  })
}
export type GameDebuffDeveloperApi = ReturnType<typeof createGameDebuffDeveloperApi>
