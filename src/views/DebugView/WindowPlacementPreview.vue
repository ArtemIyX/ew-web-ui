<script setup lang="ts">
import type { WindowHeaderPlacement } from '@/shared/windows/types'

defineProps<{
  placement: WindowHeaderPlacement
  active?: boolean
}>()
</script>

<template>
  <section
    class="ew-window-frame ew-window-placement-preview"
    :data-active="active ? 'true' : 'false'"
    :data-header-placement="placement"
    data-header-visible="true"
    data-movable="true"
    data-resize-mode="none"
    role="group"
    :aria-label="`${placement} header preview`"
  >
    <header class="ew-window-header">
      <div class="ew-window-header-leading"></div>
      <div class="ew-window-header-content">
        <h2>{{ placement }}</h2>
      </div>
      <div class="ew-window-header-actions"></div>
    </header>
    <div class="ew-window-body">
      <p class="ew-caption">{{ placement }} sample</p>
    </div>
  </section>
</template>
