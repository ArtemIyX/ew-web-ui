<script setup lang="ts">
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'
const props = withDefaults(
  defineProps<{
    record: GameSkillRecord
    nowMs?: number
    debug?: boolean
    showBlocked?: boolean
  }>(),
  { debug: false, showBlocked: true },
)
const remaining = () =>
  props.record.runtime.cooldown
    ? Math.max(
        0,
        Math.ceil((props.record.runtime.cooldown.endsAtMs - (props.nowMs ?? Date.now())) / 1000),
      )
    : 0
</script>
<template>
  <span
    class="ew-skill-visual"
    :class="{
      'is-active': record.runtime.active,
      'is-blocked': showBlocked && (record.runtime.blocked || !record.runtime.usable),
      'is-cooling': Boolean(record.runtime.cooldown),
    }"
  >
    <span v-if="debug" class="ew-shortcuts__level">{{ record.definition.level }}</span>
    <GIcon :source="record.definition.icon" :label="record.definition.name" />
    <span
      v-if="record.definition.flags.toggleable && record.runtime.active"
      class="ew-shortcuts__active"
      aria-label="Active"
    />
    <span v-if="record.runtime.cooldown" class="ew-shortcuts__cooldown" aria-live="polite">
      {{ remaining() }}s
    </span>
    <span v-if="debug" class="ew-shortcuts__debug">{{ record.definition.skillId }}</span>
  </span>
</template>
