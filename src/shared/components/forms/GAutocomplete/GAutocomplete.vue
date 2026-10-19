<script setup lang="ts">import GCombo from '../GCombo/GCombo.vue'; defineProps<{ modelValue?: string; disabled?: boolean }>(); defineEmits<{ 'update:modelValue': [value: string] }>()</script>
<template><GCombo class="ew-autocomplete" :model-value="modelValue" :disabled="disabled" @update:model-value="$emit('update:modelValue', String($event))"><slot /></GCombo></template>
