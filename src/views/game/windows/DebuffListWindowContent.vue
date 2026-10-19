<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useGameDebuffDomain } from '@/stores/gameDebuffs'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useGameCooldownClock } from '@/views/game/composables/useGameCooldownClock'
import GameStatusEffectList from '@/views/game/components/GameStatusEffectList/GameStatusEffectList.vue'
import { gameText, gameKeys } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const store = useGameDebuffDomain()
const shortcuts = useGameShortcutsStore()
const { nowMs } = useGameCooldownClock(() => store.hasTimedDebuffs)
const dragLabel = useLocalizedText(() => gameText(gameKeys.debuffListDrag))
const listLabel = useLocalizedText(() => gameText(gameKeys.debuffListAria))
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
    kind="debuff"
  />
</template>
