<script setup lang="ts">
import GameStatusEffectVisual from '@/views/game/components/GameStatusEffectVisual/GameStatusEffectVisual.vue'
import type { GameBuffRecord } from '@/views/game/types/gameBuffs'

defineProps<{
  record: GameBuffRecord
  nowMs: number
  debug?: boolean
}>()
</script>

<template>
  <GameStatusEffectVisual
    :record="{
      id: record.buffId,
      definition: record.definition,
      appliedAtMs: record.appliedAtMs,
      endsAtMs: record.endsAtMs,
      order: record.order,
    }"
    :now-ms="nowMs"
    :debug="debug"
  />
</template>
