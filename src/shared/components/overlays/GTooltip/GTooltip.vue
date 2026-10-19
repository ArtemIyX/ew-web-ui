<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import {
  useTooltipController,
  type TooltipCloseReason,
} from '@/shared/composables/overlays/useTooltipController'
import type { TooltipPlacement } from '@/shared/types/components'

const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    placement?: TooltipPlacement
    fallbackPlacements?: readonly TooltipPlacement[]
    openDelayMs?: number
    closeDelayMs?: number
    offsetRem?: number
    viewportPaddingRem?: number
    touchMode?: 'long-press' | 'disabled'
    teleportTo?: string | HTMLElement
  }>(),
  {
    open: undefined,
    placement: 'top',
    fallbackPlacements: () => ['bottom', 'right', 'left'],
    openDelayMs: 350,
    closeDelayMs: 100,
    offsetRem: 0.5,
    viewportPaddingRem: 0.5,
    touchMode: 'long-press',
  },
)
const emit = defineEmits<{
  'update:open': [open: boolean]
  open: []
  close: [reason: TooltipCloseReason]
}>()
const instance = getCurrentInstance()
const controlledOpen =
  instance && Object.prototype.hasOwnProperty.call(instance.vnode.props ?? {}, 'open')
    ? computed(() => props.open)
    : undefined
const controller = useTooltipController({
  open: controlledOpen,
  defaultOpen: props.defaultOpen,
  disabled: computed(() => props.disabled),
  placement: computed(() => props.placement),
  fallbackPlacements: computed(() => props.fallbackPlacements),
  openDelayMs: computed(() => props.openDelayMs),
  closeDelayMs: computed(() => props.closeDelayMs),
  offsetRem: computed(() => props.offsetRem),
  viewportPaddingRem: computed(() => props.viewportPaddingRem),
  touchMode: computed(() => props.touchMode),
  emit: (event, ...args) => {
    if (event === 'update:open') emit('update:open', args[0] as boolean)
    if (event === 'open') emit('open')
    if (event === 'close') emit('close', args[0] as TooltipCloseReason)
  },
})
const isOpen = controller.isOpen
const triggerBinding = controller.triggerBinding
</script>

<template>
  <div class="ew-tooltip">
    <template v-if="$slots.trigger">
      <slot name="trigger" :trigger-props="triggerBinding" :open="isOpen" />
    </template>
    <span v-else class="ew-tooltip__legacy-trigger" v-bind="triggerBinding"><slot /></span>
    <Teleport :to="props.teleportTo ?? 'body'">
      <div
        v-if="isOpen && !props.disabled"
        :ref="controller.setTooltip"
        class="ew-tooltip__content"
        role="tooltip"
        :id="controller.tooltipId"
      >
        <slot
          :tooltip-id="controller.tooltipId"
          :placement="props.placement"
          :close="controller.close"
        />
      </div>
    </Teleport>
  </div>
</template>
