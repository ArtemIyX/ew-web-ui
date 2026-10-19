import { validateSkillTooltipModel } from '@/views/game/utilities/skillTooltipModel'
import { isReactive, toRaw } from 'vue'
import type {
  GameStatusEffectRecord,
  GameStatusEffectSnapshot,
} from '@/views/game/types/gameStatusEffects'

export interface StatusEffectValidationIssue {
  code: string
  path: string
}
export type StatusEffectValidationResult<T> =
  { ok: true; value: T } | { ok: false; issues: readonly StatusEffectValidationIssue[] }

export function cloneStatusEffect<T>(value: T): T {
  const unwrap = (current: unknown): unknown => {
    const plain = isReactive(current) ? toRaw(current) : current
    if (Array.isArray(plain)) return plain.map(unwrap)
    if (plain && typeof plain === 'object') {
      return Object.fromEntries(Object.entries(plain).map(([key, child]) => [key, unwrap(child)]))
    }
    return plain
  }
  return structuredClone(unwrap(value)) as T
}

export function validateStatusEffectRecord<Id extends string>(
  record: GameStatusEffectRecord<Id>,
): StatusEffectValidationResult<GameStatusEffectRecord<Id>> {
  const issues: StatusEffectValidationIssue[] = []
  if (!record || typeof record !== 'object') {
    return { ok: false, issues: [{ code: 'invalid-record', path: '' }] }
  }
  if (typeof record.id !== 'string' || !record.id.trim())
    issues.push({ code: 'missing-id', path: 'id' })
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
  const tooltip = record.definition
    ? validateSkillTooltipModel(record.definition)
    : { ok: false as const, issues: [] }
  if (!tooltip.ok)
    tooltip.issues.forEach((issue) =>
      issues.push({ code: 'invalid-tooltip', path: `definition.${issue.path}` }),
    )
  return issues.length ? { ok: false, issues } : { ok: true, value: cloneStatusEffect(record) }
}

export function validateStatusEffectSnapshot<Id extends string>(
  snapshot: GameStatusEffectSnapshot<Id>,
): StatusEffectValidationResult<GameStatusEffectSnapshot<Id>> {
  const issues: StatusEffectValidationIssue[] = []
  if (!snapshot || typeof snapshot !== 'object') {
    return { ok: false, issues: [{ code: 'invalid-snapshot', path: '' }] }
  }
  if (!Number.isInteger(snapshot.revision) || snapshot.revision < 0)
    issues.push({ code: 'invalid-revision', path: 'revision' })
  if (!Array.isArray(snapshot.effects)) {
    return { ok: false, issues: [{ code: 'invalid-effects', path: 'effects' }] }
  }
  const ids = new Set<Id>()
  const effects = snapshot.effects.map((record, index) => {
    const result = validateStatusEffectRecord(record)
    if (!result.ok)
      result.issues.forEach((issue) =>
        issues.push({ ...issue, path: `effects[${index}].${issue.path}` }),
      )
    if (result.ok && ids.has(record.id))
      issues.push({ code: 'duplicate-id', path: `effects[${index}].id` })
    if (result.ok) ids.add(record.id)
    return result.ok ? result.value : null
  })
  return issues.length
    ? { ok: false, issues }
    : {
        ok: true,
        value: { revision: snapshot.revision, effects: effects as GameStatusEffectRecord<Id>[] },
      }
}
