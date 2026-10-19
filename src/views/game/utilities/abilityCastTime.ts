import type { AbilityCastSnapshot } from '@/views/game/types/gameAbilityCast'

export function abilityCastDurationMs(cast: AbilityCastSnapshot): number {
  return Math.max(0, cast.endsAtMs - cast.startedAtMs)
}

export function abilityCastElapsedMs(cast: AbilityCastSnapshot, nowMs: number): number {
  return Math.min(abilityCastDurationMs(cast), Math.max(0, nowMs - cast.startedAtMs))
}

export function abilityCastProgress(cast: AbilityCastSnapshot, nowMs: number): number {
  const duration = abilityCastDurationMs(cast)
  return duration > 0 ? abilityCastElapsedMs(cast, nowMs) / duration : 1
}

export function abilityCastRemainingTenths(cast: AbilityCastSnapshot, nowMs: number): number {
  return Math.max(0, Math.ceil(Math.max(0, cast.endsAtMs - nowMs) / 100) / 10)
}

export function formatAbilityCastRemaining(cast: AbilityCastSnapshot, nowMs: number): string {
  return `${abilityCastRemainingTenths(cast, nowMs).toFixed(1)}s`
}
