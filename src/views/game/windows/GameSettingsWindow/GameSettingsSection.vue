<script setup lang="ts">
import type { TextContent } from '@/shared/types/components'
import { GText } from '@/shared/components'
defineProps<{ title: TextContent; wide?: boolean }>()
</script>
<template>
  <section
    class="ew-settings__section"
    :class="{ 'ew-settings__section--wide': wide }"
  >
    <h2><GText :content="title" /></h2>
    <div class="ew-settings__section-body"><slot /></div>
  </section>
</template>
