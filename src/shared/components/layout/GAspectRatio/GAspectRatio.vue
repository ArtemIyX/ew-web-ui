<script setup lang="ts">withDefaults(defineProps<{ ratio?: `${number} / ${number}` }>(), { ratio: '16 / 9' })</script>
<template><div class="ew-aspect-ratio" :style="{ '--ew-aspect-ratio': ratio }"><slot /></div></template>
