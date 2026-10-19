<script setup lang="ts">
defineProps<{ columns?: number }>()
</script>
<template><div class="ew-stat-list" :data-columns="columns"><slot /></div></template>
