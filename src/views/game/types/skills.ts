import type { IconSource, SemanticTone, TextContent } from '@/shared/types/components'

export type SkillTooltipValue =
  | { kind: 'text'; content: TextContent }
  | {
      kind: 'number'
      value: number
      unit?: TextContent
      minimumFractionDigits?: number
      maximumFractionDigits?: number
    }
  | { kind: 'duration'; milliseconds: number; precision?: 'auto' | 'milliseconds' | 'seconds' }
  | {
      kind: 'boolean'
      value: boolean
      trueLabel: TextContent
      falseLabel: TextContent
    }

export interface SkillTooltipFact {
  key: string
  label: TextContent
  value: SkillTooltipValue
  tone?: SemanticTone
  hidden?: boolean
}

export interface SkillTooltipUpgrade {
  key: string
  text: TextContent
  tone?: SemanticTone
}

export interface SkillTooltipModel {
  skillId: string
  icon?: IconSource
  name: TextContent
  level?: number
  type?: TextContent
  description?: TextContent
  facts?: readonly SkillTooltipFact[]
  upgrades?: readonly SkillTooltipUpgrade[]
}
