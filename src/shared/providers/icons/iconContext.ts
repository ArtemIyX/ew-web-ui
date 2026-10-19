import type { InjectionKey } from 'vue'
import type { IconSource } from '@/shared/types/components'

export interface IconContext { resolve: (source: IconSource) => Promise<string | undefined> }
export const iconKey: InjectionKey<IconContext> = Symbol('ew-icons')
