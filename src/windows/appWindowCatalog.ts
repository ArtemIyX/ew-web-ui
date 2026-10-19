import type { WindowDefinition } from '@/shared/windows/types'
import DebugWindowContent from '@/views/game/windows/DebugWindowContent.vue'
import SkillListWindowContent from '@/views/game/windows/SkillListWindowContent.vue'
import { gameSettingsText } from '@/localization/gameSettingsText'
import { gameText, gameKeys } from '@/localization/gameText'
import GameSettingsWindowContent from '@/views/game/windows/GameSettingsWindow/GameSettingsWindowContent.vue'
import PlayerStatusWindowContent from '@/views/game/components/PlayerStatus/PlayerStatusWindowContent.vue'
import GameFeaturePlaceholderWindowContent from '@/views/game/windows/GameFeaturePlaceholderWindowContent.vue'
import PartyControlsWindowContent from '@/views/game/windows/PartyControlsWindowContent.vue'
import { PARTY_CONTROLS_WINDOW_ID } from '@/views/game/types/partyControls'
import SquadControlsWindowContent from '@/views/game/windows/SquadControlsWindowContent.vue'
import { SQUAD_CONTROLS_WINDOW_ID } from '@/views/game/types/squadControls'
import BuffListWindowContent from '@/views/game/windows/BuffListWindowContent.vue'
import { BUFF_LIST_WINDOW_ID } from '@/views/game/types/gameBuffs'
import DebuffListWindowContent from '@/views/game/windows/DebuffListWindowContent.vue'
import ToggleListWindowContent from '@/views/game/windows/ToggleListWindowContent.vue'
import { DEBUFF_LIST_WINDOW_ID } from '@/views/game/types/gameDebuffs'
import { TOGGLE_LIST_WINDOW_ID } from '@/views/game/types/gameToggles'
import PartyGroupWindowContent from '@/views/game/windows/PartyGroupWindowContent.vue'
import PartyMemberWindowContent from '@/views/game/windows/PartyMemberWindowContent.vue'
import { PARTY_GROUP_WINDOW_ID, PARTY_MEMBER_WINDOW_IDS } from '@/views/game/types/partyWindows'
import { TARGET_STATUS_WINDOW_ID } from '@/views/game/types/gameTargetStatus'
import TargetStatusWindowContent from '@/views/game/components/TargetStatus/TargetStatusWindowContent.vue'
import PlayerAbilityCastWindowContent from '@/views/game/components/PlayerAbilityCast/PlayerAbilityCastWindowContent.vue'
import { PLAYER_ABILITY_CAST_WINDOW_ID } from '@/views/game/types/gameAbilityCast'

export function defineWindow(definition: WindowDefinition): WindowDefinition {
  return definition
}

