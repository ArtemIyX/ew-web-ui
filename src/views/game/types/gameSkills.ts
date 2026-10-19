import type { TextContent } from '@/shared/types/components'
import type { SkillCooldown, SkillShortcut } from './shortcuts'

export type SkillGroup = 'active' | 'passive' | 'other'
export interface SkillSubcategory {
  id: string
  group: SkillGroup
  label: TextContent
  order: number
}
export interface GameSkillDefinition extends Omit<SkillShortcut, 'kind' | 'cooldown'> {
  subcategoryId: string
}
export interface GameSkillRuntimeState {
  skillId: string
  usable: boolean
  blocked?: boolean
  toggleable?: boolean
  active: boolean
  cooldown: SkillCooldown | null
}
export interface GameSkillRecord {
  definition: GameSkillDefinition
  runtime: GameSkillRuntimeState
}
export interface GameSkillSnapshot {
  revision: number
  subcategories: readonly SkillSubcategory[]
  skills: readonly GameSkillRecord[]
}

export function toShortcutSkill(record: GameSkillRecord): SkillShortcut {
  return {
    ...record.definition,
    kind: 'skill',
    flags: {
      toggleable: record.definition.flags.toggleable,
      passive: record.definition.flags.passive,
      usable: record.runtime.usable,
      active: record.runtime.active,
    },
    cooldown: record.runtime.cooldown ? { ...record.runtime.cooldown } : null,
  }
}
