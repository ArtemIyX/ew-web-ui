<script setup lang="ts">
import type { TextContent } from '@/shared/types/components'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ modelValue?: string; type?: string; placeholder?: TextContent; disabled?: boolean; readonly?: boolean }>()
const placeholderText = useLocalizedText(() => props.placeholder)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <input class="ew-input" :type="type ?? 'text'" :value="modelValue ?? ''" :placeholder="placeholderText"
    :disabled="disabled" :readonly="readonly" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>
