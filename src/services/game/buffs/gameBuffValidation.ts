import type { GameBuffRecord, GameBuffSnapshot } from '@/views/game/types/gameBuffs'
import { validateSkillTooltipModel } from '@/views/game/utilities/skillTooltipModel'
import { cloneStatusEffect } from '@/services/game/statusEffects/gameStatusEffectValidation'

export type GameBuffValidationIssueCode =
  | 'missing-buff-id'
  | 'duplicate-buff-id'
  | 'missing-skill-id'
  | 'invalid-level'
  | 'invalid-order'
  | 'invalid-applied-time'
  | 'invalid-end-time'
  | 'end-before-applied'
  | 'invalid-tooltip'

export interface GameBuffValidationIssue {
  code: GameBuffValidationIssueCode
  path: string
}

export type GameBuffValidationResult<T> =
  { ok: true; value: T } | { ok: false; issues: readonly GameBuffValidationIssue[] }

export function validateGameBuffRecord(
  record: GameBuffRecord,
): GameBuffValidationResult<GameBuffRecord> {
  const issues: GameBuffValidationIssue[] = []
  if (typeof record.buffId !== 'string' || !record.buffId.trim())
    issues.push({ code: 'missing-buff-id', path: 'buffId' })
  if (typeof record.definition?.skillId !== 'string' || !record.definition.skillId.trim())
    issues.push({ code: 'missing-skill-id', path: 'definition.skillId' })
  if (!Number.isInteger(record.definition?.level) || record.definition.level <= 0)
    issues.push({ code: 'invalid-level', path: 'definition.level' })
  if (!record.definition?.icon) issues.push({ code: 'invalid-tooltip', path: 'definition.icon' })
  if (!Number.isInteger(record.order) || record.order < 0)
    issues.push({ code: 'invalid-order', path: 'order' })
  if (!Number.isFinite(record.appliedAtMs))
    issues.push({ code: 'invalid-applied-time', path: 'appliedAtMs' })
  if (record.endsAtMs !== null && !Number.isFinite(record.endsAtMs))
    issues.push({ code: 'invalid-end-time', path: 'endsAtMs' })
  if (record.endsAtMs !== null && record.endsAtMs < record.appliedAtMs)
    issues.push({ code: 'end-before-applied', path: 'endsAtMs' })
  if (record.definition && typeof record.definition.skillId === 'string') {
    const tooltip = validateSkillTooltipModel(record.definition)
    if (!tooltip.ok) {
      tooltip.issues.forEach((issue) =>
        issues.push({ code: 'invalid-tooltip', path: `definition.${issue.path}` }),
      )
    }
  } else {
    issues.push({ code: 'invalid-tooltip', path: 'definition' })
  }
  return issues.length > 0
    ? { ok: false, issues }
    : { ok: true, value: cloneStatusEffect(record) }
}

export function validateGameBuffSnapshot(
  snapshot: GameBuffSnapshot,
): GameBuffValidationResult<GameBuffSnapshot> {
  const issues: GameBuffValidationIssue[] = []
  if (!Number.isInteger(snapshot.revision) || snapshot.revision < 0)
    issues.push({ code: 'invalid-order', path: 'revision' })
  const ids = new Set<string>()
  const buffs = snapshot.buffs.map((record, index) => {
    const result = validateGameBuffRecord(record)
    if (!result.ok) {
      result.issues.forEach((issue) =>
        issues.push({ ...issue, path: `buffs[${index}].${issue.path}` }),
      )
      return null
    }
    if (ids.has(record.buffId))
      issues.push({ code: 'duplicate-buff-id', path: `buffs[${index}].buffId` })
    ids.add(record.buffId)
    return result.value
  })
  return issues.length > 0
    ? { ok: false, issues }
    : {
        ok: true,
        value: { revision: snapshot.revision, buffs: buffs.filter(Boolean) as GameBuffRecord[] },
      }
}

export function cloneGameBuff(record: GameBuffRecord): GameBuffRecord {
  return cloneStatusEffect(record)
}
