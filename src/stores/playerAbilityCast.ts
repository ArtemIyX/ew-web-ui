import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AbilityCastSnapshot,
  AbilityCastTerminationReason,
  PlayerAbilityCastSnapshot,
} from '@/views/game/types/gameAbilityCast'

function cloneCast(cast: AbilityCastSnapshot | null): AbilityCastSnapshot | null {
  if (!cast) {
    return null
  }

  return {
    ...cast,
    abilityName:
      typeof cast.abilityName === 'string' ? cast.abilityName : { ...cast.abilityName },
  }
}

export const usePlayerAbilityCastStore = defineStore('player-ability-cast', () => {
  const revision = ref(0)
  const activeCast = ref<AbilityCastSnapshot | null>(null)
  const pausedAtMs = ref<number | null>(null)
  const terminationReason = ref<AbilityCastTerminationReason>('none')
  const lastUpdatedAtMs = ref<number | null>(null)
  let completionTimer: ReturnType<typeof setTimeout> | undefined
  const phase = computed(() => {
    if (!activeCast.value) {
      return 'idle' as const
    }
    if (pausedAtMs.value !== null) {
      return 'paused' as const
    }
    return 'casting' as const
  })

  function clearCompletionTimer(): void {
    if (completionTimer) {
      clearTimeout(completionTimer)
      completionTimer = undefined
    }
  }

  function scheduleCompletion(cast: AbilityCastSnapshot): void {
    const expectedEndsAtMs = cast.endsAtMs
    const delayMs = Math.max(0, expectedEndsAtMs - Date.now())
    completionTimer = setTimeout(() => {
      if (activeCast.value?.endsAtMs !== expectedEndsAtMs || pausedAtMs.value !== null) {
        return
      }
      if (Date.now() < expectedEndsAtMs) {
        scheduleCompletion(cast)
        return
      }
      terminate('finished')
    }, Math.min(delayMs, 2_147_483_647))
  }

  function commit(
    cast: AbilityCastSnapshot | null,
    pausedAt: number | null,
    reason: AbilityCastTerminationReason,
  ): void {
    clearCompletionTimer()
    activeCast.value = cloneCast(cast)
    pausedAtMs.value = cast ? pausedAt : null
    terminationReason.value = reason
    revision.value += 1
    lastUpdatedAtMs.value = Date.now()
    if (cast && pausedAt === null) {
      scheduleCompletion(cast)
    }
  }

  function replaceCast(cast: AbilityCastSnapshot, pausedAt: number | null = null): void {
    commit(cast, pausedAt, 'none')
  }

  function terminate(reason: Exclude<AbilityCastTerminationReason, 'none'>): void {
    commit(null, null, reason)
  }

  function clearCast(): void {
    commit(null, null, 'none')
  }

  function getSnapshot(): PlayerAbilityCastSnapshot {
    return {
      revision: revision.value,
      activeCast: cloneCast(activeCast.value),
      pausedAtMs: pausedAtMs.value,
      terminationReason: terminationReason.value,
      lastUpdatedAtMs: lastUpdatedAtMs.value,
    }
  }

  function resetForTests(): void {
    clearCompletionTimer()
    revision.value = 0
    activeCast.value = null
    pausedAtMs.value = null
    terminationReason.value = 'none'
    lastUpdatedAtMs.value = null
  }

  return {
    revision,
    activeCast,
    pausedAtMs,
    terminationReason,
    lastUpdatedAtMs,
    phase,
    replaceCast,
    terminate,
    clearCast,
    getSnapshot,
    resetForTests,
    dispose: clearCompletionTimer,
  }
})
