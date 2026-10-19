import type { TextContent } from '@/shared/types/components'

export type AbilityCastId = string
export type AbilityId = string

export interface AbilityCastSnapshot {
  castId: AbilityCastId
  abilityId: AbilityId
  abilityName: TextContent
  startedAtMs: number
  endsAtMs: number
}

export type AbilityCastTerminationReason = 'none' | 'finished' | 'cancelled' | 'interrupted'

export const PLAYER_ABILITY_CAST_WINDOW_ID = 'player-ability-cast'

export interface PlayerAbilityCastSnapshot {
  revision: number
  activeCast: AbilityCastSnapshot | null
  pausedAtMs: number | null
  terminationReason: AbilityCastTerminationReason
  lastUpdatedAtMs: number | null
}
