import { LocalizationTableName } from '@/shared/services/localization/localizationTableName'
import type { LocalizationParams } from '@/shared/types/components'
import type { GameSettingsTextKey } from './en/GAME_SETTINGS'

export const gameSettingsText = (
  textKey: GameSettingsTextKey | string,
  params?: LocalizationParams,
) => ({
  table: LocalizationTableName.GameSettings,
  textKey: normalizeSettingsKey(textKey),
  ...(params ? { params } : {}),
})

function normalizeSettingsKey(textKey: string): string {
  if (textKey.startsWith('#GAME_SETTINGS_QUALITY_'))
    return `#${textKey.slice('#GAME_SETTINGS_QUALITY_'.length)}`
  if (textKey.startsWith('#GAME_SETTINGS_DLSS_MODE_'))
    return `#${textKey.slice('#GAME_SETTINGS_DLSS_MODE_'.length)}`
  if (textKey.startsWith('#GAME_SETTINGS_FRAME_GENERATION_'))
    return `#${textKey.slice('#GAME_SETTINGS_FRAME_GENERATION_'.length)}`
  if (textKey.startsWith('#GAME_SETTINGS_AA_'))
    return `#${textKey.slice('#GAME_SETTINGS_AA_'.length)}`
  return textKey.startsWith('#GAME_SETTINGS_')
    ? `#${textKey.slice('#GAME_SETTINGS_'.length)}`
    : textKey
}
