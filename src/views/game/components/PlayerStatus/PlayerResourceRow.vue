<script setup lang="ts">
import PlayerResourceBar from './PlayerResourceBar.vue'
import type {
  ResourceDisplayMode,
  ResourceKind,
  ResourceValue,
} from '@/views/game/types/playerStatus'

defineProps<{
  kind: ResourceKind
  label: string
  tone: 'hp' | 'mp' | 'energy'
  value: ResourceValue
  mode: ResourceDisplayMode
  secondaryValue?: ResourceValue
  secondaryLabel?: string
}>()

const emit = defineEmits<{
  toggle: [kind: ResourceKind]
}>()
</script>

<template>
  <div
    class="ew-player-status__resource-row"
    :class="{ 'ew-player-status__resource-row--with-secondary': secondaryValue }"
    :data-resource-kind="kind"
  >
    <div class="ew-player-status__resource-row-main">
      <PlayerResourceBar
        :kind="kind"
        :label="label"
        :tone="tone"
        :shape="secondaryValue ? 'notched' : 'angled'"
        :value="value"
        :mode="mode"
        @toggle="emit('toggle', kind)"
      />
    </div>
    <div v-if="secondaryValue && secondaryLabel" class="ew-player-status__resource-row-secondary">
      <PlayerResourceBar
        :kind="kind"
        :label="secondaryLabel"
        :tone="tone"
        :value="secondaryValue"
        mode="percentage"
        secondary
      />
    </div>
  </div>
</template>
