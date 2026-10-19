import type { InjectionKey, Ref } from 'vue'
import type { LocalizationLoader } from '@/shared/services/localization/localizationService'
import type { LocalizationService } from '@/shared/services/localization/localizationService'

export interface LocalizationContext { culture: Ref<string>; loader: LocalizationLoader; service: LocalizationService }
export const localizationKey: InjectionKey<LocalizationContext> = Symbol('ew-localization')
