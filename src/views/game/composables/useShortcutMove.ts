import { ref } from 'vue'
import type { ShortcutPosition } from '../types/shortcuts'

export function useShortcutMove() {
  const source = ref<ShortcutPosition | null>(null)
  const pointerStart = ref<{ x: number; y: number } | null>(null)
  const pointer = ref<{ x: number; y: number } | null>(null)
  const dragging = ref(false)
  function begin(position: ShortcutPosition, x: number, y: number) {
    source.value = position
    pointerStart.value = { x, y }
    pointer.value = x || y ? { x, y } : null
    dragging.value = false
  }
  function update(x: number, y: number, threshold = 5) {
    if (!pointerStart.value) {
      return false
    }
    pointer.value = { x, y }
    dragging.value = Math.hypot(x - pointerStart.value.x, y - pointerStart.value.y) >= threshold
    return dragging.value
  }
  function cancel() {
    source.value = null
    pointerStart.value = null
    pointer.value = null
    dragging.value = false
  }
  function finish(destination: ShortcutPosition | null) {
    const result =
      dragging.value && destination !== null ? { source: source.value, destination } : null
    cancel()
    return result
  }
  return { source, pointer, dragging, begin, update, finish, cancel }
}
