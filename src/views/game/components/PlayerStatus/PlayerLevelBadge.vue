<script setup lang="ts">
import { computed } from 'vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = defineProps<{ level: number; leader: boolean; memberName?: string }>()
const labelContent = computed(() =>
  props.leader
    ? gameText(gameKeys.partyMemberLeader, {
        memberName: props.memberName ?? '',
        level: props.level,
      })
    : gameText(gameKeys.level, { level: props.level }),
)
const label = useLocalizedText(labelContent)
</script>

<template>
  <span
    class="ew-level-badge ew-player-status__level"
    :class="{ 'ew-level-badge--leader': leader, 'ew-player-status__level--leader': leader }"
    :data-party-leader="leader ? 'true' : undefined"
    :aria-label="label"
  >
    <span class="ew-player-status__level-shape" aria-hidden="true">
      <svg
        class="ew-player-status__level-icon"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="3" y="3" width="26" height="26" />
      </svg>
    </span>
    <span class="ew-level-badge__value ew-player-status__level-value">{{ level }}</span>
  </span>
</template>
