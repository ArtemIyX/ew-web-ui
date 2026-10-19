<script setup lang="ts">
import PlayerResourceRow from './PlayerResourceRow.vue'
import type { PlayerStatusSnapshot, ResourceKind } from '@/views/game/types/playerStatus'
defineProps<{
  snapshot: PlayerStatusSnapshot
  modes: Record<ResourceKind, 'percentage' | 'exact'>
}>()
const emit = defineEmits<{ toggle: [kind: ResourceKind] }>()
</script>

<template>
  <div class="ew-player-status__resources">
    <PlayerResourceRow
      kind="hp"
      label="Health"
      tone="hp"
      :value="snapshot.hp"
      :mode="modes.hp"
      :secondary-value="snapshot.lifeEnergy"
      secondary-label="Life Energy"
      @toggle="emit('toggle', 'hp')"
    />
    <PlayerResourceRow
      kind="mp"
      label="Mana"
      tone="mp"
      :value="snapshot.mp"
      :mode="modes.mp"
      :secondary-value="snapshot.manaEnergy"
      secondary-label="Mana Energy"
      @toggle="emit('toggle', 'mp')"
    />
    <PlayerResourceRow
      kind="energy"
      label="Energy"
      tone="energy"
      :value="snapshot.energy"
      :mode="modes.energy"
      @toggle="emit('toggle', 'energy')"
    />
  </div>
</template>
