<script setup lang="ts">
import { computed, ref } from 'vue'
import GProgress from '@/shared/components/feedback/GProgress/GProgress.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import type { ResourceKind } from '@/views/game/types/gameResources'
import type { PartyMemberResources as PartyResources } from '@/views/game/types/gameParty'
import { normalizeResourceValue } from '@/views/game/utilities/normalizeResourceValue'
import GameHealthBar from './GameHealthBar/GameHealthBar.vue'

const props = defineProps<{
  resources: PartyResources
  memberName: string
}>()

const hpDisplayMode = ref<'percentage' | 'exact'>('percentage')

const rows = computed(() => [
  { kind: 'hp' as const, value: normalizeResourceValue(props.resources.hp), tone: 'hp' as const },
  { kind: 'mp' as const, value: normalizeResourceValue(props.resources.mp), tone: 'mp' as const },
  { kind: 'energy' as const, value: normalizeResourceValue(props.resources.energy), tone: 'energy' as const },
])

const healthLabel = useLocalizedText(() => gameText(gameKeys.health))
const manaLabel = useLocalizedText(() => gameText(gameKeys.mana))
const energyLabel = useLocalizedText(() => gameText(gameKeys.energy))

function ariaLabel(kind: ResourceKind, index: number): string {
  const label = index === 0 ? healthLabel.value : index === 1 ? manaLabel.value : energyLabel.value
  return `${label} — ${props.memberName}`
}

function ariaValueText(index: number): string {
  const row = rows.value[index]!
  return `${row.value.current} of ${row.value.maximum}, ${row.value.percentage.toFixed(0)} percent`
}
</script>

<template>
  <div class="ew-party-member-resources">
    <template v-for="(row, index) in rows" :key="row.kind">
      <GameHealthBar
        v-if="row.kind === 'hp'"
        class="ew-party-member-resources__row ew-party-member-resources__row--interactive"
        :data-resource-kind="row.kind"
        :value="row.value"
        :display-mode="hpDisplayMode"
        :accessible-owner-name="memberName"
        @toggle="hpDisplayMode = hpDisplayMode === 'percentage' ? 'exact' : 'percentage'"
      />
      <div
        v-else
        class="ew-party-member-resources__row"
        :data-resource-kind="row.kind"
        data-ew-window-no-drag
      >
        <GProgress
          :value="row.value.current"
          :max="row.value.maximum"
          :tone="row.tone"
          size="sm"
          shape="angled"
          :aria-label="ariaLabel(row.kind, index)"
          :aria-value-text="ariaValueText(index)"
        />
      </div>
    </template>
  </div>
</template>
