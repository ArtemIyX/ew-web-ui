<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { useAttrs } from 'vue'
const attrs = useAttrs()
defineProps<{ modelValue?: number | null }>()
defineEmits<{ 'update:modelValue': [value: number | null] }>()
</script>
<template>
  <input
    v-bind="attrs"
    class="ew-input"
    type="number"
    :value="modelValue ?? ''"
    @input="
      $emit(
        'update:modelValue',
        ($event.target as HTMLInputElement).value === ''
          ? null
          : Number(($event.target as HTMLInputElement).value),
      )
    "
  />
</template>
