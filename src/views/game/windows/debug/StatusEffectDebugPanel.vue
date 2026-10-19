<script setup lang="ts">
import { computed } from 'vue'

interface StatusEffectDebugRecord {
  id: string
  endsAtMs: number | null
}

interface StatusEffectDebugApi {
  list(): readonly StatusEffectDebugRecord[]
  listTimed(): readonly StatusEffectDebugRecord[]
  openWindow(): unknown
  add(record: unknown): unknown
  clear(): unknown
  setRemainingTime(id: string, durationMs: number): unknown
  adjustEndTime(id: string, deltaMs: number): unknown
  makePermanent(id: string): unknown
  expireNow(id: string): unknown
}

const props = defineProps<{
  api: StatusEffectDebugApi
  label: string
  singular: string
  idPrefix: string
  createSample: (id: string, endsAtMs: number | null, order: number) => unknown
}>()

const count = computed(() => props.api.list().length)
const timedCount = computed(() => props.api.listTimed().length)

function addSample(durationMs: number | null): void {
  const order = count.value + 1
  const id = `${props.idPrefix}-${Date.now()}-${order}`
  props.api.add(props.createSample(id, durationMs === null ? null : Date.now() + durationMs, order))
}

function populate(countToCreate: number): void {
  props.api.clear()
  for (let index = 1; index <= countToCreate; index += 1) {
    props.api.add(props.createSample(`${props.idPrefix}-${index}`, null, index))
  }
}

function randomId(): string | undefined {
  return props.api.list()[Math.floor(Math.random() * count.value)]?.id
}

function setRandomRemaining(durationMs: number): void {
  const id = randomId()
  if (id) props.api.setRemainingTime(id, durationMs)
}

function adjustRandom(deltaMs: number): void {
  const timed = props.api.listTimed()
  const id = timed[Math.floor(Math.random() * timed.length)]?.id
  if (id) props.api.adjustEndTime(id, deltaMs)
}

function makeRandomPermanent(): void {
  const id = props.api.listTimed()[0]?.id
  if (id) props.api.makePermanent(id)
}

function expireRandom(): void {
  const id = randomId()
  if (id) props.api.expireNow(id)
}
</script>

<template>
  <section class="ew-debug-window-content__panel" role="tabpanel" :aria-label="label">
    <p class="ew-caption">Development-only sample {{ label.toLowerCase() }} data</p>
    <button type="button" @click="api.openWindow">Open/focus {{ singular }} list</button>
    <button type="button" @click="addSample(null)">Add permanent sample {{ singular }}</button>
    <button type="button" @click="addSample(45_000)">Add 45-second sample {{ singular }}</button>
    <button type="button" @click="populate(12)">
      Populate 12 sample {{ label.toLowerCase() }}
    </button>
    <button type="button" @click="populate(13)">
      Populate 13 sample {{ label.toLowerCase() }}
    </button>
    <button type="button" @click="populate(48)">
      Populate 48 sample {{ label.toLowerCase() }}
    </button>
    <button type="button" :disabled="count === 0" @click="setRandomRemaining(75_000)">
      Set random {{ singular }} to 75 seconds
    </button>
    <button type="button" :disabled="count === 0" @click="setRandomRemaining(45_000)">
      Set random {{ singular }} to 45 seconds
    </button>
    <button type="button" :disabled="timedCount === 0" @click="adjustRandom(10_000)">
      Add 10 seconds to random timed {{ singular }}
    </button>
    <button type="button" :disabled="timedCount === 0" @click="adjustRandom(-10_000)">
      Subtract 10 seconds from random timed {{ singular }}
    </button>
    <button type="button" :disabled="timedCount === 0" @click="makeRandomPermanent">
      Make random timed {{ singular }} permanent
    </button>
    <button type="button" :disabled="count === 0" @click="expireRandom">
      Expire random {{ singular }}
    </button>
    <button type="button" :disabled="count === 0" @click="api.clear">
      Clear sample {{ label.toLowerCase() }}
    </button>
  </section>
</template>
