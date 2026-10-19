<script setup lang="ts">import GText from '../GText/GText.vue'; import type { TextContent } from '@/shared/types/components'; defineProps<{ content?: TextContent }>()</script>
<template><span class="ew-badge"><slot v-if="content === undefined" /><GText v-else :content="content" /></span></template>
