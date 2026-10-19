import type { InjectionKey, Ref } from 'vue'
import type { SemanticTone, TextContent } from '@/shared/types/components'

export interface ToastItem { id: string; tone: SemanticTone; message: TextContent }
export interface ToastContext { items: Ref<ToastItem[]>; show: (message: TextContent, tone?: SemanticTone) => string; dismiss: (id: string) => void }
export const toastKey: InjectionKey<ToastContext> = Symbol('ew-toast')
