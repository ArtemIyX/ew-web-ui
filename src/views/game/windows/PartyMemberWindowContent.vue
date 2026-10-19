<script setup lang="ts">
import { computed } from 'vue'
import { useGamePartyStore } from '@/stores/gameParty'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import PartyMemberCard from '@/views/game/components/PartyMemberCard.vue'
import type { PartyMemberWindowProps } from '@/views/game/types/partyWindows'

defineOptions({ inheritAttrs: false })

const props = defineProps<PartyMemberWindowProps>()
const store = useGamePartyStore()
const shortcuts = useGameShortcutsStore()
const member = computed(() => store.memberById(props.memberId))
const dragLabelContent = computed(() =>
  gameText(gameKeys.partyMemberMove, {
    memberName: member.value?.characterName ?? props.memberId,
  }),
)
const dragLabel = useLocalizedText(dragLabelContent)
</script>

<template>
  <section v-if="member" class="ew-party-member-window" :aria-label="member.characterName">
    <button
      class="ew-party-window-drag-handle"
      type="button"
      data-ew-window-drag-handle
      :aria-label="dragLabel"
    />
    <PartyMemberCard :member="member" :show-debug-metadata="shortcuts.showDebugMetadata" />
  </section>
</template>
