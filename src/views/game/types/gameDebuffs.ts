import type {
  GameStatusEffectDefinition,
  GameStatusEffectPatch,
  GameStatusEffectRuntimeEvent,
  GameStatusEffectSnapshot,
} from './gameStatusEffects'

export const DEBUFF_LIST_WINDOW_ID = 'debuff-list'
export const DEBUFF_COLUMNS = 12
export type DebuffId = string
export type GameDebuffDefinition = GameStatusEffectDefinition
export interface GameDebuffRecord {
  debuffId: DebuffId
  definition: GameDebuffDefinition
  appliedAtMs: number
  endsAtMs: number | null
  order: number
}
export interface GameDebuffSnapshot {
  revision: number
  debuffs: readonly GameDebuffRecord[]
}
export type GameDebuffPatch = GameStatusEffectPatch
export type GameDebuffRuntimeEvent =
  | { kind: 'snapshot'; snapshot: GameDebuffSnapshot }
  | { kind: 'upsert'; revision: number; debuff: GameDebuffRecord }
  | { kind: 'remove'; revision: number; debuffId: DebuffId }
  | { kind: 'clear'; revision: number }
export type GameDebuffHostTransport = {
  loadGameDebuffs: () => Promise<GameDebuffSnapshot>
  subscribeGameDebuffs: (listener: (event: GameDebuffRuntimeEvent) => void) => () => void
}
export type NormalizedDebuffSnapshot = GameStatusEffectSnapshot<DebuffId>
export type NormalizedDebuffEvent = GameStatusEffectRuntimeEvent<DebuffId>
