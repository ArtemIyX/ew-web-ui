import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useStableId } from '@/shared/composables/state/useStableId'
import { computeTooltipPosition } from '@/shared/utilities/overlays/tooltipPosition'
import type { TooltipPlacement } from '@/shared/types/components'

export type TooltipCloseReason =
  'pointer-leave' | 'blur' | 'escape' | 'pointer-down' | 'outside' | 'disabled' | 'unmount'

export interface TooltipControllerOptions {
  open?: Ref<boolean | undefined>
  defaultOpen?: boolean
  disabled?: Ref<boolean>
  placement: Ref<TooltipPlacement>
  fallbackPlacements: Ref<readonly TooltipPlacement[]>
  openDelayMs: Ref<number>
  closeDelayMs: Ref<number>
  offsetRem: Ref<number>
  viewportPaddingRem: Ref<number>
  touchMode: Ref<'long-press' | 'disabled'>
  emit: (event: 'update:open' | 'open' | 'close', ...args: unknown[]) => void
}

export function useTooltipController(options: TooltipControllerOptions) {
  const trigger = ref<HTMLElement | null>(null)
  const tooltip = ref<HTMLElement | null>(null)
  const internalOpen = ref(options.defaultOpen ?? false)
  const hovering = ref(false)
  const focused = ref(false)
  const pointerMovedSinceEnter = ref(false)
  const tooltipId = useStableId('ew-tooltip')
  const triggerId = useStableId('ew-tooltip-trigger')
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let longPressTimer: ReturnType<typeof setTimeout> | undefined
  let frame: number | undefined
  let observer: ResizeObserver | undefined
  let suppressClick = false
  let pointerInitiatedFocus = false

  const isControlled = computed(() => options.open?.value !== undefined)
  const isOpen = computed(() =>
    isControlled.value ? options.open?.value === true : internalOpen.value,
  )
  const triggerBinding = computed(() => ({
    id: triggerId,
    ref: (element: unknown) => {
      trigger.value = element instanceof HTMLElement ? element : null
    },
    ...(isOpen.value && !options.disabled?.value ? { 'aria-describedby': tooltipId } : {}),
    onPointerenter: (event: PointerEvent) => pointerEnter(event),
    onPointerleave: (event: PointerEvent) => pointerLeave(event),
    onPointermove: (event: PointerEvent) => pointerMove(event),
    onPointerdown: (event: PointerEvent) => pointerDown(event),
    onPointerup: (event: PointerEvent) => pointerUp(event),
    onPointercancel: (event: PointerEvent) => pointerCancel(event),
    onFocusin: () => {
      focused.value = true
      if (!pointerInitiatedFocus) openNow()
    },
    onFocusout: () => {
      focused.value = false
      close('blur')
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close('escape')
      }
    },
  }))

  function setOpen(value: boolean, reason?: TooltipCloseReason) {
    if (options.disabled?.value && value) return
    if (import.meta.env.DEV) {
      console.log(
        `[GTooltip] state change; open=${value}; reason=${reason ?? 'requested'}; controlled=${isControlled.value}`,
      )
    }
    if (isControlled.value) {
      options.emit('update:open', value)
    } else {
      internalOpen.value = value
    }
    if (value) options.emit('open')
    else if (reason) options.emit('close', reason)
  }
  function clearTimers() {
    if (openTimer) clearTimeout(openTimer)
    if (closeTimer) clearTimeout(closeTimer)
    if (longPressTimer) clearTimeout(longPressTimer)
    openTimer = undefined
    closeTimer = undefined
    longPressTimer = undefined
  }
  function openNow() {
    clearTimers()
    if (!isOpen.value) setOpen(true)
  }
  function scheduleOpen(event: PointerEvent) {
    if (options.disabled?.value || event.pointerType === 'touch') return
    clearTimers()
    openTimer = setTimeout(openNow, Math.max(0, options.openDelayMs.value))
  }
  function close(reason: TooltipCloseReason) {
    clearTimers()
    if (isOpen.value && import.meta.env.DEV) {
      console.log(`[GTooltip] close requested; reason=${reason}`)
    }
    if (isOpen.value) setOpen(false, reason)
  }
  function pointerEnter(event: PointerEvent) {
    hovering.value = true
    pointerMovedSinceEnter.value = false
    scheduleOpen(event)
  }
  function pointerMove(_event: PointerEvent) {
    pointerMovedSinceEnter.value = true
  }
  function pointerLeave(event: PointerEvent) {
    if (import.meta.env.DEV) {
      console.log(
        `[GTooltip] pointerleave; pointerType=${event.pointerType}; moved=${pointerMovedSinceEnter.value}`,
      )
    }
    hovering.value = false
    if (event.pointerType === 'touch') return
    clearTimers()
    closeTimer = setTimeout(
      () => {
        const relatedTarget = event.relatedTarget
        const returnedToTrigger =
          relatedTarget instanceof Node && trigger.value?.contains(relatedTarget)
        if (focused.value || returnedToTrigger) {
          hovering.value = true
          return
        }
        close('pointer-leave')
      },
      Math.max(0, options.closeDelayMs.value),
    )
  }
  function pointerDown(event: PointerEvent) {
    pointerInitiatedFocus = event.pointerType !== 'touch'
    close('pointer-down')
    if (event.pointerType === 'touch' && options.touchMode.value === 'long-press') {
      longPressTimer = setTimeout(() => {
        suppressClick = true
        openNow()
      }, 500)
    }
  }
  function pointerUp(event: PointerEvent) {
    pointerInitiatedFocus = false
    if (event.pointerType === 'touch' && longPressTimer) clearTimeout(longPressTimer)
  }
  function pointerCancel(event: PointerEvent) {
    pointerInitiatedFocus = false
    if (event.pointerType === 'touch') clearTimers()
  }
  function onDocumentPointerDown(event: PointerEvent) {
    if (isOpen.value && !trigger.value?.contains(event.target as Node)) {
      close('outside')
    }
  }
  function onDocumentClick(event: MouseEvent) {
    if (suppressClick) {
      event.preventDefault()
      event.stopPropagation()
      suppressClick = false
    }
  }
  function onGeometryChange() {
    if (!isOpen.value || !trigger.value || !tooltip.value) return
    const triggerRect = trigger.value.getBoundingClientRect()
    const tooltipRect = tooltip.value.getBoundingClientRect()
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const result = computeTooltipPosition({
      anchor: triggerRect,
      tooltip: { width: tooltipRect.width, height: tooltipRect.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      preferredPlacement: options.placement.value,
      fallbackPlacements: options.fallbackPlacements.value,
      offset: options.offsetRem.value * rootSize,
      viewportPadding: options.viewportPaddingRem.value * rootSize,
    })
    tooltip.value.style.setProperty('--ew-tooltip-x', `${result.x / rootSize}rem`)
    tooltip.value.style.setProperty('--ew-tooltip-y', `${result.y / rootSize}rem`)
    tooltip.value.dataset.placement = result.placement
  }
  function scheduleGeometry() {
    if (frame !== undefined) return
    frame = requestAnimationFrame(() => {
      frame = undefined
      onGeometryChange()
    })
  }
  function setTooltip(element: unknown) {
    tooltip.value = element instanceof HTMLElement ? element : null
    if (!element) {
      observer?.disconnect()
      observer = undefined
      return
    }
    observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(scheduleGeometry)
    if (tooltip.value) observer?.observe(tooltip.value)
    scheduleGeometry()
  }
  watch(
    isOpen,
    (value) => {
      if (value) {
        window.addEventListener('resize', scheduleGeometry)
        window.addEventListener('scroll', scheduleGeometry, true)
        document.addEventListener('pointerdown', onDocumentPointerDown)
        document.addEventListener('click', onDocumentClick, true)
        scheduleGeometry()
      } else {
        window.removeEventListener('resize', scheduleGeometry)
        window.removeEventListener('scroll', scheduleGeometry, true)
        document.removeEventListener('pointerdown', onDocumentPointerDown)
        document.removeEventListener('click', onDocumentClick, true)
      }
    },
    { immediate: true },
  )
  watch(
    () => options.disabled?.value,
    (disabled) => {
      if (disabled) close('disabled')
    },
  )
  onBeforeUnmount(() => {
    if (import.meta.env.DEV) console.log('[GTooltip] unmount')
    clearTimers()
    if (frame !== undefined) cancelAnimationFrame(frame)
    observer?.disconnect()
    close('unmount')
    window.removeEventListener('resize', scheduleGeometry)
    window.removeEventListener('scroll', scheduleGeometry, true)
    document.removeEventListener('pointerdown', onDocumentPointerDown)
    document.removeEventListener('click', onDocumentClick, true)
  })
  return { isOpen, tooltipId, triggerBinding, setTooltip, close, hovering }
}
