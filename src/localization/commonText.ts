import { LocalizationTableName } from '@/shared/services/localization/localizationTableName'
import type { CommonTextKey } from './en/COMMON'

export const commonKeys = {
  window: '#WINDOW',
  close: '#CLOSE',
  resize: '#RESIZE',
  loading: '#LOADING',
  details: '#DETAILS',
  cancel: '#CANCEL',
  confirm: '#CONFIRM',
} as const satisfies Record<string, CommonTextKey>

export const commonText = (textKey: CommonTextKey) => ({
  table: LocalizationTableName.Common,
  textKey,
})
