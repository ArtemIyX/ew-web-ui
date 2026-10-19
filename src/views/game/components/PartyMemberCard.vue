<script setup lang="ts">
import { computed } from 'vue'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import type { PartyMemberSnapshot } from '@/views/game/types/gameParty'
import GameLevelBadge from './GameLevelBadge/GameLevelBadge.vue'
import PartyMemberResources from './PartyMemberResources.vue'
import PartyMemberEffects from './PartyMemberEffects.vue'

const props = withDefaults(
  defineProps<{
    member: PartyMemberSnapshot
    nowMs?: number
    showDebugMetadata?: boolean
  }>(),
  { nowMs: 0, showDebugMetadata: false },
)

const memberLabel = useLocalizedText(() =>
  gameText(gameKeys.partyMemberAria, { memberName: props.member.characterName }),
)
const classLabel = useLocalizedText(() =>
  gameText(gameKeys.partyClassIcon, { memberName: props.member.characterName }),
)
const lifeState = computed(() => (props.member.lifeState === 'dead' ? 'dead' : 'alive'))
</script>

<template>
  <section
    class="ew-party-member-card"
    :data-member-id="member.memberId"
    :data-life-state="lifeState"
    :data-party-leader="member.isLeader ? 'true' : undefined"
    :aria-label="memberLabel"
  >
    <div class="ew-party-member-card__main">
      <div class="ew-party-member-card__identity">
        <GameLevelBadge
          :level="member.level"
          :owner-name="member.characterName"
          :emphasis="member.isLeader ? 'party-leader' : 'default'"
        />
        <strong class="ew-party-member-card__name">{{ member.characterName }}</strong>
        <GIcon
          :source="member.classIcon"
          :label="classLabel"
          class="ew-party-member-card__class-icon"
        />
      </div>
      <PartyMemberResources :resources="member.resources" :member-name="member.characterName" />
    </div>
    <PartyMemberEffects :member="member" :show-debug-metadata="showDebugMetadata" />
  </section>
</template>
