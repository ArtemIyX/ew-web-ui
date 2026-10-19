import type { TextContent } from '@/shared/types/components'
import type { SkillShortcut } from '../types/shortcuts'
import type { SkillTooltipModel, SkillTooltipValue } from '../types/skills'

export type SkillTooltipValidationIssueCode =
  | 'missing-skill-id'
  | 'missing-name'
  | 'invalid-level'
  | 'duplicate-fact-key'
  | 'duplicate-upgrade-key'
  | 'non-finite-number'
  | 'negative-duration'
  | 'invalid-fraction-digits'

export type SkillTooltipValidationResult =
  | { ok: true; value: SkillTooltipModel }
  | {
      ok: false
      issues: readonly { code: SkillTooltipValidationIssueCode; path: string }[]
    }

function hasText(content: TextContent | undefined): boolean {
  return typeof content === 'string' ? content.trim().length > 0 : Boolean(content?.textKey)
}

export function validateSkillTooltipModel(value: SkillTooltipModel): SkillTooltipValidationResult {
  const issues: { code: SkillTooltipValidationIssueCode; path: string }[] = []
  if (!value.skillId.trim()) issues.push({ code: 'missing-skill-id', path: 'skillId' })
  if (!hasText(value.name)) issues.push({ code: 'missing-name', path: 'name' })
  if (value.level !== undefined && (!Number.isInteger(value.level) || value.level <= 0)) {
    issues.push({ code: 'invalid-level', path: 'level' })
  }
  const factKeys = new Set<string>()
  value.facts?.forEach((fact, index) => {
    if (factKeys.has(fact.key)) {
      issues.push({ code: 'duplicate-fact-key', path: `facts[${index}].key` })
    }
    factKeys.add(fact.key)
    validateValue(fact.value, `facts[${index}].value`, issues)
  })
  const upgradeKeys = new Set<string>()
  value.upgrades?.forEach((upgrade, index) => {
    if (upgradeKeys.has(upgrade.key)) {
      issues.push({ code: 'duplicate-upgrade-key', path: `upgrades[${index}].key` })
    }
    upgradeKeys.add(upgrade.key)
  })
  return issues.length ? { ok: false, issues } : { ok: true, value }
}

function validateValue(
  value: SkillTooltipValue,
  path: string,
  issues: { code: SkillTooltipValidationIssueCode; path: string }[],
) {
  if (value.kind === 'number') {
    if (!Number.isFinite(value.value))
      issues.push({ code: 'non-finite-number', path: `${path}.value` })
    const digits = [value.minimumFractionDigits, value.maximumFractionDigits]
    if (
      digits.some(
        (digit) => digit !== undefined && (!Number.isInteger(digit) || digit < 0 || digit > 20),
      )
    ) {
      issues.push({ code: 'invalid-fraction-digits', path })
    }
    if (
      value.minimumFractionDigits !== undefined &&
      value.maximumFractionDigits !== undefined &&
      value.minimumFractionDigits > value.maximumFractionDigits
    ) {
      issues.push({ code: 'invalid-fraction-digits', path })
    }
  }
  if (
    value.kind === 'duration' &&
    (!Number.isFinite(value.milliseconds) || value.milliseconds < 0)
  ) {
    issues.push({
      code: value.milliseconds < 0 ? 'negative-duration' : 'non-finite-number',
      path: `${path}.milliseconds`,
    })
  }
}

export interface SkillTooltipFormatContext {
  locale: string
  resolveText: (content: TextContent) => string
}

export function formatSkillTooltipValue(
  value: SkillTooltipValue,
  context: SkillTooltipFormatContext,
): string {
  if (value.kind === 'text') return context.resolveText(value.content)
  if (value.kind === 'boolean')
    return context.resolveText(value.value ? value.trueLabel : value.falseLabel)
  if (value.kind === 'number') {
    const formatted = new Intl.NumberFormat(context.locale, {
      minimumFractionDigits: value.minimumFractionDigits,
      maximumFractionDigits: value.maximumFractionDigits,
    }).format(value.value)
    return value.unit ? `${formatted} ${context.resolveText(value.unit)}` : formatted
  }
  if (
    value.precision === 'milliseconds' ||
    (value.precision === 'auto' && value.milliseconds < 1000)
  ) {
    return `${new Intl.NumberFormat(context.locale).format(value.milliseconds)} ms`
  }
  const seconds = value.milliseconds / 1000
  if (value.precision === 'seconds' || seconds < 60) {
    return `${new Intl.NumberFormat(context.locale, { maximumFractionDigits: 1 }).format(seconds)} s`
  }
  const minutes = seconds / 60
  return `${new Intl.NumberFormat(context.locale, { maximumFractionDigits: 1 }).format(minutes)} min`
}

export function createSkillTooltipFromShortcut(skill: SkillShortcut): SkillTooltipModel {
  return {
    skillId: skill.skillId,
    icon: skill.icon,
    name: skill.name,
    level: skill.level,
    type: skill.type,
    description: skill.description,
    facts: skill.facts,
    upgrades: skill.upgrades,
  }
}
