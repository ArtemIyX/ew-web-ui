<script setup lang="ts">
import { computed } from 'vue'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import PartyMemberEffectList from './PartyMemberEffectList.vue'
import type { PartyMemberSnapshot } from '@/views/game/types/gameParty'

const props = defineProps<{
  member: PartyMemberSnapshot
  showDebugMetadata?: boolean
}>()

const hasTimedEffects = computed(() =>
  [...props.member.buffs, ...props.member.debuffs].some((effect) => effect.endsAtMs !== null),
)
const { nowMs } = useGameCooldownClock(hasTimedEffects)
</script>

<template>
  <div class="ew-party-member-effects" data-ew-window-no-drag>
    <PartyMemberEffectList
      kind="buff"
      :member-id="member.memberId"
      :member-name="member.characterName"
      :records="member.buffs"
      :now-ms="nowMs"
      :show-debug-metadata="showDebugMetadata ?? false"
    />
    <PartyMemberEffectList
      kind="debuff"
      :member-id="member.memberId"
      :member-name="member.characterName"
      :records="member.debuffs"
      :now-ms="nowMs"
      :show-debug-metadata="showDebugMetadata ?? false"
    />
  </div>
</template>
