<script setup lang="ts">
import { computed } from 'vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = withDefaults(
  defineProps<{ level: number; ownerName?: string; emphasis?: 'default' | 'party-leader' }>(),
  { emphasis: 'default' },
)
const label = useLocalizedText(() =>
  props.emphasis === 'party-leader'
    ? gameText(gameKeys.partyMemberLeader, { memberName: props.ownerName ?? '', level: props.level })
    : gameText(gameKeys.level, { level: props.level }),
)
</script>

<template>
  <span
    class="ew-game-level-badge ew-level-badge ew-player-status__level"
    :class="{
      'ew-game-level-badge--leader': emphasis === 'party-leader',
      'ew-player-status__level--leader': emphasis === 'party-leader',
    }"
    :data-party-leader="emphasis === 'party-leader' ? 'true' : undefined"
    :aria-label="label"
  >
    <span class="ew-game-level-badge__shape ew-player-status__level-shape" aria-hidden="true">
      <svg class="ew-player-status__level-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="26" height="26" />
      </svg>
    </span>
    <span class="ew-game-level-badge__value ew-level-badge__value ew-player-status__level-value">{{ level }}</span>
  </span>
</template>
