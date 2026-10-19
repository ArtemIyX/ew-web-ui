<script setup lang="ts">
defineProps<{ modelValue?: string; disabled?: boolean; readonly?: boolean }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <textarea class="ew-textarea" :value="modelValue ?? ''" :disabled="disabled" :readonly="readonly"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
</template>

