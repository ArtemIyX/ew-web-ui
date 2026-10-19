<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{ modelValue?: boolean; disabled?: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
<template>
  <label class="ew-status"><input v-bind="$attrs" class="ew-checkbox" type="checkbox" :checked="props.modelValue" :disabled="props.disabled" @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" /><slot /></label>
</template>
