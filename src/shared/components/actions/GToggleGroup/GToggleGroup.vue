<script setup lang="ts">
import { computed } from 'vue'
import type { SelectOption } from '@/shared/types/components'
import { useLocalizedTexts } from '@/shared/composables/localization/useLocalizedText'
type Value = string | number
const props = withDefaults(defineProps<{ modelValue?: Value | Value[]; multiple?: boolean; options?: ReadonlyArray<SelectOption<Value>> }>(), { multiple: false })
const emit = defineEmits<{ 'update:modelValue': [value: Value | Value[]] }>()
const selected = computed(() => Array.isArray(props.modelValue) ? props.modelValue : props.modelValue === undefined ? [] : [props.modelValue])
const labels = useLocalizedTexts(() => props.options?.map((option) => option.label) ?? [])
function choose(value: Value) { const next = props.multiple ? (selected.value.includes(value) ? selected.value.filter((item) => item !== value) : [...selected.value, value]) : value; emit('update:modelValue', next) }
</script>
<template><div class="ew-toggle-group" role="group"><button v-for="(option, index) in props.options" :key="String(option.value)" class="ew-button" type="button" :disabled="option.disabled" :aria-pressed="selected.includes(option.value)" @click="choose(option.value)">{{ labels[index] }}</button><slot v-if="!props.options" /></div></template>
