import { usePlayerAbilityCastStore } from '@/stores/playerAbilityCast'
import { useWindowManagerStore } from '@/stores/windowManager'
import {
  PLAYER_ABILITY_CAST_WINDOW_ID,
  type AbilityCastSnapshot,
  type PlayerAbilityCastSnapshot,
} from '@/views/game/types/gameAbilityCast'
import type { TextContent } from '@/shared/types/components'
import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'

export type PlayerCastCommandError =
  | 'developer-mutations-disabled'
  | 'invalid-cast'
  | 'invalid-duration'
  | 'invalid-time'
  | 'invalid-progress'
  | 'no-active-cast'
  | 'already-paused'
  | 'not-paused'
  | 'window-unavailable'

export type PlayerCastCommandResult<T = undefined> =
  | { ok: true; revision: number; value: T }
  | { ok: false; error: PlayerCastCommandError }

export interface PlayerCastStartInput {
  castId: string
  abilityId: string
  abilityName: TextContent
  durationMs: number
  nowMs?: number
}

export interface PlayerCastStatus {
  phase: 'idle' | 'casting' | 'paused'
  revision: number
  lastUpdatedAtMs: number | null
}

export interface GamePlayerCastDeveloperApi {
  getSnapshot(): PlayerAbilityCastSnapshot
  getCast(): AbilityCastSnapshot | null
  getStatus(): PlayerCastStatus
  subscribe(
    listener: (snapshot: PlayerAbilityCastSnapshot) => void,
    options?: { emitCurrent?: boolean },
  ): () => void
  startCast(input: PlayerCastStartInput): PlayerCastCommandResult<AbilityCastSnapshot>
  setCast(cast: AbilityCastSnapshot | null): PlayerCastCommandResult<AbilityCastSnapshot | null>
  restartCast(durationMs?: number, nowMs?: number): PlayerCastCommandResult<AbilityCastSnapshot>
  setElapsedTime(elapsedMs: number, nowMs?: number): PlayerCastCommandResult<AbilityCastSnapshot>
  setRemainingTime(
    remainingMs: number,
    nowMs?: number,
  ): PlayerCastCommandResult<AbilityCastSnapshot>
  setDuration(
    durationMs: number,
    nowMs?: number,
  ): PlayerCastCommandResult<AbilityCastSnapshot | null>
  setProgress(
    percentage: number,
    nowMs?: number,
  ): PlayerCastCommandResult<AbilityCastSnapshot | null>
  adjustEndTime(deltaMs: number): PlayerCastCommandResult<AbilityCastSnapshot>
  pauseCast(nowMs?: number): PlayerCastCommandResult<AbilityCastSnapshot>
  resumeCast(nowMs?: number): PlayerCastCommandResult<AbilityCastSnapshot>
  finishCast(): PlayerCastCommandResult
  cancelCast(): PlayerCastCommandResult
  interruptCast(): PlayerCastCommandResult
  clearCast(): PlayerCastCommandResult
  openWindow(): PlayerCastCommandResult<boolean>
  focusWindow(): PlayerCastCommandResult<boolean>
  isWindowOpen(): boolean
  resetWindowLayout(): PlayerCastCommandResult
}

function isTextContent(value: TextContent): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return value.table.trim().length > 0 && value.textKey.trim().length > 0
}

function isValidCast(cast: AbilityCastSnapshot): boolean {
  return (
    cast.castId.trim().length > 0 &&
    cast.abilityId.trim().length > 0 &&
    isTextContent(cast.abilityName) &&
    Number.isFinite(cast.startedAtMs) &&
    Number.isFinite(cast.endsAtMs) &&
    cast.endsAtMs > cast.startedAtMs
  )
}

