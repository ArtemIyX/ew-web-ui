<script setup lang="ts">defineProps<{ selected?: boolean; disabled?: boolean }>()</script>
<template><li class="ew-list-item" role="option" :aria-selected="selected" :aria-disabled="disabled"><slot /></li></template>
