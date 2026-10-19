<script setup lang="ts">
import GText from '@/shared/components/content/GText/GText.vue'
import type { TextContent } from '@/shared/types/components'
defineProps<{ title?: TextContent; body?: TextContent }>()
</script>

<template>
  <section class="ew-feature-placeholder">
    <h3><GText :content="title ?? 'Window'" /></h3>
    <p><GText :content="body ?? 'This feature is not implemented yet.'" /></p>
  </section>
</template>
