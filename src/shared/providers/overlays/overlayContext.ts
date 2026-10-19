import type { InjectionKey, Ref } from 'vue'

export interface OverlayContext { count: Ref<number>; register: () => number; unregister: () => void }
export const overlayKey: InjectionKey<OverlayContext> = Symbol('ew-overlay')
