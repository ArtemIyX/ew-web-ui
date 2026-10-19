<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'info' | 'success' | 'danger'; live?: boolean }>(), { live: false })
</script>
<template><div class="ew-alert" :class="tone && `ew-alert--${tone}`" :role="live ? (tone === 'danger' ? 'alert' : 'status') : undefined"><slot /></div></template>
