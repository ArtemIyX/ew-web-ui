<script setup lang="ts">
import { provide, ref } from 'vue'
import type { SemanticTone } from '@/shared/types/components'
import GText from '../../components/content/GText/GText.vue'
import type { TextContent } from '@/shared/types/components'
import { toastKey } from './toastContext'
const items = ref<{ id: string; tone: SemanticTone; message: TextContent }[]>([])
let nextToastId = 0
const show = (message: TextContent, tone: SemanticTone = 'neutral') => { const id = `toast-${++nextToastId}`; items.value.push({ id, tone, message }); return id }
const dismiss = (id: string) => { items.value = items.value.filter((item) => item.id !== id) }
provide(toastKey, { items, show, dismiss })
</script>
<template><slot /><div class="ew-toast-region" aria-live="polite"><article v-for="item in items" :key="item.id" class="ew-toast" :data-tone="item.tone"><GText :content="item.message" /></article></div></template>