// Preferred persistent tool window: omit title/closability and provide an accessible label.
// Classic windows should explicitly provide title, ariaLabel, and closable: true.
export const appWindowCatalog: WindowDefinition[] = [
  defineWindow({
    id: 'game-settings',
    component: GameSettingsWindowContent,
    title: gameSettingsText('#GAME_SETTINGS_TITLE'),
    ariaLabel: gameSettingsText('#GAME_SETTINGS_ARIA'),
    closeLabel: gameSettingsText('#GAME_SETTINGS_CLOSE'),
    defaultSize: { width: 68 * 16, height: 44 * 16 },
    constraints: { minWidth: 32 * 16, minHeight: 24 * 16 },
    defaultPosition: 'center',
    bodyFlush: true,
    resizable: true,
    closable: true,
    closeOnEscape: true,
  }),
  defineWindow({
    id: 'skill-list',
    component: SkillListWindowContent,
    title: gameText('#SKILL_LIST_TITLE'),
    ariaLabel: gameText('#SKILL_LIST_ARIA'),
    closeLabel: gameText('#SKILL_LIST_CLOSE'),
    defaultSize: { width: 50 * 16, height: 36 * 16 },
    constraints: { minWidth: 28 * 16, minHeight: 18 * 16 },
    defaultPosition: 'center',
    bodyFlush: true,
    resizable: true,
    closable: true,
  }),
  defineWindow({
    id: 'debug',
    component: DebugWindowContent,
    title: 'Debug',
    ariaLabel: 'Debug window',
    defaultSize: { width: 48 * 16, height: 32 * 16 },
    constraints: { minWidth: 24 * 16, minHeight: 14 * 16 },
    defaultPosition: 'center',
    resizable: true,
    closable: true,
  }),
  defineWindow({
    id: PARTY_CONTROLS_WINDOW_ID,
    component: PartyControlsWindowContent,
    title: gameText(gameKeys.partyControlsTitle),
    ariaLabel: gameText(gameKeys.partyControlsAria),
    headerSize: 'sm',
    titleSize: 'sm',
    surface: 'iron',
    headerSurface: 'bronze',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    dragRegion: 'header',
    persistent: true,
    resetSizeOnOpen: true,
    defaultSize: { width: 16 * 16, height: 17 * 16 },
    constraints: { minWidth: 14 * 16, minHeight: 15 * 16 },
    defaultPosition: { x: 3 * 16, y: 21 * 16 },
  }),
  defineWindow({
    id: SQUAD_CONTROLS_WINDOW_ID,
    component: SquadControlsWindowContent,
    title: gameText(gameKeys.squadControlsTitle),
    ariaLabel: gameText(gameKeys.squadControlsAria),
    headerSize: 'sm',
    titleSize: 'sm',
    surface: 'iron',
    headerSurface: 'bronze',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    dragRegion: 'header',
    persistent: true,
    resetSizeOnOpen: true,
    defaultSize: { width: 16 * 16, height: 14 * 16 },
    constraints: { minWidth: 14 * 16, minHeight: 12 * 16 },
    defaultPosition: { x: 20 * 16, y: 21 * 16 },
  }),
  defineWindow({
    id: 'player-status',
    component: PlayerStatusWindowContent,
    ariaLabel: 'Player status',
    headerVisible: false,
    dragRegion: 'surface',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    resizeMode: 'none',
    resizable: false,
    closable: false,
    persistent: true,
    resetSizeOnOpen: true,
    defaultSize: { width: 28 * 16, height: 17 * 16 },
    constraints: { minWidth: 20 * 16, minHeight: 10 * 16 },
    defaultPosition: { x: 3 * 16, y: 3 * 16 },
  }),
  defineWindow({
    id: PLAYER_ABILITY_CAST_WINDOW_ID,
    component: PlayerAbilityCastWindowContent,
    ariaLabel: gameText(gameKeys.playerCastAria),
    headerVisible: false,
    dragRegion: 'surface',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: false,
    fitContentHeight: true,
    autoFocus: false,
    defaultSize: { width: 32 * 16, height: 4 * 16 },
    constraints: { minWidth: 24 * 16, minHeight: 1 },
    defaultPosition: { anchor: 'bottom-center', insetBlockEnd: 6 * 16 },
  }),
  defineWindow({
    id: TARGET_STATUS_WINDOW_ID,
    component: TargetStatusWindowContent,
    ariaLabel: gameText(gameKeys.targetStatusAria),
    headerVisible: false,
    dragRegion: 'surface',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: false,
    fitContentHeight: true,
    autoFocus: false,
    defaultSize: { width: 32 * 16, height: 16 * 16 },
    constraints: { minWidth: 24 * 16, minHeight: 8 * 16 },
    defaultPosition: { x: 34 * 16, y: 3 * 16 },
  }),
  defineWindow({
    id: BUFF_LIST_WINDOW_ID,
    component: BuffListWindowContent,
    ariaLabel: gameText(gameKeys.buffListAria),
    headerVisible: false,
    dragRegion: 'handle',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: true,
    fitContentHeight: true,
    defaultSize: { width: 36 * 16, height: 3 * 16 },
    constraints: { minWidth: 26 * 16, minHeight: 3 * 16 },
    defaultPosition: { x: 3 * 16, y: 12 * 16 },
  }),
  defineWindow({
    id: DEBUFF_LIST_WINDOW_ID,
    component: DebuffListWindowContent,
    ariaLabel: gameText(gameKeys.debuffListAria),
    headerVisible: false,
    dragRegion: 'handle',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: true,
    fitContentHeight: true,
    defaultSize: { width: 36 * 16, height: 3 * 16 },
    constraints: { minWidth: 26 * 16, minHeight: 3 * 16 },
    defaultPosition: { x: 3 * 16, y: 17 * 16 },
  }),
  defineWindow({
    id: TOGGLE_LIST_WINDOW_ID,
    component: ToggleListWindowContent,
    ariaLabel: gameText(gameKeys.toggleListAria),
    headerVisible: false,
    dragRegion: 'handle',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: true,
    fitContentHeight: true,
    defaultSize: { width: 36 * 16, height: 3 * 16 },
    constraints: { minWidth: 26 * 16, minHeight: 3 * 16 },
    defaultPosition: { x: 3 * 16, y: 22 * 16 },
  }),
]

