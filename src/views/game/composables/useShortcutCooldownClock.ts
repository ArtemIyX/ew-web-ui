import { onBeforeUnmount, ref } from 'vue'

export function cooldownSeconds(endsAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil(Math.max(0, endsAtMs - nowMs) / 1000))
}

export function cooldownProgress(startedAtMs: number, endsAtMs: number, nowMs: number): number {
  if (endsAtMs <= startedAtMs) {
    return 1
  }
  return Math.min(1, Math.max(0, (nowMs - startedAtMs) / (endsAtMs - startedAtMs)))
}

export function useShortcutCooldownClock(hasCooldowns: () => boolean) {
  const nowMs = ref(Date.now())
  let frame: number | undefined
  const tick = () => {
    nowMs.value = Date.now()
    if (hasCooldowns() && !document.hidden) {
      frame = requestAnimationFrame(tick)
    } else {
      frame = undefined
    }
  }
  const start = () => {
    if (frame === undefined) {
      frame = requestAnimationFrame(tick)
    }
  }
  const resume = () => {
    nowMs.value = Date.now()
    start()
  }
  document.addEventListener('visibilitychange', resume)
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', resume)
    if (frame !== undefined) {
      cancelAnimationFrame(frame)
    }
  })
  return { nowMs, start }
}
