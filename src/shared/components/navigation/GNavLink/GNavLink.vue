<script setup lang="ts">defineProps<{ href?: string; active?: boolean }>()</script>
<template><a class="ew-nav-link" :href="href" :aria-current="active ? 'page' : undefined"><slot /></a></template>
