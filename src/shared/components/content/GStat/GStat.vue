<script setup lang="ts">
import type { TextContent } from '@/shared/types/components'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ label: TextContent; value: TextContent; detail?: TextContent }>()
const label = useLocalizedText(() => props.label)
const value = useLocalizedText(() => props.value)
const detail = useLocalizedText(() => props.detail)
</script>
<template>
  <dl class="ew-stat"><dt>{{ label }}</dt><dd>{{ value }}</dd><dd v-if="props.detail" class="ew-caption">{{ detail }}</dd></dl>
</template>
