<script setup lang="ts">
import type { IconSource } from '@/shared/types/components'
import type { TextContent } from '@/shared/types/components'
import { useIconSource } from '@/shared/composables/icons/useIconSource'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ source?: IconSource; name?: string; label?: TextContent }>()
const src = useIconSource(() => props.source)
const labelText = useLocalizedText(() => props.label)
</script>
<template>
  <span class="ew-icon" :aria-hidden="!props.label" :aria-label="labelText">
    <img v-if="src" :src="src" :alt="labelText" />
    <span v-else-if="props.name" class="ew-icon__fallback">{{ props.name }}</span>
  </span>
</template>
