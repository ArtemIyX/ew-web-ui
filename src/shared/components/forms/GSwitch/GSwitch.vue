<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{ modelValue?: boolean; disabled?: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
<template>
  <label class="ew-status">
    <span class="ew-switch-control">
      <input v-bind="$attrs" class="ew-switch" type="checkbox" role="switch" :checked="props.modelValue" :disabled="props.disabled" @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
      <span class="ew-switch__track" aria-hidden="true"></span>
      <span class="ew-switch__thumb" aria-hidden="true"></span>
    </span>
    <slot />
  </label>
</template>
