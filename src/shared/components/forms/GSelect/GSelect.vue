<script setup lang="ts">
import { computed } from 'vue'
import type { SelectOption } from '@/shared/types/components'
import { useLocalizedTexts } from '@/shared/composables/localization/useLocalizedText'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  modelValue?: string | number
  options?: ReadonlyArray<SelectOption<string | number>>
  disabled?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()
const options = computed(() => props.options ?? [])
const labels = useLocalizedTexts(() => options.value.map((option) => option.label))
function onChange(event: Event) {
  const raw = (event.target as HTMLSelectElement).value
  const value = options.value.find((option) => String(option.value) === raw)?.value ?? raw
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
<template>
  <span class="ew-select-wrap">
    <select
      v-bind="$attrs"
      class="ew-select"
      :disabled="props.disabled"
      :value="modelValue"
      @change="onChange"
    >
      <option v-for="(option, index) in options" :key="String(option.value)" :value="option.value">
        {{ labels[index] }}
      </option>
      <slot v-if="!props.options" />
    </select>
    <span class="ew-select__arrow" aria-hidden="true"></span>
  </span>
</template>
