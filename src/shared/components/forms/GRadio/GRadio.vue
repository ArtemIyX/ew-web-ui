<script setup lang="ts">
defineProps<{ modelValue?: string | number; value: string | number; name: string }>()
defineEmits<{ 'update:modelValue': [value: string | number] }>()
</script>
<template>
  <label class="ew-status"><input class="ew-radio" type="radio" :name="name" :value="value" :checked="modelValue === value" @change="$emit('update:modelValue', value)" /><slot /></label>
</template>

