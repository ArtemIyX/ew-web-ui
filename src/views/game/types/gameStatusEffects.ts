import type { IconSource } from '@/shared/types/components'
import type { SkillTooltipModel } from '@/views/game/types/skills'

export type GameStatusEffectKind = 'buff' | 'debuff' | 'toggle'

export interface GameStatusEffectDefinition extends Omit<SkillTooltipModel, 'icon' | 'level'> {
  icon: IconSource
  level: number
}

export interface GameStatusEffectRecord<Id extends string = string> {
  id: Id
  definition: GameStatusEffectDefinition
  appliedAtMs: number
  endsAtMs: number | null
  order: number
}

export interface GameStatusEffectSnapshot<Id extends string = string> {
  revision: number
  effects: readonly GameStatusEffectRecord<Id>[]
}

export type GameStatusEffectRuntimeEvent<Id extends string = string> =
  | { kind: 'snapshot'; snapshot: GameStatusEffectSnapshot<Id> }
  | { kind: 'upsert'; revision: number; record: GameStatusEffectRecord<Id> }
  | { kind: 'remove'; revision: number; id: Id }
  | { kind: 'clear'; revision: number }

export interface GameStatusEffectPatch {
  definition?: Partial<Omit<GameStatusEffectDefinition, 'skillId'>>
  appliedAtMs?: number
  endsAtMs?: number | null
  order?: number
}
