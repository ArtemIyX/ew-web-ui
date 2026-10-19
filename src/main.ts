import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGameBuffDeveloperApi } from '@/services/game/buffs/gameBuffDeveloperApi'
import { useGameBuffsStore } from '@/stores/gameBuffs'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import { useWindowManagerStore } from '@/stores/windowManager'
import { createGameDebuffDeveloperApi } from '@/services/game/debuffs/gameDebuffDeveloperApi'
import { createGameToggleDeveloperApi } from '@/services/game/toggles/gameToggleDeveloperApi'
import {
  createStatusEffectsDeveloperApi,
  installStatusEffectsDeveloperApi,
} from '@/services/game/statusEffects/gameStatusEffectsDeveloperApi'
import { createGameTargetStatusDeveloperApi, installGameTargetStatusDeveloperApi } from '@/services/game/targetStatus/gameTargetStatusDeveloperApi'
import {
  createGamePlayerCastDeveloperApi,
  installGamePlayerCastDeveloperApi,
} from '@/services/game/playerCast/gamePlayerCastDeveloperApi'

import './styles/global.css'
import './styles/game.css'
import './styles/game-shortcuts.css'
import './styles/skill-tooltips.css'
import './styles/skill-list.css'
import './styles/player-status.css'
import './styles/party-controls.css'
import './styles/status-effect-list.css'
import './styles/party-group.css'
import './styles/target-status.css'
import './styles/target-status-window.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

if (import.meta.env.DEV) {
  const api = createGameBuffDeveloperApi({
    store: useGameBuffsStore(pinia),
    shortcutsStore: useGameShortcutsStore(pinia),
    windowStore: useWindowManagerStore(pinia),
  })
  const debuffs = createGameDebuffDeveloperApi()
  const toggles = createGameToggleDeveloperApi()
  installStatusEffectsDeveloperApi(createStatusEffectsDeveloperApi(api, debuffs, toggles))
  installGameTargetStatusDeveloperApi(createGameTargetStatusDeveloperApi())
  installGamePlayerCastDeveloperApi(createGamePlayerCastDeveloperApi())
}

app.mount('#app')
