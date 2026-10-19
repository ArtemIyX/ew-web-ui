<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue?: number; min?: number; max?: number; step?: number; disabled?: boolean }>(), { modelValue: 0, min: 0, max: 99, step: 1 })
const emit = defineEmits<{ 'update:modelValue': [value: number]; change: [value: number] }>()
function update(value: number) { const next = Math.min(props.max, Math.max(props.min, value)); emit('update:modelValue', next); emit('change', next) }
</script>
<template><div class="ew-stepper"><button class="ew-button" type="button" :disabled="disabled || modelValue <= min" @click="update(modelValue - step)">-</button><output>{{ modelValue }}</output><button class="ew-button" type="button" :disabled="disabled || modelValue >= max" @click="update(modelValue + step)">+</button></div></template>
