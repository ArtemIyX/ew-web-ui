import { onBeforeUnmount, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
const nowMs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
let consumers = 0
function startClock(): void {
  if (!timer)
    timer = setInterval(() => {
      nowMs.value = Date.now()
    }, 100)
}
function stopClock(): void {
  if (consumers === 0 && timer) {
    clearInterval(timer)
    timer = undefined
  }
}
export function useGameCooldownClock(active: MaybeRefOrGetter<boolean>) {
  let subscribed = false
  const start = () => {
    if (subscribed) return
    if (consumers === 0) nowMs.value = Date.now()
    subscribed = true
    consumers += 1
    startClock()
  }
  const stop = () => {
    if (!subscribed) return
    subscribed = false
    consumers = Math.max(0, consumers - 1)
    stopClock()
  }
  watch(
    () => toValue(active),
    (value) => (value ? start() : stop()),
    { immediate: true },
  )
  onBeforeUnmount(stop)
  return { nowMs, start, stop }
}
