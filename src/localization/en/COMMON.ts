import { LocalizationTableName } from '@/shared/services/localization/localizationTableName'

export const COMMON = LocalizationTableName.Common
export const commonTable = [
  '#WINDOW',
  '#CLOSE',
  '#RESIZE',
  '#LOADING',
  '#DETAILS',
  '#CANCEL',
  '#CONFIRM',
] as const
export type CommonTextKey = (typeof commonTable)[number]
