import type { IconSource } from '@/shared/types/components'
import type { SkillTooltipModel } from '@/views/game/types/skills'

export const BUFF_LIST_WINDOW_ID = 'buff-list'
export const BUFF_COLUMNS = 12
export const BUFF_COUNTDOWN_THRESHOLD_MS = 60_000

export type BuffId = string

export interface GameBuffDefinition extends Omit<SkillTooltipModel, 'icon' | 'level'> {
  icon: IconSource
  level: number
}

export interface GameBuffRecord {
  buffId: BuffId
  definition: GameBuffDefinition
  appliedAtMs: number
  endsAtMs: number | null
  order: number
}

export interface GameBuffSnapshot {
  revision: number
  buffs: readonly GameBuffRecord[]
}

export interface GameBuffPatch {
  definition?: Partial<Omit<GameBuffDefinition, 'skillId'>>
  appliedAtMs?: number
  endsAtMs?: number | null
  order?: number
}

export type GameBuffRuntimeEvent =
  | { kind: 'snapshot'; snapshot: GameBuffSnapshot }
  | { kind: 'upsert'; revision: number; buff: GameBuffRecord }
  | { kind: 'remove'; revision: number; buffId: BuffId }
  | { kind: 'clear'; revision: number }
