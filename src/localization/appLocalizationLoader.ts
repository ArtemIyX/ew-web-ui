import { menuTable } from './en/MENU'
import { gameEnglishTable, gameTable } from './en/GAME'
import { gameSettingsTable } from './en/GAME_SETTINGS'
import { commonTable } from './en/COMMON'
import { LocalizationTableName } from '@/shared/services/localization/localizationTableName'
export async function appLocalizationLoader(_culture: string, table: string) {
  if (table === LocalizationTableName.Common)
    return Object.fromEntries(commonTable.map((key) => [key, key]))
  if (table === LocalizationTableName.Menu)
    return Object.fromEntries(menuTable.map((key) => [key, key]))
  if (table === LocalizationTableName.Game)
    return Object.fromEntries(gameTable.map((key) => [key, gameEnglishTable[key] ?? key]))
  if (table === LocalizationTableName.GameSettings)
    return Object.fromEntries(gameSettingsTable.map((key) => [key, key]))
  return {}
}
