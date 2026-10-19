<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useGameSkillsStore } from '@/stores/gameSkills'
import { gameText } from '@/localization/gameText'
import { toShortcutSkill, type SkillGroup } from '@/views/game/types/gameSkills'
import SkillTooltip from '@/views/game/components/SkillTooltip/SkillTooltip.vue'
import GText from '@/shared/components/content/GText/GText.vue'
import GameSkillVisual from '@/views/game/components/GameSkillVisual/GameSkillVisual.vue'
import GTabs from '@/shared/components/navigation/GTabs/GTabs.vue'
import GTab from '@/shared/components/navigation/GTab/GTab.vue'
import type { SkillActivationGateway } from '@/services/game/skillActivationGateway'
import { DisconnectedSkillActivationGateway } from '@/services/game/disconnectedSkillActivationGateway'
import { createSkillActivationController } from '@/services/game/skillActivationController'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import { useGameSkillDragStore } from '@/stores/gameSkillDrag'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
const props = withDefaults(defineProps<{ activationGateway?: SkillActivationGateway }>(), {
  activationGateway: () => new DisconnectedSkillActivationGateway(),
})
const store = useGameSkillsStore()
const shortcuts = useGameShortcutsStore()
const drag = useGameSkillDragStore()
const activation = createSkillActivationController(
  (skillId) => store.record(skillId),
  props.activationGateway,
)
const { nowMs, start } = useGameCooldownClock(() => store.hasActiveCooldowns)
watch(nowMs, (value) => store.expireCooldowns(value))
watch(
  () => store.hasActiveCooldowns,
  (active) => {
    if (active) start()
  },
  { immediate: true },
)
const activeGroup = ref<SkillGroup>('active')
const tabsLabel = useLocalizedText(() => gameText('#SKILL_LIST_TABS'))
const groups: SkillGroup[] = ['active', 'passive', 'other']
const labels = {
  active: gameText('#SKILL_GROUP_ACTIVE'),
  passive: gameText('#SKILL_GROUP_PASSIVE'),
  other: gameText('#SKILL_GROUP_OTHER'),
}
const categories = computed(() =>
  Object.values(store.subcategories)
    .filter((item) => item.group === activeGroup.value)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
)
function skills(categoryId: string) {
  return store.allSkills.filter((item) => item.definition.subcategoryId === categoryId)
}
function activate(skillId: string): void {
  if (drag.source?.kind === 'catalog') {
    const wasDragging = drag.dragging
    drag.cancel()
    if (wasDragging) return
  }
  activation.activate(skillId, 'skill-list')
}
function beginBinding(skillId: string, event: PointerEvent): void {
  if (event.button !== 0 || !drag.begin({ kind: 'catalog', skillId })) return
  drag.updatePointer(event.clientX, event.clientY)
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  document.addEventListener('pointerup', finishBinding, { once: true })
  document.addEventListener('pointercancel', finishBinding, { once: true })
}
function updateBinding(event: PointerEvent): void {
  drag.updatePointer(event.clientX, event.clientY)
  if (drag.source?.kind === 'catalog') drag.start()
}
function finishBinding(): void {
  if (drag.source?.kind === 'catalog') drag.cancel()
}
function beginKeyboardBinding(skillId: string, event: KeyboardEvent): void {
  if ((event.key !== 'Enter' && event.key !== ' ') || !drag.begin({ kind: 'catalog', skillId }))
    return
  event.preventDefault()
  drag.start()
  drag.updatePointer(0, 0)
  document.getElementById('shortcut-1')?.focus()
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerup', finishBinding)
  document.removeEventListener('pointercancel', finishBinding)
  drag.cancel()
})
</script>
<template>
  <div class="ew-skill-list">
    <GTabs class="ew-skill-list__tabs" :aria-label="tabsLabel">
      <GTab
        v-for="group in groups"
        :id="`skill-tab-${group}`"
        :key="group"
        type="button"
        role="tab"
        :selected="activeGroup === group"
        @click="activeGroup = group"
      >
        <GText :content="labels[group]" />
      </GTab>
    </GTabs>
    <div
      :id="`skill-panel-${activeGroup}`"
      class="ew-skill-list__scroll"
      role="tabpanel"
      :aria-labelledby="`skill-tab-${activeGroup}`"
    >
      <section v-for="category in categories" :key="category.id" class="ew-skill-list__category">
        <h3><GText :content="category.label" /></h3>
        <div class="ew-skill-list__grid">
          <SkillTooltip
            v-for="record in skills(category.id)"
            :key="record.definition.skillId"
            :model="toShortcutSkill(record)"
            placement="right-start"
            :disabled="drag.dragging"
          >
            <template #trigger="{ triggerProps }">
              <button
                v-bind="triggerProps"
                class="ew-skill-list__skill"
                type="button"
                :disabled="record.definition.flags.passive"
                :aria-label="
                  typeof record.definition.name === 'string'
                    ? record.definition.name
                    : record.definition.skillId
                "
                @click="activate(record.definition.skillId)"
                @pointerdown="beginBinding(record.definition.skillId, $event)"
                @pointermove="updateBinding"
                @keydown="beginKeyboardBinding(record.definition.skillId, $event)"
              >
                <GameSkillVisual
                  :record="record"
                  :now-ms="nowMs"
                  :debug="shortcuts.showDebugMetadata"
                  :show-blocked="false"
                />
              </button>
            </template>
          </SkillTooltip>
        </div>
        <p v-if="skills(category.id).length === 0" class="ew-skill-list__empty">
          <GText :content="gameText('#SKILL_SUBCATEGORY_EMPTY')" />
        </p>
      </section>
      <p v-if="categories.length === 0" class="ew-skill-list__empty">
        <GText :content="gameText('#SKILL_LIST_EMPTY')" />
      </p>
    </div>
  </div>
</template>
