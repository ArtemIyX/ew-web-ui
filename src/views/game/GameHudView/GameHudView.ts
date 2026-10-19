import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { useWindows } from '@/shared/composables/windows/useWindows'
import GameChat from '../components/GameChat/GameChat.vue'
import GameShortcutPanel from '../components/GameShortcutPanel/GameShortcutPanel.vue'
import { BUFF_LIST_WINDOW_ID } from '@/views/game/types/gameBuffs'
import { DEBUFF_LIST_WINDOW_ID } from '@/views/game/types/gameDebuffs'
import { TOGGLE_LIST_WINDOW_ID } from '@/views/game/types/gameToggles'
import { useGamePartyStore } from '@/stores/gameParty'
import { usePartyWindowCoordinator } from '../composables/usePartyWindowCoordinator'
import { useTargetStatusWindowCoordinator } from '../composables/useTargetStatusWindowCoordinator'
import { PLAYER_ABILITY_CAST_WINDOW_ID } from '@/views/game/types/gameAbilityCast'

export default defineComponent({
  components: { GameChat, GameShortcutPanel },
  setup() {
    const { openWindow } = useWindows()
    const party = useGamePartyStore()
    usePartyWindowCoordinator()
    useTargetStatusWindowCoordinator()

    onMounted(() => {
      openWindow('player-status')
      openWindow(BUFF_LIST_WINDOW_ID)
      openWindow(DEBUFF_LIST_WINDOW_ID)
      openWindow(TOGGLE_LIST_WINDOW_ID)
      openWindow(PLAYER_ABILITY_CAST_WINDOW_ID)
      void party.initialize()
      document.documentElement.classList.add('ew-game-document')
      document.body.classList.add('ew-game-document')
    })
    onBeforeUnmount(() => {
      document.documentElement.classList.remove('ew-game-document')
      document.body.classList.remove('ew-game-document')
    })

    return {
      openDebugWindow: () => openWindow('debug'),
    }
  },
})
