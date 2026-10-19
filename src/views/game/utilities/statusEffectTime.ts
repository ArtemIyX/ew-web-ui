export function statusEffectRemainingMs(endsAtMs: number | null, nowMs: number): number | null {
  return endsAtMs === null ? null : Math.max(0, endsAtMs - nowMs)
}

export function statusEffectProgress(startedAtMs: number, endsAtMs: number, nowMs: number): number {
  if (endsAtMs <= startedAtMs) return 1
  return Math.min(1, Math.max(0, (nowMs - startedAtMs) / (endsAtMs - startedAtMs)))
}

export function statusEffectRemainingSeconds(endsAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000))
}
