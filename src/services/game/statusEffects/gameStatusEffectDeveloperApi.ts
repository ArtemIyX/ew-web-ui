import type {
  GameStatusEffectDefinition,
  GameStatusEffectPatch,
  GameStatusEffectRecord,
  GameStatusEffectRuntimeEvent,
  GameStatusEffectSnapshot,
} from '@/views/game/types/gameStatusEffects'
import { watch } from 'vue'
import type { GameStatusEffectStore } from '@/stores/statusEffects/createGameStatusEffectStore'

export type StatusEffectCommandError =
  | 'developer-mutations-disabled'
  | 'duplicate-id'
  | 'unknown-effect'
  | 'invalid-record'
  | 'invalid-duration'
  | 'invalid-revision'
  | 'revision-gap'
  | 'window-unavailable'
export type StatusEffectCommandResult<T = undefined> =
  | { ok: true; revision: number; value: T }
  | { ok: false; error: StatusEffectCommandError; path?: string }
export interface GameStatusEffectDeveloperApiOptions<Id extends string> {
  store: GameStatusEffectStore<Id>
  now?: () => number
  allowMutations?: () => boolean
  window?: {
    open: () => boolean
    close: () => boolean
    focus: () => boolean
    isOpen: () => boolean
    reset: () => void
  }
}

