<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import type { SkillShortcut, ShortcutSlot } from '../../types/shortcuts'
import GameShortcutSlot from '../GameShortcutSlot/GameShortcutSlot.vue'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import { useGameCooldownClock } from '../../composables/useGameCooldownClock'
import { useShortcutMove } from '../../composables/useShortcutMove'
import { DisconnectedShortcutActivationGateway } from '@/services/game/disconnectedShortcutActivationGateway'
import type { ShortcutActivationGateway } from '@/services/game/shortcutActivationGateway'
import { createShortcutDeveloperApi } from '@/services/game/shortcutService'
import { gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useGameSkillDragStore } from '@/stores/gameSkillDrag'
import { createSkillActivationController } from '@/services/game/skillActivationController'
import { useGameSkillsStore } from '@/stores/gameSkills'
import { toShortcutSkill } from '@/views/game/types/gameSkills'

const store = useGameShortcutsStore()
const shortcutApi = createShortcutDeveloperApi(store)
const props = withDefaults(defineProps<{ activationGateway?: ShortcutActivationGateway }>(), {
  activationGateway: () => new DisconnectedShortcutActivationGateway(),
})
const { nowMs, start } = useGameCooldownClock(() => store.hasActiveCooldowns)
const move = useShortcutMove()
const skillDrag = useGameSkillDragStore()
const canonical = useGameSkillsStore()
const activation = createSkillActivationController((skillId) => canonical.record(skillId), {
  activateSkill: (skillId, origin, position) =>
    props.activationGateway.activateSkill(skillId, position ?? 0),
})
const shortcutListLabel = useLocalizedText(() => gameText('#SHORTCUT_LIST_LABEL'))
const expandRowsLabel = useLocalizedText(() => gameText('#SHORTCUT_ROWS_EXPAND'))
const collapseRowsLabel = useLocalizedText(() => gameText('#SHORTCUT_ROWS_COLLAPSE'))
const suppressClick = ref(false)
const dropTarget = ref<number | null>(null)
const dragSkill = computed<SkillShortcut | null>(() => {
  const entry = store.slot(move.source.value ?? 0)?.entry
  return entry?.kind === 'skill' ? entry : null
})
const catalogDragSkill = computed(() =>
  skillDrag.source?.kind === 'catalog' ? canonical.record(skillDrag.source.skillId) : null,
)
watch(nowMs, (value) => store.expireCooldowns(value))
watch(
  () => store.hasActiveCooldowns,
  (active) => {
    if (active) start()
  },
  { immediate: true },
)
const rows = computed(() => {
  const result: ShortcutSlot[][] = []
  const project = (slot: ShortcutSlot): ShortcutSlot => {
    if (slot.entry?.kind !== 'skill') return slot
    const record = canonical.record(slot.entry.skillId)
    return record ? { ...slot, entry: toShortcutSkill(record) } : slot
  }
  for (let position = store.visibleRowCount * 8; position > 0; position -= 8)
    result.push(store.slots.slice(position - 8, position).map(project))
  return result
})

function activate(slot: ShortcutSlot) {
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }
  if (slot.entry?.kind === 'skill') {
    activation.activate(slot.entry.skillId, 'shortcut', slot.position)
  }
}

