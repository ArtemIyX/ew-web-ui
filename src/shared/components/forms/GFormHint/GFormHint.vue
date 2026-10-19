<script setup lang="ts">import GText from '../../../components/content/GText/GText.vue'; import type { TextContent } from '@/shared/types/components'; defineProps<{ content?: TextContent }>()</script>
<template><p class="ew-field__hint"><slot v-if="content === undefined" /><GText v-else :content="content" /></p></template>
