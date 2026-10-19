<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import SkillTooltip from '../SkillTooltip/SkillTooltip.vue'
import { createSkillTooltipFromShortcut } from '../../utilities/skillTooltipModel'
import type { ShortcutSlot } from '../../types/shortcuts'
import type { SkillTooltipModel } from '../../types/skills'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { cooldownProgress } from '../../composables/useShortcutCooldownClock'

const props = defineProps<{
  shortcutSlot: ShortcutSlot
  locked: boolean
  debug: boolean
  nowMs: number
  dragging?: boolean
  dropTarget?: boolean
}>()
const cooldownEnded = ref(false)
const skillTooltipModel = computed<SkillTooltipModel>(() => {
  const entry = props.shortcutSlot.entry
  return entry?.kind === 'skill' ? createSkillTooltipFromShortcut(entry) : { skillId: '', name: '' }
})
const skillName = useLocalizedText(() =>
  props.shortcutSlot.entry?.kind === 'skill' ? props.shortcutSlot.entry.name : undefined,
)
let cooldownEndTimer: ReturnType<typeof setTimeout> | undefined
const emit = defineEmits<{
  activate: [slot: ShortcutSlot]
  lock: [position: number]
  pointerStart: [position: number, event: PointerEvent]
  pointerMove: [event: PointerEvent]
  pointerEnd: [position: number, event: PointerEvent]
  keyboard: [position: number, event: KeyboardEvent]
}>()

watch(
  () => (props.shortcutSlot.entry?.kind === 'skill' ? props.shortcutSlot.entry.cooldown : null),
  (cooldown, previousCooldown) => {
    if (!cooldown && previousCooldown) {
      cooldownEnded.value = true
      if (cooldownEndTimer) {
        clearTimeout(cooldownEndTimer)
      }
      cooldownEndTimer = setTimeout(() => {
        cooldownEnded.value = false
        cooldownEndTimer = undefined
      }, 800)
    }
  },
)
onBeforeUnmount(() => {
  if (cooldownEndTimer) {
    clearTimeout(cooldownEndTimer)
  }
})

function activate() {
  if (
    props.shortcutSlot.entry?.kind === 'skill' &&
    props.shortcutSlot.entry.flags.usable &&
    !props.shortcutSlot.entry.cooldown
  ) {
    emit('activate', props.shortcutSlot)
  }
}

function keydown(event: KeyboardEvent) {
  if (event.shiftKey && event.key.toLowerCase() === 'l') {
    event.preventDefault()
    emit('lock', props.shortcutSlot.position)
  }
}
</script>
<template>
  <SkillTooltip
    :model="skillTooltipModel"
    :show-debug-metadata="debug"
    :disabled="!shortcutSlot.entry || shortcutSlot.entry.kind !== 'skill' || dragging"
    :aria-label="
      shortcutSlot.entry?.kind === 'skill'
        ? `${skillName}, slot ${shortcutSlot.position}`
        : `Empty shortcut slot ${shortcutSlot.position}`
    "
    @contextmenu.prevent="emit('lock', shortcutSlot.position)"
  >
    <template #trigger="{ triggerProps }">
      <button
        v-bind="triggerProps"
        :id="`shortcut-${shortcutSlot.position}`"
        class="ew-shortcuts__slot"
        :style="{
          '--ew-shortcut-progress':
            shortcutSlot.entry?.kind === 'skill' && shortcutSlot.entry.cooldown
              ? cooldownProgress(
                  shortcutSlot.entry.cooldown.startedAtMs,
                  shortcutSlot.entry.cooldown.endsAtMs,
                  nowMs,
                )
              : 0,
        }"
        :class="{
          'is-locked': locked,
          'is-cooling': shortcutSlot.entry?.kind === 'skill' && shortcutSlot.entry.cooldown,
          'is-cooldown-ended': cooldownEnded,
          'is-dragging': dragging,
          'is-drop-target': dropTarget,
        }"
        :aria-label="
          shortcutSlot.entry?.kind === 'skill'
            ? `${skillName}, slot ${shortcutSlot.position}`
            : `Empty shortcut slot ${shortcutSlot.position}`
        "
        @click="activate"
        @keydown="
          (event) => {
            keydown(event)
            emit('keyboard', shortcutSlot.position, event)
          }
        "
        @pointerdown="emit('pointerStart', shortcutSlot.position, $event)"
        @pointermove="emit('pointerMove', $event)"
        @pointerup="emit('pointerEnd', shortcutSlot.position, $event)"
        @pointercancel="emit('pointerEnd', shortcutSlot.position, $event)"
        @contextmenu.prevent="emit('lock', shortcutSlot.position)"
      >
        <span class="ew-shortcuts__number">{{ shortcutSlot.position }}</span>
        <template v-if="shortcutSlot.entry?.kind === 'skill'">
          <span v-if="debug" class="ew-shortcuts__level">{{ shortcutSlot.entry.level }}</span>
          <GIcon :source="shortcutSlot.entry.icon" :label="shortcutSlot.entry.name" />
          <span
            v-if="shortcutSlot.entry.flags.toggleable && shortcutSlot.entry.flags.active"
            class="ew-shortcuts__active"
            aria-label="Active"
          /><span v-if="shortcutSlot.entry.cooldown" class="ew-shortcuts__cooldown">{{
            Math.max(0, Math.ceil((shortcutSlot.entry.cooldown.endsAtMs - nowMs) / 1000))
          }}</span
          ><span v-if="debug" class="ew-shortcuts__debug">{{
            shortcutSlot.entry.skillId
          }}</span></template
        >
        <span v-else-if="shortcutSlot.entry" class="ew-shortcuts__unsupported"
          >Unsupported {{ shortcutSlot.entry.kind }}</span
        >
        <span v-if="locked" class="ew-shortcuts__lock" aria-label="Locked" />
      </button>
    </template>
  </SkillTooltip>
</template>
