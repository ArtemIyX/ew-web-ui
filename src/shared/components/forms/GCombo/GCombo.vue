<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import type { SelectOption } from '@/shared/types/components'
import { useStableId } from '@/shared/composables/state/useStableId'
import { useLocalizedTexts } from '@/shared/composables/localization/useLocalizedText'

const props = defineProps<{
  modelValue?: string | number
  options?: ReadonlyArray<SelectOption<string | number>>
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const listId = useStableId('ew-combo-options')
const labels = useLocalizedTexts(() => props.options?.map((option) => option.label) ?? [])
function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  emit(
    'update:modelValue',
    props.options?.find((option) => String(option.value) === raw)?.value ?? raw,
  )
}
</script>
<template>
  <div class="ew-combo">
    <input
      v-bind="$attrs"
      class="ew-input"
      :list="listId"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @input="onInput"
    />
    <datalist :id="listId">
      <option
        v-for="(option, index) in options"
        :key="String(option.value)"
        :value="String(option.value)"
      >
        {{ labels[index] }}
      </option>
    </datalist>
    <slot />
  </div>
</template>
