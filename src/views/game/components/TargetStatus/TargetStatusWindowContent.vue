<script setup lang="ts">
import { computed } from 'vue'
import GAvatar from '@/shared/components/content/GAvatar/GAvatar.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { useTargetStatusPresentationStore } from '@/stores/targetStatusPresentation'
import GameLevelBadge from '@/views/game/components/GameLevelBadge/GameLevelBadge.vue'
import GameHealthBar from '@/views/game/components/GameHealthBar/GameHealthBar.vue'
import CompactStatusEffectList from '@/views/game/components/CompactStatusEffectList/CompactStatusEffectList.vue'
import GameCastBar from '@/views/game/components/GameCastBar/GameCastBar.vue'
import TargetAffiliationBadge from '@/views/game/components/TargetAffiliationBadge/TargetAffiliationBadge.vue'
import TargetMarkerIcon from '@/views/game/components/TargetMarkerIcon/TargetMarkerIcon.vue'

const store = useGameTargetStatusStore()
const presentation = useTargetStatusPresentationStore()
const target = computed(() => store.target)
const { nowMs } = useGameCooldownClock(() => store.hasTimedEffects)
const targetLabel = useLocalizedText(() => target.value ? gameText(gameKeys.targetName, { targetName: target.value.displayName }) : gameText(gameKeys.targetStatusAria))
const buffsLabel = useLocalizedText(() => target.value ? gameText(gameKeys.targetBuffs, { targetName: target.value.displayName }) : '')
const debuffsLabel = useLocalizedText(() => target.value ? gameText(gameKeys.targetDebuffs, { targetName: target.value.displayName }) : '')
</script>

<template>
  <section v-if="target" class="ew-target-status" :aria-label="targetLabel">
    <div class="ew-target-status__identity">
      <GAvatar v-if="target.entityKind === 'player'" class="ew-target-status__portrait" :source="target.portrait ?? undefined" :label="target.displayName" size="lg" />
      <div class="ew-target-status__details">
        <div class="ew-target-status__identity-row">
          <GameLevelBadge :level="target.level" />
          <TargetAffiliationBadge v-if="target.guild" kind="guild" :affiliation="target.guild" />
          <TargetAffiliationBadge v-if="target.order" kind="order" :affiliation="target.order" />
          <strong class="ew-target-status__name" :title="target.displayName">{{ target.displayName }}</strong>
          <TargetMarkerIcon :marker="target.marker" />
        </div>
        <GameHealthBar :value="target.hp" :display-mode="presentation.hpDisplayMode" :accessible-owner-name="target.displayName" @toggle="presentation.toggleHpDisplayMode" />
      </div>
    </div>
    <div class="ew-target-status__effects">
      <CompactStatusEffectList kind="buff" :records="target.buffs" :now-ms="nowMs" :list-label="buffsLabel" />
      <CompactStatusEffectList kind="debuff" :records="target.debuffs" :now-ms="nowMs" :list-label="debuffsLabel" />
    </div>
    <GameCastBar :cast="target.activeCast" :owner-name="target.displayName" />
  </section>
</template>