export function createGameStatusEffectDeveloperApi<Id extends string>(
  options: GameStatusEffectDeveloperApiOptions<Id>,
) {
  const now = options.now ?? Date.now
  const allowMutations = options.allowMutations ?? (() => true)
  const listeners = new Set<(snapshot: GameStatusEffectSnapshot<Id>) => void>()
  const result = <T>(value: T): StatusEffectCommandResult<T> => ({
    ok: true,
    revision: options.store.revision.value,
    value,
  })
  const failure = (
    error: StatusEffectCommandError,
    path?: string,
  ): StatusEffectCommandResult<never> => (path ? { ok: false, error, path } : { ok: false, error })
  const guard = (): StatusEffectCommandResult<never> | undefined =>
    allowMutations() ? undefined : failure('developer-mutations-disabled')
  const snapshot = (): GameStatusEffectSnapshot<Id> => ({
    revision: options.store.revision.value,
    effects: options.store.allEffects.value.map((record) => structuredClone(record)),
  })
  const notify = (): void => {
    const value = snapshot()
    listeners.forEach((listener) => listener(value))
  }
  watch(
    () => [
      options.store.revision.value,
      JSON.stringify(options.store.allEffects.value),
    ],
    () => notify(),
    { flush: 'sync' },
  )
  const mutationError = (): StatusEffectCommandResult<never> => {
    const error = options.store.lastError.value
    return error === 'duplicate-id' ||
      error === 'invalid-record' ||
      error === 'invalid-duration' ||
      error === 'invalid-revision' ||
      error === 'revision-gap' ||
      error === 'unknown-effect'
      ? failure(error)
      : failure('unknown-effect')
  }
  const mutate = (action: () => boolean): StatusEffectCommandResult => {
    const blocked = guard()
    if (blocked) return blocked
    return action() ? result(undefined) : mutationError()
  }
  return {
    getSnapshot: snapshot,
    getById: (id: Id) => options.store.record(id) ?? null,
    list: () => snapshot().effects,
    listTimed: () => snapshot().effects.filter((record) => record.endsAtMs !== null),
    listPermanent: () => snapshot().effects.filter((record) => record.endsAtMs === null),
    has: (id: Id) => options.store.record(id) !== undefined,
    getStatus: () => ({
      status: options.store.status.value,
      revision: options.store.revision.value,
      count: options.store.count.value,
      lastError: options.store.lastError.value,
      lastUpdatedAtMs: options.store.lastUpdatedAtMs.value,
    }),
    getRevision: () => options.store.revision.value,
    subscribe: (
      listener: (snapshot: GameStatusEffectSnapshot<Id>) => void,
      settings: { emitCurrent?: boolean } = {},
    ) => {
      listeners.add(listener)
      if (settings.emitCurrent) listener(snapshot())
      return () => listeners.delete(listener)
    },
    replaceSnapshot: (value: GameStatusEffectSnapshot<Id>) =>
      mutate(() => options.store.replaceSnapshot(value)),
    add: (input: {
      id: Id
      definition: GameStatusEffectDefinition
      appliedAtMs?: number
      endsAtMs?: number | null
      order?: number
    }) => {
      if (options.store.record(input.id)) return failure('duplicate-id')
      const record: GameStatusEffectRecord<Id> = {
        id: input.id,
        definition: structuredClone(input.definition),
        appliedAtMs: input.appliedAtMs ?? now(),
        endsAtMs: input.endsAtMs ?? null,
        order: input.order ?? options.store.count.value,
      }
      const outcome = mutate(() => options.store.upsert(record))
      return outcome.ok ? result(record) : outcome
    },
    upsert: (record: GameStatusEffectRecord<Id>) => mutate(() => options.store.upsert(record)),
    upsertMany: (records: readonly GameStatusEffectRecord<Id>[]) =>
      mutate(() => options.store.upsertMany(records)),
    patch: (id: Id, patch: GameStatusEffectPatch) => mutate(() => options.store.patch(id, patch)),
    remove: (id: Id) => mutate(() => options.store.remove(id)),
    removeMany: (ids: readonly Id[]) => mutate(() => options.store.removeMany(ids)),
    clear: () => mutate(() => options.store.clear()),
    setDefinition: (id: Id, definition: Partial<Omit<GameStatusEffectDefinition, 'skillId'>>) =>
      mutate(() => options.store.patch(id, { definition })),
    setIcon: (id: Id, icon: GameStatusEffectDefinition['icon']) =>
      mutate(() => options.store.patch(id, { definition: { icon } })),
    setName: (id: Id, name: GameStatusEffectDefinition['name']) =>
      mutate(() => options.store.patch(id, { definition: { name } })),
    setDescription: (id: Id, description: GameStatusEffectDefinition['description']) =>
      mutate(() => options.store.patch(id, { definition: { description } })),
    setLevel: (id: Id, level: number) =>
      mutate(() => options.store.patch(id, { definition: { level } })),
    setFacts: (id: Id, facts: GameStatusEffectDefinition['facts']) =>
      mutate(() => options.store.patch(id, { definition: { facts } })),
    setUpgrades: (id: Id, upgrades: GameStatusEffectDefinition['upgrades']) =>
      mutate(() => options.store.patch(id, { definition: { upgrades } })),
    setOrder: (id: Id, order: number) => mutate(() => options.store.patch(id, { order })),
    setAppliedAt: (id: Id, appliedAtMs: number) =>
      mutate(() => options.store.patch(id, { appliedAtMs })),
    setEndTime: (id: Id, endsAtMs: number | null) =>
      mutate(() => options.store.setEndTime(id, endsAtMs)),
    setRemainingTime: (id: Id, durationMs: number, nowMs = now()) =>
      Number.isFinite(durationMs) && durationMs >= 0
        ? mutate(() => options.store.setRemainingTime(id, durationMs, nowMs))
        : failure('invalid-duration'),
    adjustEndTime: (id: Id, deltaMs: number) =>
      Number.isFinite(deltaMs)
        ? mutate(() => options.store.adjustEndTime(id, deltaMs))
        : failure('invalid-duration'),
    makePermanent: (id: Id) => mutate(() => options.store.setEndTime(id, null)),
    expireNow: (id: Id, nowMs = now()) => mutate(() => options.store.remove(id)),
    expireDue: (nowMs = now()) => {
      const blocked = guard()
      if (blocked) return blocked
      const value = options.store.expireDue(nowMs)
      notify()
      return result(value)
    },
    moveBefore: (id: Id, targetId: Id) => mutate(() => options.store.moveBefore(id, targetId)),
    moveAfter: (id: Id, targetId: Id) => mutate(() => options.store.moveAfter(id, targetId)),
    restartDuration: (id: Id, durationMs: number, nowMs = now()) =>
      Number.isFinite(durationMs) && durationMs >= 0
        ? mutate(() =>
            options.store.patch(id, { appliedAtMs: nowMs, endsAtMs: nowMs + durationMs }),
          )
        : failure('invalid-duration'),
    applyRuntimeEvent: (event: GameStatusEffectRuntimeEvent<Id>) => {
      const value = options.store.applyRuntimeEvent(event)
      if (value === 'needs-resync') return failure('revision-gap')
      return result(value)
    },
    refresh: () => options.store.refresh().then(() => result(undefined)),
    openWindow: () =>
      options.window ? result(options.window.open()) : failure('window-unavailable'),
    closeWindow: () =>
      options.window ? result(options.window.close()) : failure('window-unavailable'),
    focusWindow: () =>
      options.window ? result(options.window.focus()) : failure('window-unavailable'),
    isWindowOpen: () => options.window?.isOpen() ?? false,
    resetWindowLayout: () => {
      if (!options.window) return failure('window-unavailable')
      options.window.reset()
      return result(undefined)
    },
  }
}
