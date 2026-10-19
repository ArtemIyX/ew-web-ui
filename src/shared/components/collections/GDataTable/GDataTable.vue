<script setup lang="ts">import GText from '../../content/GText/GText.vue'; import type { TextContent } from '@/shared/types/components'; defineProps<{ caption?: TextContent }>()</script>
<template><div class="ew-data-table"><table><caption v-if="caption"><GText :content="caption" /></caption><slot /></table></div></template>
