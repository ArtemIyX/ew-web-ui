<script setup lang="ts">
import type { SemanticTone } from '@/shared/types/components'
import type { TextContent } from '@/shared/types/components'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = withDefaults(defineProps<{ tone?: SemanticTone; title?: TextContent; announce?: boolean }>(), { tone: 'neutral', announce: false })
const titleText = useLocalizedText(() => props.title)
</script>
<template><article class="ew-toast" :data-tone="tone" :role="announce ? 'status' : undefined"><strong v-if="title">{{ titleText }}</strong><slot /></article></template>
