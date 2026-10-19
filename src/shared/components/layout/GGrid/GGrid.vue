<script setup lang="ts">defineProps<{ min?: `${number}${'rem' | 'em' | 'ch' | 'vw' | 'vh' | '%'}` }>()</script>
<template><div class="ew-grid" :style="min ? { '--ew-grid-min': min } : undefined"><slot /></div></template>
