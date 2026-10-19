<script setup lang="ts">
import { computed } from 'vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { usePartyControlActions } from '@/views/game/composables/usePartyControlActions'
import { usePlayerStatusStore } from '@/stores/playerStatus'
import { PARTY_CONTROLS_WINDOW_ID } from '@/views/game/types/partyControls'
import { SQUAD_CONTROLS_WINDOW_ID } from '@/views/game/types/squadControls'
import GameLevelBadge from '@/views/game/components/GameLevelBadge/GameLevelBadge.vue'
import PlayerResourceStack from './PlayerResourceStack.vue'

const store = usePlayerStatusStore()
const snapshot = computed(() => store.snapshot)
const modes = computed(() => store.preferences.resourceModes)
const { openWindow, closeWindow, getWindowState } = useWindows()
const { controlProps } = usePartyControlActions()
const partyControlsState = getWindowState(PARTY_CONTROLS_WINDOW_ID)
const partyControlsLabel = useLocalizedText(() => gameText(gameKeys.partyControlsTitle))
const partyControlsOpenLabel = useLocalizedText(() => gameText(gameKeys.partyControlsOpen))
const partyControlsCloseLabel = useLocalizedText(() => gameText(gameKeys.partyControlsClose))
const squadControlsState = getWindowState(SQUAD_CONTROLS_WINDOW_ID)
const squadControlsLabel = useLocalizedText(() => gameText(gameKeys.squadControlsTitle))
const squadControlsOpenLabel = useLocalizedText(() => gameText(gameKeys.squadControlsOpen))
const squadControlsCloseLabel = useLocalizedText(() => gameText(gameKeys.squadControlsClose))

function togglePartyControls(): void {
  if (partyControlsState.value.open) {
    closeWindow(PARTY_CONTROLS_WINDOW_ID, { force: true })
    return
  }

  openWindow(PARTY_CONTROLS_WINDOW_ID, controlProps())
}

function toggleSquadControls(): void {
  if (squadControlsState.value.open) {
    closeWindow(SQUAD_CONTROLS_WINDOW_ID, { force: true })
    return
  }

  openWindow(SQUAD_CONTROLS_WINDOW_ID)
}
</script>

<template>
  <section class="ew-player-status" aria-label="Player status">
    <div class="ew-player-status__identity">
      <GameLevelBadge
        :level="snapshot.level"
        :emphasis="snapshot.isPartyLeader ? 'party-leader' : 'default'"
      />
      <strong>{{ snapshot.characterName }}</strong>
    </div>
    <PlayerResourceStack
      :snapshot="snapshot"
      :modes="modes"
      @toggle="store.toggleResourceMode"
    />
    <div class="ew-player-status__actions">
      <button
        class="ew-player-status__launcher ew-player-status__party-launcher"
        type="button"
        data-ew-window-no-drag
        :aria-expanded="partyControlsState.open"
        :aria-controls="PARTY_CONTROLS_WINDOW_ID"
        :aria-label="partyControlsState.open ? partyControlsCloseLabel : partyControlsOpenLabel"
        :title="partyControlsLabel"
        @click="togglePartyControls"
      >
        <svg
          class="ew-player-status__party-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 18c.5-3 2.3-4.5 5.5-4.5s5 1.5 5.5 4.5" />
          <circle cx="17" cy="9" r="2.25" />
          <path d="M15.5 14.25c2.6-.1 4.3 1.1 5 3.75" />
        </svg>
      </button>
      <button
        class="ew-player-status__launcher ew-player-status__squad-launcher"
        type="button"
        data-ew-window-no-drag
        :aria-expanded="squadControlsState.open"
        :aria-controls="SQUAD_CONTROLS_WINDOW_ID"
        :aria-label="squadControlsState.open ? squadControlsCloseLabel : squadControlsOpenLabel"
        :title="squadControlsLabel"
        @click="toggleSquadControls"
      >
        <svg
          class="ew-player-status__squad-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M12 3.5 4.5 7.75v8.5L12 20.5l7.5-4.25v-8.5L12 3.5Z" />
          <path d="m4.75 7.9 7.25 4.15 7.25-4.15M12 12.05v8.2" />
          <path d="M8.5 5.5 16 9.75" />
        </svg>
      </button>
    </div>
  </section>
</template>
