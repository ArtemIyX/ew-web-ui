<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import GProgress from '@/shared/components/feedback/GProgress/GProgress.vue'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import {
  abilityCastProgress,
  abilityCastRemainingTenths,
  formatAbilityCastRemaining,
} from '@/views/game/utilities/abilityCastTime'
import type { AbilityCastSnapshot } from '@/views/game/types/gameAbilityCast'
import type { AbilityCastTerminationReason } from '@/views/game/types/gameAbilityCast'

const props = withDefaults(
  defineProps<{
    cast: AbilityCastSnapshot | null
    ownerName?: string
    pausedAtMs?: number | null
    terminationReason?: AbilityCastTerminationReason
    draggableSurface?: boolean
  }>(),
  {
    pausedAtMs: null,
    terminationReason: 'none',
    draggableSurface: false,
  },
)
const hasCast = computed(() => props.cast !== null && props.pausedAtMs === null)
const { nowMs, start, stop } = useGameCooldownClock(hasCast)
const exitingCast = ref<AbilityCastSnapshot | null>(null)
const exitingProgress = ref<number | null>(null)
const exitNowMs = ref<number | null>(null)
const exitReason = ref<AbilityCastTerminationReason>('none')
let exitTimer: ReturnType<typeof setTimeout> | undefined
const displayedCast = computed(() => props.cast ?? exitingCast.value)
const isExiting = computed(() => props.cast === null && exitingCast.value !== null)
const displayedNowMs = computed(() => exitNowMs.value ?? props.pausedAtMs ?? nowMs.value)
const abilityName = computed(() => displayedCast.value?.abilityName)
const abilityLabel = useLocalizedText(abilityName)
const remaining = computed(() =>
  displayedCast.value
    ? formatAbilityCastRemaining(displayedCast.value, displayedNowMs.value)
    : '',
)
const remainingTenths = computed(() =>
  displayedCast.value ? abilityCastRemainingTenths(displayedCast.value, displayedNowMs.value) : 0,
)
const progress = computed(() => {
  if (exitingProgress.value !== null) {
    return exitingProgress.value
  }
  return props.cast ? abilityCastProgress(props.cast, displayedNowMs.value) * 100 : 0
})
const castLabel = computed(() =>
  props.ownerName ? `${abilityLabel.value} — ${props.ownerName}` : abilityLabel.value,
)
const visible = computed(
  () => props.cast !== null && props.cast.endsAtMs > (props.pausedAtMs ?? nowMs.value),
)
const renderedCast = computed(() =>
  isExiting.value ? exitingCast.value : visible.value ? props.cast : null,
)
function clearExit(): void {
  if (exitTimer) {
    clearTimeout(exitTimer)
  }
  exitTimer = undefined
  exitingCast.value = null
  exitingProgress.value = null
  exitNowMs.value = null
  exitReason.value = 'none'
}
function handleCastChange(
  cast: AbilityCastSnapshot | null,
  previousCast: AbilityCastSnapshot | null,
  previousPausedAtMs: number | null,
): void {
  if (cast) {
    clearExit()
    if (props.pausedAtMs === null) {
      start()
    }
    return
  }
  const endedAtMs = previousPausedAtMs ?? Date.now()
  const reason =
    props.terminationReason === 'none' && previousCast && previousCast.endsAtMs > endedAtMs
      ? 'interrupted'
      : props.terminationReason
  if (!previousCast || reason === 'none') {
    return
  }

  exitingCast.value = previousCast
  exitReason.value = reason
  exitNowMs.value = endedAtMs
  exitingProgress.value =
    reason === 'finished' ? 100 : abilityCastProgress(previousCast, endedAtMs) * 100
  exitTimer = setTimeout(clearExit, reason === 'interrupted' ? 500 : 240)
}
watch(
  visible,
  (isVisible) => {
    if (!isVisible) {
      stop()
    }
  },
  { immediate: true },
)
watch(
  () => [props.cast, props.pausedAtMs] as const,
  ([cast], previous) => handleCastChange(cast, previous?.[0] ?? null, previous?.[1] ?? null),
  { immediate: true },
)
onBeforeUnmount(clearExit)
</script>

<template>
  <Transition name="ew-cast-bar">
    <div
      v-if="renderedCast"
      class="ew-cast-bar"
      :class="{
        'ew-cast-bar--interrupted': isExiting && exitReason === 'interrupted',
        'ew-cast-bar--cancelled': isExiting && exitReason === 'cancelled',
        'ew-cast-bar--finished': isExiting && exitReason === 'finished',
      }"
      :data-ew-window-no-drag="draggableSurface ? undefined : ''"
    >
      <div class="ew-cast-bar__heading" :aria-label="castLabel">{{ abilityLabel }}</div>
      <GProgress
        :key="renderedCast.castId"
        :percentage="progress"
        tone="cast"
        shape="angled"
        size="sm"
        :animated="false"
        :aria-label="castLabel"
        :aria-value-text="`${remainingTenths.toFixed(1)} seconds remaining`"
      />
      <span class="ew-cast-bar__remaining" aria-hidden="true">{{ remaining }}</span>
    </div>
  </Transition>
</template>
