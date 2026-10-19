<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import GTooltip from '@/shared/components/overlays/GTooltip/GTooltip.vue'
import SkillTooltipContent from './SkillTooltipContent.vue'
import type { TooltipCloseReason } from '@/shared/composables/overlays/useTooltipController'
import type { TooltipPlacement } from '@/shared/types/components'
import type { SkillTooltipModel } from '../../types/skills'

const props = withDefaults(
  defineProps<{
    model: SkillTooltipModel
    showDebugMetadata?: boolean
    density?: 'compact' | 'comfortable'
    disabled?: boolean
    open?: boolean
    defaultOpen?: boolean
    placement?: TooltipPlacement
    fallbackPlacements?: readonly TooltipPlacement[]
    openDelayMs?: number
    closeDelayMs?: number
    touchMode?: 'long-press' | 'disabled'
  }>(),
  {
    showDebugMetadata: false,
    density: 'compact',
    open: undefined,
    placement: 'top',
    openDelayMs: 350,
    closeDelayMs: 100,
    touchMode: 'long-press',
  },
)
const emit = defineEmits<{
  'update:open': [open: boolean]
  open: [skillId: string]
  close: [skillId: string, reason: TooltipCloseReason]
}>()
const instance = getCurrentInstance()
const hasOpenProp = Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'open')
const overlayProps = computed(() => ({
  ...(hasOpenProp ? { open: props.open } : {}),
  defaultOpen: props.defaultOpen,
  disabled: props.disabled,
  placement: props.placement,
  fallbackPlacements: props.fallbackPlacements,
  openDelayMs: props.openDelayMs,
  closeDelayMs: props.closeDelayMs,
  touchMode: props.touchMode,
}))

function logOpened() {
  if (import.meta.env.DEV) {
    console.log(`[SkillTooltip] opened: ${props.model.skillId}`)
  }
  emit('open', props.model.skillId)
}

function logClosed(reason: TooltipCloseReason) {
  if (import.meta.env.DEV) {
    console.log(`[SkillTooltip] closed: ${props.model.skillId}; reason=${reason}`)
  }
  emit('close', props.model.skillId, reason)
}
</script>

<template>
  <GTooltip
    v-bind="overlayProps"
    @update:open="emit('update:open', $event)"
    @open="logOpened"
    @close="logClosed"
  >
    <template #trigger="scope"><slot name="trigger" v-bind="scope" /></template>
    <SkillTooltipContent
      :model="model"
      :show-debug-metadata="showDebugMetadata"
      :density="density"
    />
  </GTooltip>
</template>
