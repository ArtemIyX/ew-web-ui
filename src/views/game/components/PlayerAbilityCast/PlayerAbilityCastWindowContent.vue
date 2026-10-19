<script setup lang="ts">
import GameCastBar from '@/views/game/components/GameCastBar/GameCastBar.vue'
import { usePlayerAbilityCastStore } from '@/stores/playerAbilityCast'

const store = usePlayerAbilityCastStore()
</script>

<template>
  <GameCastBar
    :cast="store.activeCast"
    :paused-at-ms="store.pausedAtMs"
    :termination-reason="store.terminationReason"
    draggable-surface
  />
</template>
