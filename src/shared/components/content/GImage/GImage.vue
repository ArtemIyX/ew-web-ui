<script setup lang="ts">
import type { IconSource } from '@/shared/types/components'
import type { TextContent } from '@/shared/types/components'
import { useIconSource } from '@/shared/composables/icons/useIconSource'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = withDefaults(defineProps<{ source?: IconSource; alt?: TextContent; loading?: 'eager' | 'lazy' }>(), {
  alt: '', loading: 'lazy',
})
const src = useIconSource(() => props.source)
const altText = useLocalizedText(() => props.alt)
</script>
<template>
  <span class="ew-image">
    <img v-if="src" :src="src" :alt="altText" :loading="props.loading" />
    <span v-else class="ew-image__fallback" role="img" :aria-label="altText"></span>
  </span>
</template>
