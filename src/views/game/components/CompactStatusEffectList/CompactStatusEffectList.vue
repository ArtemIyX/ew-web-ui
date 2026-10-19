<script setup lang="ts">
import { computed } from 'vue'
import SkillTooltip from '@/views/game/components/SkillTooltip/SkillTooltip.vue'
import GameStatusEffectVisual from '@/views/game/components/GameStatusEffectVisual/GameStatusEffectVisual.vue'
import type { TextContent } from '@/shared/types/components'
import type { GameStatusEffectRecord } from '@/views/game/types/gameStatusEffects'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const props = withDefaults(
  defineProps<{
    kind: 'buff' | 'debuff'
    records: readonly GameStatusEffectRecord[]
    nowMs: number
    listLabel: TextContent
    showDebugMetadata?: boolean
  }>(),
  { showDebugMetadata: false },
)
const visibleRecords = computed(() =>
  props.records
    .filter((record) => record.endsAtMs === null || record.endsAtMs > props.nowMs)
    .slice()
    .sort((first, second) => first.order - second.order || first.id.localeCompare(second.id)),
)
const label = useLocalizedText(() => props.listLabel)
function accessibleLabel(record: GameStatusEffectRecord): string {
  return typeof record.definition.name === 'string' ? record.definition.name : record.definition.skillId
}
</script>

<template>
  <div
    class="ew-compact-status-effects"
    :data-effect-kind="kind"
    role="list"
    :aria-label="label"
    data-ew-window-no-drag
  >
    <SkillTooltip
      v-for="record in visibleRecords"
      :key="record.id"
      :model="record.definition"
      :show-debug-metadata="showDebugMetadata"
      placement="top"
    >
      <template #trigger="{ triggerProps }">
        <span
          v-bind="triggerProps"
          class="ew-compact-status-effects__item"
          role="listitem"
          tabindex="0"
          data-ew-window-no-drag
          :aria-label="accessibleLabel(record)"
        >
          <GameStatusEffectVisual :record="record" :now-ms="nowMs" :debug="showDebugMetadata" />
        </span>
      </template>
    </SkillTooltip>
  </div>
</template>
