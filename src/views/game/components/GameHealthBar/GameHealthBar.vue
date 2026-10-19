<script setup lang="ts">
import { computed } from 'vue'
import GProgress from '@/shared/components/feedback/GProgress/GProgress.vue'
import { normalizeResourceValue } from '@/views/game/utilities/normalizeResourceValue'
import type { ResourceDisplayMode, ResourceValue } from '@/views/game/types/gameResources'

const props = withDefaults(
  defineProps<{
    value: ResourceValue
    displayMode: ResourceDisplayMode
    accessibleOwnerName: string
    size?: 'compact' | 'standard' | 'prominent'
  }>(),
  { size: 'standard' },
)
const emit = defineEmits<{ toggle: [] }>()
const normalized = computed(() => normalizeResourceValue(props.value))
const displayText = computed(() =>
  props.displayMode === 'exact'
    ? `${normalized.value.current} / ${normalized.value.maximum}`
    : `${normalized.value.percentage.toFixed(0)}%`,
)
const ariaLabel = computed(() => `Health — ${props.accessibleOwnerName}`)
const ariaValueText = computed(
  () => `${normalized.value.current} of ${normalized.value.maximum}, ${normalized.value.percentage.toFixed(0)} percent`,
)
</script>

<template>
  <button
    type="button"
    class="ew-game-health-bar"
    :class="`ew-game-health-bar--${size}`"
    data-ew-window-no-drag
    :aria-label="ariaLabel"
    :title="ariaValueText"
    @click="emit('toggle')"
  >
    <GProgress
      :value="normalized.current"
      :max="normalized.maximum"
      tone="hp"
      size="lg"
      shape="angled"
      :animated="false"
      :aria-label="ariaLabel"
      :aria-value-text="ariaValueText"
    >
      <template #overlay>{{ displayText }}</template>
    </GProgress>
  </button>
</template>
