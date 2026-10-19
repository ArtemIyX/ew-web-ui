<script setup lang="ts">
import { computed } from 'vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import type { TargetMarker } from '@/views/game/types/gameTargetStatus'

const props = defineProps<{ marker: TargetMarker }>()
const markerLabels = { 'world-structure': gameKeys.targetMarkerWorldStructure, ally: gameKeys.targetMarkerAlly, enemy: gameKeys.targetMarkerEnemy, monster: gameKeys.targetMarkerMonster, boss: gameKeys.targetMarkerBoss } as const
const label = useLocalizedText(() => gameText(markerLabels[props.marker]))
const shape = computed(() => props.marker === 'boss' ? 'boss' : props.marker)
</script>

<template>
  <span class="ew-target-marker" :class="`ew-target-marker--${shape}`" :data-marker="marker" :aria-label="label" role="img">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" aria-hidden="true">
      <path v-if="marker === 'world-structure'" d="m12 3 7 4v10l-7 4-7-4V7l7-4Zm0 4v10m-7-6 7 4 7-4" />
      <path v-else-if="marker === 'ally'" d="m5 12 4 4 10-10" />
      <path v-else-if="marker === 'enemy'" d="m6 6 12 12M18 6 6 18" />
      <path v-else-if="marker === 'monster'" d="M5 19h14l-2-7-2-2V7l-3-2-3 2v3l-2 2-2 7Zm4-7h.1m5.9 0h.1M9 16h6" />
      <g v-else>
        <path d="M2.5 18h6l-.8-4-1.3-1.2V10l-2-1.3-2 1.3v2.8L1.1 14l1.4 4Zm2-4h.1m2.1 0h.1" />
        <path d="M8.9 18h6l-.8-4-1.3-1.2V10l-2-1.3-2 1.3v2.8L7.5 14l1.4 4Zm2-4h.1m2.1 0h.1" />
        <path d="M15.3 18h6l-.8-4-1.3-1.2V10l-2-1.3-2 1.3v2.8l-1.4 1.2 1.4 4Zm2-4h.1m2.1 0h.1" />
      </g>
    </svg>
  </span>
</template>
