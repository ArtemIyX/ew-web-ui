<script setup lang="ts">
import { provide } from 'vue'
import type { IconSource } from '@/shared/types/components'
import { iconKey } from './iconContext'
const props = defineProps<{ resolver?: (source: IconSource) => Promise<string | undefined> }>()
provide(iconKey, { resolve: props.resolver ?? (async (source) => source.kind === 'local' ? source.src : undefined) })
</script>
<template>
    <slot />
</template>
