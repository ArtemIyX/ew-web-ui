import type { IconSource, TextContent } from '@/shared/types/components'
import type { AbilityCastSnapshot } from './gameAbilityCast'
import type { ResourceValue } from './gameResources'
import type { GameStatusEffectPatch, GameStatusEffectRecord } from './gameStatusEffects'

export const TARGET_STATUS_WINDOW_ID = 'target-status' as const
export type TargetId = string
export type TargetEntityKind = 'player' | 'world-structure' | 'monster' | 'boss'
export type TargetMarker = 'world-structure' | 'ally' | 'enemy' | 'monster' | 'boss'
export type TargetAffiliationId = string

export interface TargetAffiliation {
  affiliationId: TargetAffiliationId
  name: TextContent
  icon: IconSource
}

export interface SelectedTargetSnapshot {
  targetId: TargetId
  entityKind: TargetEntityKind
  marker: TargetMarker
  displayName: string
  level: number
  portrait: IconSource | null
  guild: TargetAffiliation | null
  order: TargetAffiliation | null
  hp: ResourceValue
  buffs: readonly GameStatusEffectRecord[]
  debuffs: readonly GameStatusEffectRecord[]
  activeCast: AbilityCastSnapshot | null
}

export interface GameTargetStatusSnapshot {
  revision: number
  target: SelectedTargetSnapshot | null
}

export interface SelectedTargetPatch {
  marker?: TargetMarker
  displayName?: string
  level?: number
  portrait?: IconSource | null
  guild?: TargetAffiliation | null
  order?: TargetAffiliation | null
  hp?: ResourceValue
  buffs?: readonly GameStatusEffectRecord[]
  debuffs?: readonly GameStatusEffectRecord[]
  activeCast?: AbilityCastSnapshot | null
}

export type GameTargetStatusRuntimeEvent =
  | { kind: 'snapshot'; snapshot: GameTargetStatusSnapshot }
  | { kind: 'target-selected'; revision: number; target: SelectedTargetSnapshot }
  | { kind: 'target-patched'; revision: number; targetId: TargetId; patch: SelectedTargetPatch }
  | { kind: 'target-cleared'; revision: number; targetId: TargetId | null }

export type { GameStatusEffectPatch }