appWindowCatalog.push(
  defineWindow({
    id: PARTY_GROUP_WINDOW_ID,
    component: PartyGroupWindowContent,
    ariaLabel: gameText(gameKeys.partyGroupAria),
    headerVisible: false,
    dragRegion: 'handle',
    chrome: 'none',
    surface: 'transparent',
    bodyFlush: true,
    closable: false,
    closeOnEscape: false,
    resizable: false,
    resizeMode: 'none',
    movable: true,
    persistent: true,
    resetSizeOnOpen: false,
    fitContentHeight: true,
    fitContentWidth: true,
    autoFocus: false,
    defaultSize: { width: 27 * 16, height: 48 * 16 },
    constraints: { minWidth: 22 * 16, minHeight: 10 * 16 },
    defaultPosition: { x: 3 * 16, y: 3 * 16 },
  }),
)

PARTY_MEMBER_WINDOW_IDS.forEach((id, index) => {
  appWindowCatalog.push(
    defineWindow({
      id,
      component: PartyMemberWindowContent,
      ariaLabel: gameText(gameKeys.partyMemberAria, { memberName: id }),
      headerVisible: false,
      dragRegion: 'handle',
      chrome: 'none',
      surface: 'transparent',
      bodyFlush: true,
      closable: false,
      closeOnEscape: false,
      resizable: false,
      resizeMode: 'none',
      movable: true,
      persistent: true,
      resetSizeOnOpen: false,
      fitContentHeight: true,
      fitContentWidth: true,
      autoFocus: false,
      defaultSize: { width: 25 * 16, height: 14 * 16 },
      constraints: { minWidth: 20 * 16, minHeight: 10 * 16 },
      defaultPosition: { x: (32 + (index % 2) * 27) * 16, y: (3 + Math.floor(index / 2) * 16) * 16 },
    }),
  )
})

const placeholderDefinitions = [
  ['character-status', 'Character Status'],
  ['penalties', 'Penalties'],
  ['raid-group', 'Raid Group'],
  ['loot-distribution', 'Loot Distribution'],
  ['party-readiness', 'Party Readiness Check'],
  ['raid-party-removal', 'Remove Raid Party'],
  ['raid-readiness', 'Raid Readiness Check'],
] as const

for (const [id, title] of placeholderDefinitions) {
  appWindowCatalog.push(
    defineWindow({
      id,
      component: GameFeaturePlaceholderWindowContent,
      title,
      ariaLabel: `${title} window`,
      closable: true,
      closeOnEscape: true,
      bodyFlush: false,
      resizeMode: 'corner',
      defaultSize: { width: 24 * 16, height: 14 * 16 },
      constraints: { minWidth: 16 * 16, minHeight: 8 * 16 },
      defaultPosition: 'center',
    }),
  )
}
