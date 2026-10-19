<script setup lang="ts">
import SkillTooltip from '@/views/game/components/SkillTooltip/SkillTooltip.vue'
import GameStatusEffectVisual from '@/views/game/components/GameStatusEffectVisual/GameStatusEffectVisual.vue'
import type {
  GameStatusEffectKind,
  GameStatusEffectRecord,
} from '@/views/game/types/gameStatusEffects'
defineProps<{
  records: readonly GameStatusEffectRecord[]
  nowMs: number
  listLabel: string
  dragLabel: string
  showDebugMetadata: boolean
  kind: GameStatusEffectKind
}>()
function accessibleLabel(record: GameStatusEffectRecord): string {
  return typeof record.definition.name === 'string'
    ? record.definition.name
    : record.definition.skillId
}
</script>
<template>
  <div class="ew-buff-list" :data-effect-kind="kind">
    <button
      type="button"
      class="ew-buff-list__drag-handle"
      data-ew-window-drag-handle
      :aria-label="dragLabel"
    />
    <div class="ew-buff-list__grid" role="list" :aria-label="listLabel">
      <SkillTooltip
        v-for="record in records"
        :key="record.id"
        :model="record.definition"
        :show-debug-metadata="showDebugMetadata"
        placement="bottom-start"
      >
        <template #trigger="{ triggerProps }">
          <span
            v-bind="triggerProps"
            class="ew-buff-list__item"
            role="listitem"
            tabindex="0"
            data-ew-window-no-drag
            :aria-label="accessibleLabel(record)"
          >
            <GameStatusEffectVisual
              :record="record"
              :now-ms="nowMs"
              :debug="showDebugMetadata"
            />
          </span>
        </template>
      </SkillTooltip>
    </div>
  </div>
</template>
