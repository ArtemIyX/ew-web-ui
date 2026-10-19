<script setup lang="ts">defineProps<{ href?: string; external?: boolean }>()</script>
<template><a class="ew-link" :href="href" :target="external ? '_blank' : undefined" :rel="external ? 'noreferrer' : undefined"><slot /></a></template>
