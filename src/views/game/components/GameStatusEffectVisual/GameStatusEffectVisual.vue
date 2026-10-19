<script setup lang="ts">
import { computed } from 'vue'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import type { GameStatusEffectRecord } from '@/views/game/types/gameStatusEffects'
import { statusEffectRemainingSeconds } from '@/views/game/utilities/statusEffectTime'
const props = withDefaults(
  defineProps<{ record: GameStatusEffectRecord; nowMs: number; debug?: boolean }>(),
  { debug: false },
)
const showRemaining = computed(
  () => props.record.endsAtMs !== null && props.record.endsAtMs > props.nowMs,
)
const remainingSeconds = computed(() =>
  props.record.endsAtMs === null
    ? 0
    : statusEffectRemainingSeconds(props.record.endsAtMs, props.nowMs),
)
</script>
<template>
  <span class="ew-buff-visual">
    <GIcon :source="record.definition.icon" :label="record.definition.name" />
    <span v-if="showRemaining" class="ew-shortcuts__cooldown" aria-hidden="true">
      {{ remainingSeconds }}
    </span>
    <span v-if="debug" class="ew-buff-visual__level">{{ record.definition.level }}</span>
    <span v-if="debug" class="ew-buff-visual__skill-id">{{ record.definition.skillId }}</span>
  </span>
</template>
