<script setup lang="ts">
import { computed } from 'vue'
import { createGamePlayerCastDeveloperApi } from '@/services/game/playerCast/gamePlayerCastDeveloperApi'
import { usePlayerAbilityCastStore } from '@/stores/playerAbilityCast'

const api = createGamePlayerCastDeveloperApi()
const store = usePlayerAbilityCastStore()
const status = computed(() => `${store.phase} · revision ${store.revision}`)

function startSampleCast(durationMs: number, castId: string): void {
  api.startCast({
    castId,
    abilityId: 'sample-player-ability',
    abilityName: 'Sample Player Ability',
    durationMs,
  })
}

function restartCast(): void {
  if (!api.restartCast().ok) {
    startSampleCast(4000, 'sample-player-cast-restarted')
  }
}

function togglePause(): void {
  if (store.pausedAtMs === null) {
    api.pauseCast()
  } else {
    api.resumeCast()
  }
}
</script>

<template>
  <section class="ew-debug-window-content__panel ew-player-cast-debug" role="tabpanel">
    <p class="ew-player-cast-debug__status">{{ status }}</p>
    <div class="ew-player-cast-debug__group" aria-label="Player cast samples">
      <button type="button" @click="startSampleCast(1200, 'sample-player-cast-short')">
        Start 1.2s cast
      </button>
      <button type="button" @click="startSampleCast(8000, 'sample-player-cast-long')">
        Start long cast
      </button>
      <button type="button" @click="restartCast">Restart cast</button>
      <button type="button" :disabled="!store.activeCast" @click="togglePause">
        {{ store.pausedAtMs === null ? 'Pause cast' : 'Resume cast' }}
      </button>
    </div>
    <div class="ew-player-cast-debug__group" aria-label="Player cast timing">
      <button type="button" @click="api.setProgress(50)">Set 50% progress</button>
      <button type="button" @click="api.adjustEndTime(1000)">Add 1s remaining</button>
      <button type="button" @click="api.adjustEndTime(-1000)">Remove 1s remaining</button>
    </div>
    <div class="ew-player-cast-debug__group" aria-label="Player cast outcomes">
      <button type="button" @click="api.finishCast()">Finish cast</button>
      <button type="button" @click="api.cancelCast()">Cancel cast</button>
      <button type="button" @click="api.interruptCast()">Interrupt cast</button>
      <button type="button" @click="api.clearCast()">Clear immediately</button>
      <button type="button" @click="api.resetWindowLayout()">Reset cast position</button>
    </div>
  </section>
</template>
