<script setup lang="ts">
import { computed } from 'vue'
import GProgress from '@/shared/components/feedback/GProgress/GProgress.vue'
import type {
  ResourceDisplayMode,
  ResourceKind,
  ResourceValue,
} from '@/views/game/types/playerStatus'
import type { ProgressShape } from '@/shared/types/progress'

const props = defineProps<{
  kind: ResourceKind
  value: ResourceValue
  mode: ResourceDisplayMode
  label: string
  tone: 'hp' | 'mp' | 'energy'
  shape?: ProgressShape
  secondary?: boolean
}>()
const emit = defineEmits<{ toggle: [] }>()
const current = computed(() => Math.min(props.value.maximum, Math.max(0, props.value.current)))
const maximum = computed(() => Math.max(0, props.value.maximum))
const percentage = computed(() => (maximum.value > 0 ? (current.value / maximum.value) * 100 : 0))
const visibleText = computed(() =>
  props.mode === 'exact'
    ? `${current.value} / ${maximum.value}`
    : `${percentage.value.toFixed(0)}%`,
)
const ariaValueText = computed(
  () =>
    `${props.label}: ${current.value} of ${maximum.value}, ${percentage.value.toFixed(0)} percent`,
)
</script>

<template>
  <button
    class="ew-player-status__resource"
    :class="{ 'ew-player-status__resource--secondary': secondary }"
    type="button"
    :data-resource-kind="kind"
    data-ew-window-no-drag
    :aria-label="`${label}. ${ariaValueText}. Activate to switch display.`"
    :title="ariaValueText"
    @click="emit('toggle')"
  >
    <GProgress
      :value="current"
      :max="maximum"
      :tone="tone"
      :shape="secondary ? 'angled' : (shape ?? 'angled')"
      :size="secondary ? 'sm' : 'lg'"
      :show-value="false"
      :aria-label="label"
      :aria-value-text="ariaValueText"
    >
      <template v-if="!secondary" #overlay>{{ visibleText }}</template>
    </GProgress>
  </button>
</template>
