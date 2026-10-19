/// <reference types="vite/client" />

import type { GameBuffDeveloperApi } from '@/services/game/buffs/gameBuffDeveloperApi'
import type { GameDebuffDeveloperApi } from '@/services/game/debuffs/gameDebuffDeveloperApi'
import type { GameToggleDeveloperApi } from '@/services/game/toggles/gameToggleDeveloperApi'
import type { StatusEffectsDeveloperApi } from '@/services/game/statusEffects/gameStatusEffectsDeveloperApi'
import type { GameTargetStatusDeveloperApi } from '@/services/game/targetStatus/gameTargetStatusDeveloperApi'
import type { GamePlayerCastDeveloperApi } from '@/services/game/playerCast/gamePlayerCastDeveloperApi'

declare global {
  interface EwDeveloperApi {
    buffList: GameBuffDeveloperApi
    debuffList: GameDebuffDeveloperApi
    toggleList: GameToggleDeveloperApi
    statusEffects: StatusEffectsDeveloperApi
    targetStatus: GameTargetStatusDeveloperApi
    playerCast: GamePlayerCastDeveloperApi
  }

  interface Window {
    ew?: EwDeveloperApi
  }
}
