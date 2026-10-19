import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { WindowPoint } from '@/shared/windows/types'

export interface WindowInteractionOptions {
  root: Ref<HTMLElement | null>
  onMove: (point: WindowPoint) => void
  onEnd: () => void
}

export function useWindowInteraction(options: WindowInteractionOptions) {
  const active = ref(false)
  const pointerId = ref<number | null>(null)
  let frame = 0
  let latest: WindowPoint | null = null

  function start(event: PointerEvent): void {
    if (event.button !== 0 || !options.root.value) return
    active.value = true
    pointerId.value = event.pointerId
    options.root.value.setPointerCapture?.(event.pointerId)
    document.body.classList.add('ew-window-interacting')
  }

  function move(event: PointerEvent): void {
    if (!active.value || event.pointerId !== pointerId.value) return
    latest = { x: event.clientX, y: event.clientY }
    if (!frame) frame = requestAnimationFrame(flush)
  }

  function flush(): void {
    frame = 0
    if (latest) options.onMove(latest)
    latest = null
  }

  function end(): void {
    if (!active.value) return
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    latest = null
    if (pointerId.value !== null && options.root.value?.hasPointerCapture?.(pointerId.value)) {
      options.root.value.releasePointerCapture?.(pointerId.value)
    }
    active.value = false
    pointerId.value = null
    document.body.classList.remove('ew-window-interacting')
    options.onEnd()
  }

  onBeforeUnmount(end)
  return { active, start, move, end }
}