export function createGamePlayerCastDeveloperApi(): GamePlayerCastDeveloperApi {
  const store = usePlayerAbilityCastStore()
  const windows = useWindowManagerStore()
  const enabled = (): boolean =>
    import.meta.env.DEV || runtimeIntegrationMode.get() === RuntimeIntegrationMode.Disconnected
  const failure = <T>(error: PlayerCastCommandError): PlayerCastCommandResult<T> => ({
    ok: false,
    error,
  })
  const result = <T>(value: T): PlayerCastCommandResult<T> => ({
    ok: true,
    revision: store.revision,
    value,
  })
  const current = (): AbilityCastSnapshot | null => store.getSnapshot().activeCast
  const effectiveNow = (nowMs?: number): number => store.pausedAtMs ?? nowMs ?? Date.now()
  const replace = (
    cast: AbilityCastSnapshot,
    pausedAtMs: number | null = store.pausedAtMs,
  ): PlayerCastCommandResult<AbilityCastSnapshot> => {
    if (!enabled()) {
      return failure('developer-mutations-disabled')
    }
    if (!isValidCast(cast)) {
      return failure('invalid-cast')
    }

    store.replaceCast(cast, pausedAtMs)
    return result(store.getSnapshot().activeCast!)
  }
  const mutateCurrent = (
    mutate: (cast: AbilityCastSnapshot) => AbilityCastSnapshot,
  ): PlayerCastCommandResult<AbilityCastSnapshot> => {
    const cast = current()
    if (!cast) {
      return failure('no-active-cast')
    }

    return replace(mutate(cast))
  }
  const terminate = (
    reason: 'finished' | 'cancelled' | 'interrupted',
  ): PlayerCastCommandResult => {
    if (!enabled()) {
      return failure('developer-mutations-disabled')
    }
    if (!current()) {
      return failure('no-active-cast')
    }

    store.terminate(reason)
    return result(undefined)
  }
  const finishWithValue = (): PlayerCastCommandResult<AbilityCastSnapshot | null> => {
    const command = terminate('finished')
    return command.ok ? result(null) : command
  }

  return {
    getSnapshot: store.getSnapshot,
    getCast: current,
    getStatus: () => ({
      phase: store.phase,
      revision: store.revision,
      lastUpdatedAtMs: store.lastUpdatedAtMs,
    }),
    subscribe: (listener, options = {}) => {
      const stop = store.$subscribe(() => listener(store.getSnapshot()))
      if (options.emitCurrent) {
        listener(store.getSnapshot())
      }
      return stop
    },
    startCast: (input) => {
      if (!Number.isFinite(input.durationMs) || input.durationMs <= 0) {
        return failure('invalid-duration')
      }
      const nowMs = input.nowMs ?? Date.now()
      if (!Number.isFinite(nowMs)) {
        return failure('invalid-time')
      }
      return replace({
        castId: input.castId,
        abilityId: input.abilityId,
        abilityName: input.abilityName,
        startedAtMs: nowMs,
        endsAtMs: nowMs + input.durationMs,
      }, null)
    },
    setCast: (cast) => {
      if (cast) {
        return replace(cast, null)
      }
      if (!enabled()) {
        return failure('developer-mutations-disabled')
      }
      store.clearCast()
      return result(null)
    },
    restartCast: (durationMs, nowMs = Date.now()) => {
      const cast = current()
      if (!cast) {
        return failure('no-active-cast')
      }
      const duration = durationMs ?? cast.endsAtMs - cast.startedAtMs
      if (!Number.isFinite(duration) || duration <= 0) {
        return failure('invalid-duration')
      }
      if (!Number.isFinite(nowMs)) {
        return failure('invalid-time')
      }
      return replace({
        ...cast,
        startedAtMs: nowMs,
        endsAtMs: nowMs + duration,
      }, null)
    },
    setElapsedTime: (elapsedMs, nowMs) => {
      const now = effectiveNow(nowMs)
      if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || !Number.isFinite(now)) {
        return failure('invalid-time')
      }
      return mutateCurrent((cast) => {
        const duration = cast.endsAtMs - cast.startedAtMs
        const elapsed = Math.min(duration, elapsedMs)
        const startedAtMs = now - elapsed
        return { ...cast, startedAtMs, endsAtMs: startedAtMs + duration }
      })
    },
    setRemainingTime: (remainingMs, nowMs) => {
      const now = effectiveNow(nowMs)
      if (!Number.isFinite(remainingMs) || remainingMs <= 0 || !Number.isFinite(now)) {
        return failure('invalid-time')
      }
      return mutateCurrent((cast) => ({ ...cast, endsAtMs: now + remainingMs }))
    },
    setDuration: (durationMs, nowMs) => {
      const now = effectiveNow(nowMs)
      if (!Number.isFinite(durationMs) || durationMs <= 0) {
        return failure('invalid-duration')
      }
      if (!Number.isFinite(now)) {
        return failure('invalid-time')
      }
      const cast = current()
      if (!cast) {
        return failure('no-active-cast')
      }
      const elapsed = Math.max(0, now - cast.startedAtMs)
      if (durationMs <= elapsed) {
        return finishWithValue()
      }
      return replace({ ...cast, endsAtMs: cast.startedAtMs + durationMs })
    },
    setProgress: (percentage, nowMs) => {
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return failure('invalid-progress')
      }
      if (percentage === 100) {
        return finishWithValue()
      }
      const now = effectiveNow(nowMs)
      if (!Number.isFinite(now)) {
        return failure('invalid-time')
      }
      return mutateCurrent((cast) => {
        const duration = cast.endsAtMs - cast.startedAtMs
        const startedAtMs = now - duration * (percentage / 100)
        return { ...cast, startedAtMs, endsAtMs: startedAtMs + duration }
      })
    },
    adjustEndTime: (deltaMs) => {
      if (!Number.isFinite(deltaMs)) {
        return failure('invalid-time')
      }
      const now = effectiveNow()
      const cast = current()
      if (!cast) {
        return failure('no-active-cast')
      }
      const endsAtMs = cast.endsAtMs + deltaMs
      if (endsAtMs <= now || endsAtMs <= cast.startedAtMs) {
        return failure('invalid-time')
      }
      return replace({ ...cast, endsAtMs })
    },
    pauseCast: (nowMs = Date.now()) => {
      const cast = current()
      if (!cast) {
        return failure('no-active-cast')
      }
      if (store.pausedAtMs !== null) {
        return failure('already-paused')
      }
      if (!Number.isFinite(nowMs) || nowMs < cast.startedAtMs || nowMs >= cast.endsAtMs) {
        return failure('invalid-time')
      }
      return replace(cast, nowMs)
    },
    resumeCast: (nowMs = Date.now()) => {
      const cast = current()
      if (!cast) {
        return failure('no-active-cast')
      }
      if (store.pausedAtMs === null) {
        return failure('not-paused')
      }
      if (!Number.isFinite(nowMs) || nowMs < store.pausedAtMs) {
        return failure('invalid-time')
      }
      const pausedDurationMs = nowMs - store.pausedAtMs
      return replace({
        ...cast,
        startedAtMs: cast.startedAtMs + pausedDurationMs,
        endsAtMs: cast.endsAtMs + pausedDurationMs,
      }, null)
    },
    finishCast: () => terminate('finished'),
    cancelCast: () => terminate('cancelled'),
    interruptCast: () => terminate('interrupted'),
    clearCast: () => {
      if (!enabled()) {
        return failure('developer-mutations-disabled')
      }
      store.clearCast()
      return result(undefined)
    },
    openWindow: () =>
      result(
        windows.openManagedWindow(PLAYER_ABILITY_CAST_WINDOW_ID, {
          closable: false,
        }),
      ),
    focusWindow: () =>
      windows.managedWindows[PLAYER_ABILITY_CAST_WINDOW_ID]
        ? result(windows.focusWindow(PLAYER_ABILITY_CAST_WINDOW_ID))
        : failure('window-unavailable'),
    isWindowOpen: () => windows.isWindowOpen(PLAYER_ABILITY_CAST_WINDOW_ID).value,
    resetWindowLayout: () => {
      windows.resetWindowLayout(PLAYER_ABILITY_CAST_WINDOW_ID)
      return result(undefined)
    },
  }
}

export function installGamePlayerCastDeveloperApi(
  api: GamePlayerCastDeveloperApi,
  target: Window = window,
): () => void {
  const existing = (target.ew ?? {}) as EwDeveloperApi
  target.ew = existing
  existing.playerCast = api
  return () => {
    if (target.ew?.playerCast === api) {
      Reflect.deleteProperty(target.ew, 'playerCast')
    }
  }
}
