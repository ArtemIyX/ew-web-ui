<script setup lang="ts">
import type { SelectOption } from '@/shared/types/components'
import { useLocalizedTexts } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ modelValue?: string | number; options: ReadonlyArray<SelectOption<string | number>>; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number]; change: [value: string | number] }>()
const labels = useLocalizedTexts(() => props.options.map((option) => option.label))
function select(value: string | number) { emit('update:modelValue', value); emit('change', value) }
</script>
<template><div class="ew-segmented" role="group"><button v-for="(option, index) in options" :key="String(option.value)" class="ew-button" type="button" :disabled="disabled || option.disabled" :aria-pressed="modelValue === option.value" @click="select(option.value)">{{ labels[index] }}</button></div></template>
