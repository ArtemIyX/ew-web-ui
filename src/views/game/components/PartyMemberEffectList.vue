<script setup lang="ts">
import { computed } from 'vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import type { GameStatusEffectKind, GameStatusEffectRecord } from '@/views/game/types/gameStatusEffects'
import type { PartyMemberId } from '@/views/game/types/gameParty'
import CompactStatusEffectList from './CompactStatusEffectList/CompactStatusEffectList.vue'

const props = defineProps<{
  kind: Exclude<GameStatusEffectKind, 'toggle'>
  memberId: PartyMemberId
  memberName: string
  records: readonly GameStatusEffectRecord[]
  nowMs: number
  showDebugMetadata: boolean
}>()

const labelContent = computed(() =>
  gameText(props.kind === 'buff' ? gameKeys.partyMemberBuffs : gameKeys.partyMemberDebuffs, {
    memberName: props.memberName,
  }),
)
const label = useLocalizedText(labelContent)
</script>

<template>
  <CompactStatusEffectList
    :kind="kind"
    :records="records"
    :now-ms="nowMs"
    :list-label="label"
    :show-debug-metadata="showDebugMetadata"
  />
</template>
