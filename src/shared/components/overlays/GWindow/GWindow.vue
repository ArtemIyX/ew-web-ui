<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch,
} from 'vue'
import GText from '../../content/GText/GText.vue'
import type { TextContent } from '@/shared/types/components'
import type {
  WindowHeaderPlacement,
  WindowHeaderSize,
  WindowChrome,
  WindowDragRegion,
  WindowDefaultPosition,
  WindowPoint,
  WindowRect,
  WindowResizeMode,
  WindowSurface,
  WindowTitleSize,
} from '@/shared/windows/types'
import { clampRect, resolveInitialRect, resizeRect } from '@/shared/windows/geometry'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useWindowManagerStore } from '@/stores/windowManager'
import { useWindowInteraction } from '@/shared/composables/windows/useWindowInteraction'
const props = withDefaults(
  defineProps<{
    windowId: string
    open?: boolean
    title?: TextContent
    ariaLabel?: TextContent
    closeLabel?: TextContent
    resizeLabel?: TextContent
    headerPlacement?: WindowHeaderPlacement
    titleSize?: WindowTitleSize
    headerSize?: WindowHeaderSize
    headerVisible?: boolean
    movable?: boolean
    dragRegion?: WindowDragRegion
    chrome?: WindowChrome
    surface?: WindowSurface
    headerSurface?: WindowSurface
    opacity?: number
    closable?: boolean
    active?: boolean
    resizable?: boolean
    resizeMode?: WindowResizeMode
    closeOnEscape?: boolean
    persistent?: boolean
    resetSizeOnOpen?: boolean
    fitContentHeight?: boolean
    fitContentWidth?: boolean
    autoFocus?: boolean
    bodyFlush?: boolean
    defaultWidth?: number
    defaultHeight?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    defaultPosition?: WindowDefaultPosition
  }>(),
  {
    open: false,
    headerPlacement: 'top',
    titleSize: 'md',
    headerSize: 'md',
    headerVisible: true,
    movable: true,
    chrome: 'default',
    surface: 'default',
    headerSurface: 'default',
    opacity: 1,
    closable: false,
    resizable: true,
    closeOnEscape: true,
    persistent: true,
    resetSizeOnOpen: false,
    fitContentHeight: false,
    fitContentWidth: false,
    autoFocus: true,
    defaultWidth: 40 * 16,
    defaultHeight: 30 * 16,
    defaultPosition: 'center',
    closeLabel: () => ({ table: 'Common', textKey: '#CLOSE' }),
    resizeLabel: () => ({ table: 'Common', textKey: '#RESIZE' }),
  },
)
const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
  focus: []
  'move-start': [rect: WindowRect]
  move: [rect: WindowRect]
  'move-end': [rect: WindowRect]
  'resize-start': [rect: WindowRect]
  resize: [rect: WindowRect]
  'resize-end': [rect: WindowRect]
  'geometry-change': [rect: WindowRect]
}>()
const windowStore = useWindowManagerStore()
let nextWindowZIndex = 900
const mountedWindowIds = new Set<string>()
const root = ref<HTMLElement | null>(null)
const rect = ref<WindowRect>({ x: 0, y: 0, width: props.defaultWidth, height: props.defaultHeight })
const dragging = ref(false)
const resizing = ref(false)
const pointerOffset = ref<WindowPoint>({ x: 0, y: 0 })
const startRect = ref<WindowRect>(rect.value)
const previousFocus = ref<HTMLElement | null>(null)
const localZIndex = ref(++nextWindowZIndex)
const interactionMode = ref<'move' | 'resize'>('move')
const ariaLabelText = useLocalizedText(() => props.ariaLabel)
const closeText = useLocalizedText(() => props.closeLabel)
const resizeText = useLocalizedText(() => props.resizeLabel)
const slots = useSlots()
const closeOnEscapeWasProvided = computed(() => {
  const rawProps = getCurrentInstance()?.vnode.props
  return rawProps?.closeOnEscape !== undefined || rawProps?.['close-on-escape'] !== undefined
})
const hasTitle = computed(() => props.title !== undefined)
const hasHeaderSlot = computed(() => Boolean(slots.header))
const resolvedDragRegion = computed<WindowDragRegion>(() => {
  if (props.movable === false) return 'none'
  return props.dragRegion ?? (props.headerVisible ? 'header' : 'none')
})
const canMove = computed(() => resolvedDragRegion.value !== 'none')
const canClose = computed(() => props.closable)
const resolvedOpacity = computed(() => {
  if (!Number.isFinite(props.opacity)) return 1
  return Math.min(1, Math.max(0, props.opacity))
})
const resolvedResizeMode = computed<WindowResizeMode>(() => {
  if (props.resizeMode) return props.resizeMode
  return props.resizable === false ? 'none' : 'corner'
})
const style = computed(() => ({
  width: props.fitContentWidth ? 'max-content' : `${rect.value.width}px`,
  height: props.fitContentHeight ? 'auto' : `${rect.value.height}px`,
  transform: `translate3d(${rect.value.x}px, ${rect.value.y}px, 0)`,
  '--ew-window-opacity': String(resolvedOpacity.value),
  zIndex: windowStore.managedWindows[props.windowId]
    ? 900 + windowStore.managedWindows[props.windowId]!.zOrder
    : localZIndex.value,
}))
const interaction = useWindowInteraction({
  root,
  onMove: (point) => {
    const event = { clientX: point.x, clientY: point.y } as PointerEvent
    onPointerMove(event)
  },
  onEnd: () => {
    const wasResize = interactionMode.value === 'resize'
    dragging.value = false
    resizing.value = false
    if (props.persistent) windowStore.commitGeometry(props.windowId, rect.value)
    if (wasResize) emit('resize-end', { ...rect.value })
    else emit('move-end', { ...rect.value })
  },
})
function viewport(): { width: number; height: number } {
  return { width: window.innerWidth, height: window.innerHeight }
}
function constrain(value: WindowRect): WindowRect {
  return clampRect(value, viewport(), {
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
  })
}
function close(): void {
  if (canClose.value) {
    emit('update:open', false)
    emit('close')
    restoreFocus()
  }
}
function promote(): void {
  localZIndex.value = ++nextWindowZIndex
  windowStore.focusWindow(props.windowId)
  emit('focus')
}
function restoreFocus(): void {
  if (previousFocus.value?.isConnected) previousFocus.value.focus()
  previousFocus.value = null
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && canClose.value && props.closeOnEscape && !event.defaultPrevented)
    close()
  if (
    resolvedDragRegion.value === 'handle' &&
    isDedicatedHandle(event.target instanceof Element ? event.target : null)
  )
    moveByKeyboard(event)
  if (
    resolvedDragRegion.value === 'surface' &&
    event.target === root.value &&
    canMove.value
  )
    moveByKeyboard(event)
}
function moveByKeyboard(event: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  emit('move-start', { ...rect.value })
  const step = event.shiftKey ? 48 : 16
  const delta =
    event.key === 'ArrowLeft'
      ? { x: -step, y: 0 }
      : event.key === 'ArrowRight'
        ? { x: step, y: 0 }
        : event.key === 'ArrowUp'
          ? { x: 0, y: -step }
          : { x: 0, y: step }
  rect.value = constrain({ ...rect.value, x: rect.value.x + delta.x, y: rect.value.y + delta.y })
  if (props.persistent) windowStore.commitGeometry(props.windowId, rect.value)
  emit('move', { ...rect.value })
  emit('geometry-change', { ...rect.value })
  emit('move-end', { ...rect.value })
}
function resizeByKeyboard(event: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  emit('resize-start', { ...rect.value })
  const step = event.shiftKey ? 48 : 16
  const delta =
    event.key === 'ArrowLeft'
      ? { x: -step, y: 0 }
      : event.key === 'ArrowRight'
        ? { x: step, y: 0 }
        : event.key === 'ArrowUp'
          ? { x: 0, y: -step }
          : { x: 0, y: step }
  rect.value = constrain(
    resizeRect(rect.value, delta, viewport(), {
      minWidth: props.minWidth,
      minHeight: props.minHeight,
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight,
    }),
  )
  emit('resize', { ...rect.value })
  emit('geometry-change', { ...rect.value })
  if (props.persistent) windowStore.commitGeometry(props.windowId, rect.value)
  emit('resize-end', { ...rect.value })
}
function onPointerDown(event: PointerEvent, mode: 'move' | 'resize'): void {
  if (mode === 'move' && !isMovablePointer(event)) return
  startRect.value = { ...rect.value }
  promote()
  pointerOffset.value =
    mode === 'move'
      ? { x: event.clientX - rect.value.x, y: event.clientY - rect.value.y }
      : { x: event.clientX, y: event.clientY }
  dragging.value = mode === 'move'
  resizing.value = mode === 'resize'
  interactionMode.value = mode
  interaction.start(event)
  if (mode === 'move') emit('move-start', { ...rect.value })
  else emit('resize-start', { ...rect.value })
}
function isMovablePointer(event: PointerEvent): boolean {
  if (event.button !== 0) return false
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('[data-ew-window-no-drag]')) return false
  if (isDedicatedHandle(target)) return true
  return !target?.closest(
    'button,a,input,select,textarea,[contenteditable],[data-ew-window-no-drag]',
  )
}
function isDedicatedHandle(target: Element | null): boolean {
  return Boolean(target?.closest('[data-ew-window-drag-handle]'))
}
function onHeaderPointerDown(event: PointerEvent): void {
  if (!canMove.value || resolvedDragRegion.value !== 'header') return
  onPointerDown(event, 'move')
}
function onRootPointerDown(event: PointerEvent): void {
  promote()
  if (resolvedDragRegion.value === 'handle') {
    const target = event.target instanceof Element ? event.target : null
    if (isDedicatedHandle(target)) onPointerDown(event, 'move')
    return
  }
  if (resolvedDragRegion.value !== 'surface') return
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('header')) return
  onPointerDown(event, 'move')
}
function onPointerMove(event: PointerEvent): void {
  if (!dragging.value && !resizing.value) return
  rect.value = resizing.value
    ? constrain(
        resizeRect(
          startRect.value,
          { x: event.clientX - pointerOffset.value.x, y: event.clientY - pointerOffset.value.y },
          viewport(),
        ),
      )
    : constrain({
        ...startRect.value,
        x: event.clientX - pointerOffset.value.x,
        y: event.clientY - pointerOffset.value.y,
      })
  if (resizing.value) emit('resize', { ...rect.value })
  else emit('move', { ...rect.value })
  emit('geometry-change', { ...rect.value })
}
function onViewportChange(): void {
  const measured = root.value?.getBoundingClientRect()
  const nextRect = {
    ...rect.value,
    ...(props.fitContentWidth && measured && measured.width > 0
      ? { width: measured.width }
      : {}),
    ...(props.fitContentHeight && measured && measured.height > 0
      ? { height: measured.height }
      : {}),
  }
  rect.value = constrain(nextRect)
  if (props.persistent) windowStore.commitGeometry(props.windowId, rect.value)
}
function cancelInteraction(): void {
  interaction.end()
}
watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      promote()
      windowStore.hydrateLayouts()
      rect.value = props.persistent
        ? (() => {
            const storedRect = windowStore.ensureLayout(
              props.windowId,
              { width: props.defaultWidth, height: props.defaultHeight },
              viewport(),
              {
                minWidth: props.minWidth,
                minHeight: props.minHeight,
                maxWidth: props.maxWidth,
                maxHeight: props.maxHeight,
              },
              props.defaultPosition,
            )
            const nextRect = props.resetSizeOnOpen
              ? constrain({ ...storedRect, width: props.defaultWidth, height: props.defaultHeight })
              : storedRect
            if (props.resetSizeOnOpen) windowStore.commitGeometry(props.windowId, nextRect)
            return nextRect
          })()
        : constrain(
            resolveInitialRect(
              undefined,
              viewport(),
              { width: props.defaultWidth, height: props.defaultHeight },
              props.defaultPosition,
            ),
          )
      await nextTick()
      if (props.autoFocus) root.value?.focus()
    } else {
      if (props.persistent && rect.value.width > 0)
        windowStore.commitGeometry(props.windowId, rect.value)
      restoreFocus()
    }
  },
  { immediate: true },
)
onMounted(() => {
  if (
    (!props.windowId || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i.test(props.windowId)) &&
    import.meta.env.DEV
  )
    console.warn(`[GWindow] Invalid window ID: ${props.windowId}`)
  if (mountedWindowIds.has(props.windowId) && import.meta.env.DEV)
    console.warn(`[GWindow] Duplicate mounted window ID: ${props.windowId}`)
  mountedWindowIds.add(props.windowId)
  if (import.meta.env.DEV && !props.title && !props.ariaLabel)
    console.warn(`[GWindow] Titleless window ${props.windowId} requires ariaLabel`)
  if (
    import.meta.env.DEV &&
    !['header', 'surface', 'handle', 'none'].includes(resolvedDragRegion.value)
  )
    console.warn(`[GWindow] Unsupported drag region: ${String(props.dragRegion)}`)
  if (import.meta.env.DEV && !['default', 'none'].includes(props.chrome))
    console.warn(`[GWindow] Unsupported chrome mode: ${String(props.chrome)}`)
  if (
    import.meta.env.DEV &&
    (!Number.isFinite(props.opacity) || props.opacity < 0 || props.opacity > 1)
  )
    console.warn(`[GWindow] Window ${props.windowId} opacity should be between 0 and 1`)
  if (
    import.meta.env.DEV &&
    closeOnEscapeWasProvided.value &&
    props.closeOnEscape &&
    !props.closable
  )
    console.warn(`[GWindow] Window ${props.windowId} has closeOnEscape enabled but is not closable`)
  if (import.meta.env.DEV && !['top', 'right', 'bottom', 'left'].includes(props.headerPlacement))
    console.warn(`[GWindow] Unsupported header placement: ${String(props.headerPlacement)}`)
  if (import.meta.env.DEV && props.resizeMode && !['none', 'corner'].includes(props.resizeMode))
    console.warn(`[GWindow] Unsupported resize mode: ${String(props.resizeMode)}`)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('blur', cancelInteraction)
  window.visualViewport?.addEventListener('resize', onViewportChange)
  window.visualViewport?.addEventListener('scroll', onViewportChange)
  const observer =
    typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(onViewportChange)
  if (root.value) observer?.observe(root.value)
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', cancelInteraction)
  onBeforeUnmount(() => observer?.disconnect())
})
onBeforeUnmount(() => {
  mountedWindowIds.delete(props.windowId)
  if (props.persistent) windowStore.commitGeometry(props.windowId, rect.value)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('blur', cancelInteraction)
  window.visualViewport?.removeEventListener('resize', onViewportChange)
  window.visualViewport?.removeEventListener('scroll', onViewportChange)
  document.removeEventListener('visibilitychange', cancelInteraction)
  restoreFocus()
  document.removeEventListener('keydown', onKeydown)
})
</script>
<template>
  <Teleport to="body"
    ><section
      v-if="open"
      ref="root"
      :id="windowId"
      class="ew-window-frame"
      :class="{ 'ew-window-dragging': dragging, 'ew-window-body-flush': bodyFlush }"
      :data-active="active ? 'true' : 'false'"
      :data-header-placement="headerPlacement"
      :data-title-size="titleSize"
      :data-header-size="headerSize"
      :data-header-visible="headerVisible ? 'true' : 'false'"
      :data-fit-content-height="fitContentHeight ? 'true' : 'false'"
      :data-fit-content-width="fitContentWidth ? 'true' : 'false'"
      :data-movable="canMove ? 'true' : 'false'"
      :data-drag-region="resolvedDragRegion"
      :data-chrome="chrome"
      :data-dragging="dragging ? 'true' : 'false'"
      :data-surface="surface"
      :data-header-surface="headerSurface"
      :data-resize-mode="resolvedResizeMode"
      :style="style"
      :tabindex="canMove && resolvedDragRegion === 'surface' ? 0 : -1"
      role="dialog"
      :aria-label="ariaLabel ? ariaLabelText : undefined"
      :aria-labelledby="!ariaLabel && hasTitle ? `${windowId}-title` : undefined"
      @pointerdown="onRootPointerDown"
      @focusin="promote"
      @pointermove="interaction.move"
      @pointerup="interaction.end"
      @pointercancel="interaction.end"
      @lostpointercapture="interaction.end"
    >
      <header v-if="headerVisible" class="ew-window-header" @pointerdown="onHeaderPointerDown">
        <div class="ew-window-header-leading"><slot name="header-leading" /></div>
        <div class="ew-window-header-content">
          <span
            v-if="hasHeaderSlot && hasTitle"
            class="ew-visually-hidden"
            :id="`${windowId}-title`"
          >
            <GText :content="title" />
          </span>
          <slot name="header">
            <h2 v-if="hasTitle" :id="`${windowId}-title`"><GText :content="title" /></h2>
          </slot>
        </div>
        <div class="ew-window-header-actions">
          <slot name="header-actions" /><button
            v-if="closable"
            class="ew-window-close ew-button"
            type="button"
            :aria-label="closeText"
            @click="close"
          >
            <svg
              class="ew-window-close__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </header>
      <div class="ew-window-body"><slot /></div>
      <button
        v-if="resolvedResizeMode === 'corner'"
        class="ew-window-resize-handle"
        type="button"
        :aria-label="resizeText"
        @pointerdown.stop="onPointerDown($event, 'resize')"
        @keydown="resizeByKeyboard"
      >
        <slot name="resize-handle" />
      </button></section
  ></Teleport>
</template>
