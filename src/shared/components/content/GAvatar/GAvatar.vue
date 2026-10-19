<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IconSource } from '@/shared/types/components'
import type { TextContent } from '@/shared/types/components'
import { useIconSource } from '@/shared/composables/icons/useIconSource'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = withDefaults(defineProps<{ source?: IconSource; label?: TextContent; size?: 'sm' | 'md' | 'lg' }>(), {
  label: '',
  size: 'md',
})
const src = useIconSource(() => props.source)
const labelText = useLocalizedText(() => props.label)
const imageFailed = ref(false)
watch(src, () => { imageFailed.value = false })
</script>
<template>
  <span class="ew-avatar" :data-size="props.size">
    <img v-if="src && !imageFailed" :src="src" :alt="labelText" @error="imageFailed = true" />
    <span v-else aria-hidden="true">{{ labelText.slice(0, 1).toUpperCase() }}</span>
  </span>
</template>
