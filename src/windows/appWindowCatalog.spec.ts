import { describe, expect, it } from 'vitest'
import { LocalizationTableName } from '@/shared/services/localization/localizationTableName'
import { PARTY_CONTROLS_WINDOW_ID } from '@/views/game/types/partyControls'
import { SQUAD_CONTROLS_WINDOW_ID } from '@/views/game/types/squadControls'
import { appWindowCatalog } from './appWindowCatalog'
import { BUFF_LIST_WINDOW_ID } from '@/views/game/types/gameBuffs'
import { DEBUFF_LIST_WINDOW_ID } from '@/views/game/types/gameDebuffs'
import { TOGGLE_LIST_WINDOW_ID } from '@/views/game/types/gameToggles'
import { PARTY_GROUP_WINDOW_ID, PARTY_MEMBER_WINDOW_IDS } from '@/views/game/types/partyWindows'
import { TARGET_STATUS_WINDOW_ID } from '@/views/game/types/gameTargetStatus'
import { PLAYER_ABILITY_CAST_WINDOW_ID } from '@/views/game/types/gameAbilityCast'

describe('appWindowCatalog player cast', () => {
  it('registers a bottom-centered movable transparent window', () => {
    const definition = appWindowCatalog.find((item) => item.id === PLAYER_ABILITY_CAST_WINDOW_ID)

    expect(definition).toMatchObject({
      headerVisible: false,
      dragRegion: 'surface',
      chrome: 'none',
      surface: 'transparent',
      closable: false,
      resizable: false,
      persistent: true,
      fitContentHeight: true,
      defaultSize: { width: 32 * 16, height: 4 * 16 },
      defaultPosition: { anchor: 'bottom-center', insetBlockEnd: 6 * 16 },
    })
  })
})

describe('appWindowCatalog target status', () => {
  it('keeps a stable width while effects are added', () => {
    const definition = appWindowCatalog.find((item) => item.id === TARGET_STATUS_WINDOW_ID)

    expect(definition).toMatchObject({
      id: TARGET_STATUS_WINDOW_ID,
      fitContentHeight: true,
      defaultSize: { width: 32 * 16, height: 16 * 16 },
    })
    expect(definition?.fitContentWidth).not.toBe(true)
  })
})

describe('appWindowCatalog party controls', () => {
  it('registers a compact, non-closable, non-resizable tool window', () => {
    const definition = appWindowCatalog.find((item) => item.id === PARTY_CONTROLS_WINDOW_ID)

    expect(definition).toMatchObject({
      id: PARTY_CONTROLS_WINDOW_ID,
      title: { table: LocalizationTableName.Game, textKey: '#PARTY_CONTROLS_TITLE' },
      headerSize: 'sm',
      titleSize: 'sm',
      closable: false,
      closeOnEscape: false,
      resizable: false,
      resizeMode: 'none',
      persistent: true,
      resetSizeOnOpen: true,
      bodyFlush: true,
      defaultSize: { width: 16 * 16, height: 17 * 16 },
    })
  })
})

describe('appWindowCatalog squad controls', () => {
  it('registers a compact, persistent, non-closable tool window', () => {
    const definition = appWindowCatalog.find((item) => item.id === SQUAD_CONTROLS_WINDOW_ID)

    expect(definition).toMatchObject({
      id: SQUAD_CONTROLS_WINDOW_ID,
      title: { table: LocalizationTableName.Game, textKey: '#SQUAD_CONTROLS_TITLE' },
      headerSize: 'sm',
      titleSize: 'sm',
      closable: false,
      closeOnEscape: false,
      resizable: false,
      resizeMode: 'none',
      persistent: true,
      resetSizeOnOpen: true,
      bodyFlush: true,
      defaultSize: { width: 16 * 16, height: 14 * 16 },
      defaultPosition: { x: 20 * 16, y: 21 * 16 },
    })
  })
})

describe('appWindowCatalog buff list', () => {
  it('registers a headless, handle-movable persistent HUD window', () => {
    const definition = appWindowCatalog.find((item) => item.id === BUFF_LIST_WINDOW_ID)

    expect(definition).toMatchObject({
      id: BUFF_LIST_WINDOW_ID,
      headerVisible: false,
      dragRegion: 'handle',
      chrome: 'none',
      surface: 'transparent',
      closable: false,
      closeOnEscape: false,
      resizable: false,
      resizeMode: 'none',
      persistent: true,
      fitContentHeight: true,
      defaultSize: { width: 36 * 16, height: 3 * 16 },
    })
  })
})

describe('appWindowCatalog status-effect lists', () => {
  it('registers independent debuff and toggle HUD windows', () => {
    const debuff = appWindowCatalog.find((item) => item.id === DEBUFF_LIST_WINDOW_ID)
    const toggle = appWindowCatalog.find((item) => item.id === TOGGLE_LIST_WINDOW_ID)

    expect(debuff).toMatchObject({
      id: DEBUFF_LIST_WINDOW_ID,
      headerVisible: false,
      dragRegion: 'handle',
      persistent: true,
      fitContentHeight: true,
      defaultPosition: { x: 3 * 16, y: 17 * 16 },
    })
    expect(toggle).toMatchObject({
      id: TOGGLE_LIST_WINDOW_ID,
      headerVisible: false,
      dragRegion: 'handle',
      persistent: true,
      fitContentHeight: true,
      defaultPosition: { x: 3 * 16, y: 22 * 16 },
    })
    expect(new Set(appWindowCatalog.map((item) => item.id)).size).toBe(appWindowCatalog.length)
  })
})

describe('appWindowCatalog party windows', () => {
  it('registers one aggregate and five persistent slot windows', () => {
    const partyWindows = appWindowCatalog.filter((item) =>
      [PARTY_GROUP_WINDOW_ID, ...PARTY_MEMBER_WINDOW_IDS].includes(item.id as never),
    )
    expect(partyWindows).toHaveLength(6)
    expect(new Set(partyWindows.map((item) => item.id)).size).toBe(6)
    partyWindows.forEach((definition) => {
      expect(definition).toMatchObject({
        headerVisible: false,
        dragRegion: 'handle',
        chrome: 'none',
        surface: 'transparent',
        bodyFlush: true,
        closable: false,
        resizable: false,
        resizeMode: 'none',
        movable: true,
        persistent: true,
        resetSizeOnOpen: false,
        fitContentHeight: true,
        fitContentWidth: true,
        autoFocus: false,
      })
    })
  })
})
