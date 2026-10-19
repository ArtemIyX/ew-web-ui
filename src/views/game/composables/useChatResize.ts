import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface ChatSize {
  inline: number
  block: number
}
export const CHAT_MIN_SIZE: ChatSize = { inline: 288, block: 192 }
const CHAT_MAX_INLINE = 960
const CHAT_MAX_BLOCK = 704
const CHAT_SAFE_OFFSET = 16

export function clampChatSize(
  size: ChatSize,
  viewportInline = window.innerWidth,
  viewportBlock = window.innerHeight,
): ChatSize {
  return {
    inline: Math.min(
      Math.max(size.inline, CHAT_MIN_SIZE.inline),
      Math.max(CHAT_MIN_SIZE.inline, Math.min(CHAT_MAX_INLINE, viewportInline - CHAT_SAFE_OFFSET)),
    ),
    block: Math.min(
      Math.max(size.block, CHAT_MIN_SIZE.block),
      Math.max(CHAT_MIN_SIZE.block, Math.min(CHAT_MAX_BLOCK, viewportBlock - CHAT_SAFE_OFFSET)),
    ),
  }
}

export function useChatResize(element: Ref<HTMLElement | null>) {
  const size = ref<ChatSize>(clampChatSize({ inline: 400, block: 288 }))
  const resizing = ref(false)
  const resizeHandleVisible = ref(false)
  let active:
    { id: number; startX: number; startY: number; start: ChatSize; handle: HTMLElement } | undefined

  const apply = (next: ChatSize): void => {
    size.value = clampChatSize(next)
  }
  const stop = (): void => {
    if (!active) return
    active.handle.releasePointerCapture?.(active.id)
    active = undefined
    resizing.value = false
    resizeHandleVisible.value = false
    document.body.style.userSelect = ''
  }
  const move = (event: PointerEvent): void => {
    if (!active || event.pointerId !== active.id) return
    apply({
      inline: active.start.inline + event.clientX - active.startX,
      block: active.start.block - event.clientY + active.startY,
    })
  }
  const start = (event: PointerEvent): void => {
    const target = element.value
    if (!target) return
    const rect = target.getBoundingClientRect()
    active = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      start: { inline: rect.width, block: rect.height },
      handle: event.currentTarget as HTMLElement,
    }
    active.handle.setPointerCapture?.(event.pointerId)
    resizing.value = true
    document.body.style.userSelect = 'none'
  }
  const showResizeHandle = (): void => {
    resizeHandleVisible.value = true
  }
  const hideResizeHandle = (): void => {
    resizeHandleVisible.value = false
  }
  const keydown = (event: KeyboardEvent): void => {
    const step = event.shiftKey ? 32 : 8
    const delta = { inline: 0, block: 0 }
    if (event.key === 'ArrowRight') delta.inline = step
    if (event.key === 'ArrowLeft') delta.inline = -step
    if (event.key === 'ArrowUp') delta.block = step
    if (event.key === 'ArrowDown') delta.block = -step
    if (!delta.inline && !delta.block) return
    event.preventDefault()
    apply({ inline: size.value.inline + delta.inline, block: size.value.block + delta.block })
  }
  const reclamp = (): void => apply(size.value)
  onMounted(() => {
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    window.addEventListener('resize', reclamp)
  })
  onBeforeUnmount(() => {
    stop()
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
    window.removeEventListener('pointercancel', stop)
    window.removeEventListener('resize', reclamp)
  })
  return {
    size: computed(() => size.value),
    resizing,
    resizeHandleVisible,
    showResizeHandle,
    hideResizeHandle,
    start,
    keydown,
  }
}