function pointerStart(position: number, event: PointerEvent) {
  if (store.lockedPositions.has(position) || !store.slot(position)?.entry) {
    return
  }
  event.preventDefault()
  move.begin(position, event.clientX, event.clientY)
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function pointerMove(event: PointerEvent) {
  skillDrag.updatePointer(event.clientX, event.clientY)
  if (move.update(event.clientX, event.clientY)) {
    event.preventDefault()
  }
  const target = shortcutTargetAt(event.clientX, event.clientY)
  const position = target ? Number(target.id.replace('shortcut-', '')) : null
  dropTarget.value = position !== null && !store.lockedPositions.has(position) ? position : null
}

function pointerEnd(position: number, event: PointerEvent) {
  if (skillDrag.source?.kind === 'catalog') {
    if (skillDrag.drop(position)) {
      suppressClick.value = true
      event.preventDefault()
    }
    return
  }
  const source = move.source.value
  const wasDragging = move.dragging.value
  const target = shortcutTargetAt(event.clientX, event.clientY)
  const destination = target ? Number(target.id.replace('shortcut-', '')) : null
  const completed = move.finish(destination)
  dropTarget.value = null
  if (wasDragging && source !== null && destination === null) {
    shortcutApi.clear(source)
    suppressClick.value = true
    event.preventDefault()
    return
  }
  if (completed) {
    suppressClick.value = true
    event.preventDefault()
    store.moveOrSwap(completed.source ?? position, completed.destination, 'ui')
  }
}

function shortcutTargetAt(x: number, y: number) {
  return document.elementFromPoint?.(x, y)?.closest<HTMLElement>('[id^="shortcut-"]')
}

function keydown(position: number, event: KeyboardEvent) {
  if (skillDrag.source?.kind === 'catalog') {
    if (event.key === 'Escape') {
      event.preventDefault()
      skillDrag.cancel()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      skillDrag.drop(position)
    }
    return
  }
  if (
    event.key === ' ' &&
    !move.source.value &&
    store.slot(position)?.entry &&
    !store.lockedPositions.has(position)
  ) {
    event.preventDefault()
    move.begin(position, 0, 0)
    move.dragging.value = true
  } else if (move.source.value !== null && event.key === 'Escape') {
    event.preventDefault()
    move.cancel()
  } else if (move.source.value !== null && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    const source = move.source.value
    const completed = move.finish(position)
    if (completed) {
      store.moveOrSwap(source, completed.destination, 'ui')
    }
  }
  if (
    move.source.value !== null &&
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
  ) {
    event.preventDefault()
    const visible = store.visibleSlots.map((slot) => slot.position)
    const index = visible.indexOf(position)
    const delta =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : event.key === 'ArrowUp'
            ? -8
            : 8
    const target = visible[index + delta]
    if (target !== undefined && !store.lockedPositions.has(target)) {
      document.getElementById(`shortcut-${target}`)?.focus()
    }
  }
}
</script>
<template>
  <section
    class="ew-shortcuts"
    :aria-label="shortcutListLabel"
    @pointermove="pointerMove"
    @pointerleave="dropTarget = null"
  >
    <div class="ew-shortcuts__rail">
      <button
        type="button"
        :aria-label="expandRowsLabel"
        :disabled="store.visibleRowCount === 3"
        @click="store.expandRows"
      >
        +
      </button>
      <button
        type="button"
        :aria-label="collapseRowsLabel"
        :disabled="store.visibleRowCount === 1"
        @click="store.collapseRows"
      >
        −
      </button>
    </div>
    <div class="ew-shortcuts__rows">
      <div v-for="row in rows" :key="row[0]?.position" class="ew-shortcuts__row">
        <GameShortcutSlot
          v-for="slot in row"
          :key="slot.position"
          :shortcut-slot="slot"
          :locked="store.lockedPositions.has(slot.position)"
          :debug="store.showDebugMetadata"
          :now-ms="nowMs"
          :dragging="move.source.value === slot.position && move.dragging.value"
          :drop-target="dropTarget === slot.position"
          @activate="activate"
          @pointer-start="pointerStart"
          @pointer-move="pointerMove"
          @pointer-end="pointerEnd"
          @keyboard="keydown"
          @lock="store.toggleSlotLocked"
        />
      </div>
    </div>
  </section>
  <Teleport to="body">
    <GIcon
      v-if="move.dragging.value && move.pointer.value && dragSkill"
      class="ew-shortcuts__drag-preview"
      :style="{
        insetInlineStart: `${move.pointer.value.x}px`,
        insetBlockStart: `${move.pointer.value.y}px`,
      }"
      :source="dragSkill.icon"
      label=""
    />
    <GIcon
      v-if="skillDrag.dragging && skillDrag.pointer && catalogDragSkill"
      class="ew-shortcuts__drag-preview"
      :style="{
        insetInlineStart: `${skillDrag.pointer.x}px`,
        insetBlockStart: `${skillDrag.pointer.y}px`,
      }"
      :source="catalogDragSkill.definition.icon"
      label=""
    />
  </Teleport>
</template>
