<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { computed } from 'vue'

const props = withDefaults(defineProps<{ modelValue?: number; min?: number; max?: number; step?: number; disabled?: boolean }>(), {
  modelValue: 0,
  min: 0,
  max: 100,
})
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const currentValue = computed({ get: () => props.modelValue, set: (value: number) => emit('update:modelValue', value) })

const progress = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((currentValue.value - props.min) / range) * 100))
})

function updateValue(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  currentValue.value = value
}
</script>
<template>
  <span class="ew-slider" :style="{ '--ew-slider-progress': `${progress}%` }">
    <span class="ew-slider__track" aria-hidden="true"><span class="ew-slider__fill"></span></span>
    <input v-bind="$attrs" class="ew-range" type="range" :value="currentValue" :min="props.min" :max="props.max" :step="step" :disabled="props.disabled" @input="updateValue" />
    <span class="ew-slider__thumb" aria-hidden="true"></span>
  </span>
</template>
