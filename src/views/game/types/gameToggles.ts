import type {
  GameStatusEffectDefinition,
  GameStatusEffectRuntimeEvent,
  GameStatusEffectSnapshot,
} from './gameStatusEffects'

export const TOGGLE_LIST_WINDOW_ID = 'toggle-list'
export const TOGGLE_COLUMNS = 12
export type ToggleId = string
export type GameToggleDefinition = GameStatusEffectDefinition
export interface GameToggleRecord {
  toggleId: ToggleId
  definition: GameToggleDefinition
  appliedAtMs: number
  endsAtMs: number | null
  order: number
}
export interface GameToggleSnapshot {
  revision: number
  toggles: readonly GameToggleRecord[]
}
export type GameTogglePatch = {
  definition?: Partial<Omit<GameToggleDefinition, 'skillId'>>
  appliedAtMs?: number
  endsAtMs?: number | null
  order?: number
}
export type GameToggleRuntimeEvent =
  | { kind: 'snapshot'; snapshot: GameToggleSnapshot }
  | { kind: 'upsert'; revision: number; toggle: GameToggleRecord }
  | { kind: 'remove'; revision: number; toggleId: ToggleId }
  | { kind: 'clear'; revision: number }
export type GameToggleHostTransport = {
  loadGameToggles: () => Promise<GameToggleSnapshot>
  subscribeGameToggles: (listener: (event: GameToggleRuntimeEvent) => void) => () => void
}
export type NormalizedToggleSnapshot = GameStatusEffectSnapshot<ToggleId>
export type NormalizedToggleEvent = GameStatusEffectRuntimeEvent<ToggleId>
