<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useGameToggleDomain } from '@/stores/gameToggles'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import GameStatusEffectList from '@/views/game/components/GameStatusEffectList/GameStatusEffectList.vue'
import { gameText, gameKeys } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const store = useGameToggleDomain()
const shortcuts = useGameShortcutsStore()
const { nowMs } = useGameCooldownClock(() => store.hasTimedToggles)
const dragLabel = useLocalizedText(() => gameText(gameKeys.toggleListDrag))
const listLabel = useLocalizedText(() => gameText(gameKeys.toggleListAria))
watch(nowMs, (value) => store.expireDue(value))
onMounted(() => void store.initialize())
onBeforeUnmount(() => store.dispose())
</script>
<template>
  <GameStatusEffectList
    :records="store.allEffects"
    :now-ms="nowMs"
    :list-label="listLabel"
    :drag-label="dragLabel"
    :show-debug-metadata="shortcuts.showDebugMetadata"
    kind="toggle"
  />
</template>
