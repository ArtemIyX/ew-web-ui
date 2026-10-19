import { BUFF_COUNTDOWN_THRESHOLD_MS } from '@/views/game/types/gameBuffs'
import {
  statusEffectProgress,
  statusEffectRemainingMs,
  statusEffectRemainingSeconds,
} from './statusEffectTime'

export function buffRemainingMs(endsAtMs: number | null, nowMs: number): number | null {
  return statusEffectRemainingMs(endsAtMs, nowMs)
}

export function buffProgress(startedAtMs: number, endsAtMs: number, nowMs: number): number {
  return statusEffectProgress(startedAtMs, endsAtMs, nowMs)
}

export function shouldShowBuffCountdown(endsAtMs: number | null, nowMs: number): boolean {
  const remainingMs = buffRemainingMs(endsAtMs, nowMs)

  return remainingMs !== null && remainingMs > 0 && remainingMs < BUFF_COUNTDOWN_THRESHOLD_MS
}

export function buffRemainingSeconds(endsAtMs: number, nowMs: number): number {
  return statusEffectRemainingSeconds(endsAtMs, nowMs)
}
