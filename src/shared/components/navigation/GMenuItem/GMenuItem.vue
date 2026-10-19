<script setup lang="ts">defineProps<{ disabled?: boolean }>()</script>
<template><li class="ew-menu-item"><button class="ew-button" type="button" role="menuitem" :disabled="disabled"><slot /></button></li></template>
