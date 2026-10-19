<script setup lang="ts">
import { computed } from 'vue'
import { useGamePartyStore } from '@/stores/gameParty'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import PartyMemberCard from '@/views/game/components/PartyMemberCard.vue'

const store = useGamePartyStore()
const shortcuts = useGameShortcutsStore()
const label = useLocalizedText(() => gameText(gameKeys.partyGroupAria))
const dragLabel = useLocalizedText(() => gameText(gameKeys.partyGroupMove))
const members = computed(() => store.members)
</script>

<template>
  <section class="ew-party-group" :aria-label="label">
    <button
      class="ew-party-window-drag-handle"
      type="button"
      data-ew-window-drag-handle
      :aria-label="dragLabel"
    />
    <div class="ew-party-group__members">
      <PartyMemberCard
        v-for="member in members"
        :key="member.memberId"
        :member="member"
        :show-debug-metadata="shortcuts.showDebugMetadata"
      />
    </div>
  </section>
</template>
