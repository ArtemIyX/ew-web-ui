<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import GameStatusEffectList from '@/views/game/components/GameStatusEffectList/GameStatusEffectList.vue'
import { useGameBuffsStore } from '@/stores/gameBuffs'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import { gameText, gameKeys } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'

const store = useGameBuffsStore()
const shortcuts = useGameShortcutsStore()
const { nowMs } = useGameCooldownClock(() => store.hasTimedBuffs)
const dragLabel = useLocalizedText(() => gameText(gameKeys.buffListDrag))
const listLabel = useLocalizedText(() => gameText(gameKeys.buffListAria))
const records = computed(() =>
  store.allBuffs.map((buff) => ({
    id: buff.buffId,
    definition: buff.definition,
    appliedAtMs: buff.appliedAtMs,
    endsAtMs: buff.endsAtMs,
    order: buff.order,
  })),
)

watch(nowMs, (value) => store.expireDueBuffs(value))
onMounted(() => void store.initialize())
onBeforeUnmount(() => store.dispose())
</script>

<template>
  <GameStatusEffectList
    :records="records"
    :now-ms="nowMs"
    :list-label="listLabel"
    :drag-label="dragLabel"
    :show-debug-metadata="shortcuts.showDebugMetadata"
    kind="buff"
  />
</template>
