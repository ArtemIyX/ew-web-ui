<script setup lang="ts">
import { computed } from 'vue'
import { createGameTargetStatusDeveloperApi } from '@/services/game/targetStatus/gameTargetStatusDeveloperApi'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import {
  createSampleAbilityCast,
  createSampleBossTarget,
  createSampleMonsterTarget,
  createSamplePlayerTarget,
  createSampleStructureTarget,
  createSampleTargetEffect,
} from '@/views/game/types/gameTargetStatusFixtures'

const api = createGameTargetStatusDeveloperApi()
const store = useGameTargetStatusStore()
const targetName = computed(() => store.target?.displayName ?? 'No target selected')

function selectPlayer(withAffiliations = true): void {
  api.selectTarget(
    createSamplePlayerTarget(
      withAffiliations
        ? {}
        : { targetId: 'sample-target-player-no-affiliations', guild: null, order: null },
    ),
  )
}
function selectEnemy(): void {
  api.selectTarget(createSamplePlayerTarget({ targetId: 'sample-target-enemy', marker: 'enemy', displayName: 'Sample Enemy' }))
}
function populate(kind: 'buff' | 'debuff', count: number): void {
  api.replaceEffects(
    kind,
    Array.from({ length: count }, (_, index) => createSampleTargetEffect(index + 1)),
  )
}
function addTimedEffect(kind: 'buff' | 'debuff'): void {
  const nowMs = Date.now()
  const records = store.target?.[kind === 'buff' ? 'buffs' : 'debuffs'] ?? []
  const index = records.length + 1
  const durationMs = 3000 + Math.floor(Math.random() * 12000)
  const uniqueId = `timed-${kind}-${nowMs}-${Math.random().toString(36).slice(2)}`

  api.addEffect(
    kind,
    createSampleTargetEffect(index, {
      id: uniqueId,
      appliedAtMs: nowMs,
      endsAtMs: nowMs + durationMs,
      order: index,
    }),
  )
}
function startSampleCast(durationMs: number, castId: string): void {
  const cast = createSampleAbilityCast({ castId, startedAtMs: Date.now(), endsAtMs: Date.now() + durationMs })
  api.startCast({
    castId: cast.castId,
    abilityId: cast.abilityId,
    abilityName: cast.abilityName,
    durationMs,
    nowMs: cast.startedAtMs,
  })
}
function restartSampleCast(): void {
  startSampleCast(1200, 'sample-cast-restarted')
}
function simulateRevisionEvent(kind: 'stale' | 'gap'): void {
  const target = store.target
  if (!target) return
  api.applyRuntimeEvent({
    kind: 'target-patched',
    revision: kind === 'stale' ? store.revision : store.revision + 2,
    targetId: target.targetId,
    patch: { displayName: `${target.displayName} ${kind}` },
  })
}
</script>

<template>
  <section class="ew-debug-window-content__panel ew-target-status-debug" role="tabpanel">
    <p class="ew-target-status-debug__target">{{ targetName }}</p>
    <div class="ew-target-status-debug__group" aria-label="Target samples">
      <button type="button" @click="selectPlayer(true)">Sample player</button>
      <button type="button" @click="selectPlayer(false)">Player without affiliations</button>
      <button type="button" @click="selectEnemy">Enemy player</button>
      <button type="button" @click="api.selectTarget(createSampleStructureTarget())">World structure</button>
      <button type="button" @click="api.selectTarget(createSampleMonsterTarget())">Monster</button>
      <button type="button" @click="api.selectTarget(createSampleBossTarget())">Boss</button>
      <button type="button" @click="api.clearTarget()">Clear target</button>
    </div>
    <div class="ew-target-status-debug__group" aria-label="Target health">
      <button type="button" @click="api.setHealth(1000, 1000)">Full HP</button>
      <button type="button" @click="api.setHealth(500, 1000)">Half HP</button>
      <button type="button" @click="api.setHealth(1, 1000)">Low HP</button>
      <button type="button" @click="api.setHealth(0, 1000)">Zero HP</button>
      <button type="button" @click="api.setHealth(Number.NaN, 1000)">Reject invalid HP</button>
    </div>
    <div class="ew-target-status-debug__group" aria-label="Target effects">
      <button type="button" @click="populate('buff', 0)">0 buffs</button>
      <button type="button" @click="populate('buff', 1)">1 buff</button>
      <button type="button" @click="addTimedEffect('buff')">Add timed buff</button>
      <button type="button" @click="populate('buff', 12)">12 buffs</button>
      <button type="button" @click="populate('buff', 13)">13 buffs</button>
      <button type="button" @click="populate('buff', 24)">24 buffs</button>
      <button type="button" @click="populate('buff', 48)">48 buffs</button>
      <button type="button" @click="populate('debuff', 12)">12 debuffs</button>
      <button type="button" @click="populate('debuff', 0)">0 debuffs</button>
      <button type="button" @click="populate('debuff', 1)">1 debuff</button>
      <button type="button" @click="addTimedEffect('debuff')">Add timed debuff</button>
      <button type="button" @click="populate('debuff', 24)">24 debuffs</button>
      <button type="button" @click="populate('debuff', 25)">25 debuffs</button>
      <button type="button" @click="populate('debuff', 48)">48 debuffs</button>
    </div>
    <div class="ew-target-status-debug__group" aria-label="Target casting">
      <button type="button" @click="startSampleCast(1200, 'sample-cast-short')">Start 1.2s cast</button>
      <button type="button" @click="startSampleCast(8000, 'sample-cast-long')">Start long cast</button>
      <button type="button" @click="restartSampleCast">Restart same ability</button>
      <button type="button" @click="api.interruptCast()">Interrupt cast</button>
      <button type="button" @click="api.finishCast()">Finish cast</button>
      <button type="button" @click="simulateRevisionEvent('stale')">Simulate stale event</button>
      <button type="button" @click="simulateRevisionEvent('gap')">Simulate revision gap</button>
    </div>
    <div class="ew-target-status-debug__group" aria-label="Target window">
      <button type="button" @click="api.focusWindow()">Focus target window</button>
      <button type="button" @click="api.resetWindowLayout()">Reset target layout</button>
    </div>
  </section>
</template>
