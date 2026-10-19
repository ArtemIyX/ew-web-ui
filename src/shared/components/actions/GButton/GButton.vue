<script setup lang="ts">
withDefaults(defineProps<{ type?: 'button' | 'submit' | 'reset'; disabled?: boolean; loading?: boolean; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'bronze' | 'dark' | 'link' | 'outline' }>(), { variant: 'primary' })
</script>
<template>
  <button class="ew-button" :class="variant ? `ew-button--${variant}` : ''" :type="type ?? 'button'" :disabled="disabled || loading">
    <span v-if="loading" class="ew-spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>
