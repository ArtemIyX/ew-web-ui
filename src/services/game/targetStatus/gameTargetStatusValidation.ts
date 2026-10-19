import { isReactive, toRaw } from 'vue'
import { validateStatusEffectRecord } from '@/services/game/statusEffects/gameStatusEffectValidation'
import type { IconSource, TextContent } from '@/shared/types/components'
import type { SelectedTargetSnapshot, GameTargetStatusSnapshot } from '@/views/game/types/gameTargetStatus'

export type TargetStatusValidationCode =
  | 'invalid-snapshot' | 'invalid-revision' | 'invalid-target-id' | 'invalid-entity-kind'
  | 'invalid-marker' | 'invalid-display-name' | 'invalid-level' | 'invalid-icon'
  | 'invalid-affiliation' | 'player-only-field' | 'invalid-resource' | 'duplicate-effect-id'
  | 'invalid-effect' | 'invalid-cast-id' | 'invalid-ability-id' | 'invalid-ability-name'
  | 'invalid-cast-time'
export interface TargetStatusValidationIssue { code: TargetStatusValidationCode; path: string }
export type TargetStatusValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: readonly TargetStatusValidationIssue[] }

function cloneValue<T>(value: T): T {
  const unwrap = (current: unknown): unknown => {
    const plain = isReactive(current) ? toRaw(current) : current
    if (Array.isArray(plain)) return plain.map(unwrap)
    if (plain && typeof plain === 'object') return Object.fromEntries(Object.entries(plain).map(([key, child]) => [key, unwrap(child)]))
    return plain
  }
  return structuredClone(unwrap(value)) as T
}
function isIcon(value: unknown): value is IconSource {
  if (!value || typeof value !== 'object') return false
  const source = value as Record<string, unknown>
  return (source.kind === 'local' && typeof source.src === 'string' && source.src.trim() !== '') ||
    (source.kind === 'server' && typeof source.resourceId === 'string' && source.resourceId.trim() !== '')
}
function isText(value: unknown): value is TextContent {
  if (typeof value === 'string') return value.trim() !== ''
  if (!value || typeof value !== 'object') return false
  const localized = value as Record<string, unknown>
  return typeof localized.table === 'string' && localized.table.trim() !== '' && typeof localized.textKey === 'string' && localized.textKey.trim() !== ''
}
function validateEffects(effects: unknown, path: string, issues: TargetStatusValidationIssue[]): void {
  if (!Array.isArray(effects)) { issues.push({ code: 'invalid-effect', path }); return }
  const ids = new Set<string>()
  effects.forEach((effect, index) => {
    const result = validateStatusEffectRecord(effect as never)
    if (!result.ok) issues.push({ code: 'invalid-effect', path: `${path}[${index}]` })
    else if (ids.has(result.value.id)) issues.push({ code: 'duplicate-effect-id', path: `${path}[${index}].id` })
    else ids.add(result.value.id)
  })
}
function validateAffiliation(value: unknown, path: string, issues: TargetStatusValidationIssue[]): void {
  if (value === null) return
  if (!value || typeof value !== 'object') { issues.push({ code: 'invalid-affiliation', path }); return }
  const affiliation = value as Record<string, unknown>
  if (typeof affiliation.affiliationId !== 'string' || affiliation.affiliationId.trim() === '') issues.push({ code: 'invalid-affiliation', path: `${path}.affiliationId` })
  if (!isText(affiliation.name)) issues.push({ code: 'invalid-affiliation', path: `${path}.name` })
  if (!isIcon(affiliation.icon)) issues.push({ code: 'invalid-icon', path: `${path}.icon` })
}
export function cloneGameTargetStatusSnapshot(snapshot: GameTargetStatusSnapshot): GameTargetStatusSnapshot { return cloneValue(snapshot) }
export function validateGameTargetStatusSnapshot(snapshot: GameTargetStatusSnapshot): TargetStatusValidationResult<GameTargetStatusSnapshot> {
  const issues: TargetStatusValidationIssue[] = []
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, issues: [{ code: 'invalid-snapshot', path: '' }] }
  if (!Number.isInteger(snapshot.revision) || snapshot.revision < 0) issues.push({ code: 'invalid-revision', path: 'revision' })
  if (snapshot.target !== null) validateTarget(snapshot.target, 'target', issues)
  return issues.length ? { ok: false, issues } : { ok: true, value: cloneGameTargetStatusSnapshot(snapshot) }
}
export function validateTarget(target: SelectedTargetSnapshot, path = 'target', issues: TargetStatusValidationIssue[] = []): TargetStatusValidationResult<SelectedTargetSnapshot> {
  if (!target || typeof target !== 'object') return { ok: false, issues: [{ code: 'invalid-snapshot', path }] }
  const value = target as unknown as Record<string, unknown>
  if (typeof target.targetId !== 'string' || !target.targetId.trim()) issues.push({ code: 'invalid-target-id', path: `${path}.targetId` })
  const kinds = ['player', 'world-structure', 'monster', 'boss'] as const
  const markers = ['world-structure', 'ally', 'enemy', 'monster', 'boss'] as const
  if (!kinds.includes(target.entityKind)) issues.push({ code: 'invalid-entity-kind', path: `${path}.entityKind` })
  if (!markers.includes(target.marker)) issues.push({ code: 'invalid-marker', path: `${path}.marker` })
  const validPair = target.entityKind === 'player' ? target.marker === 'ally' || target.marker === 'enemy' : target.marker === target.entityKind
  if (!validPair) issues.push({ code: 'invalid-marker', path: `${path}.marker` })
  if (typeof target.displayName !== 'string' || !target.displayName.trim()) issues.push({ code: 'invalid-display-name', path: `${path}.displayName` })
  if (!Number.isInteger(target.level) || target.level <= 0) issues.push({ code: 'invalid-level', path: `${path}.level` })
  if (target.portrait !== null && !isIcon(target.portrait)) issues.push({ code: 'invalid-icon', path: `${path}.portrait` })
  validateAffiliation(target.guild, `${path}.guild`, issues); validateAffiliation(target.order, `${path}.order`, issues)
  if (target.entityKind !== 'player' && (target.portrait !== null || target.guild !== null || target.order !== null)) issues.push({ code: 'player-only-field', path })
  if (!target.hp || !Number.isFinite(target.hp.current) || !Number.isFinite(target.hp.maximum) || target.hp.current < 0 || target.hp.maximum < 0) issues.push({ code: 'invalid-resource', path: `${path}.hp` })
  validateEffects(value.buffs, `${path}.buffs`, issues); validateEffects(value.debuffs, `${path}.debuffs`, issues)
  if (target.activeCast !== null) {
    if (!target.activeCast || typeof target.activeCast !== 'object') issues.push({ code: 'invalid-cast-time', path: `${path}.activeCast` })
    else {
      const cast = target.activeCast as unknown as Record<string, unknown>
      if (typeof cast.castId !== 'string' || !cast.castId.trim()) issues.push({ code: 'invalid-cast-id', path: `${path}.activeCast.castId` })
      if (typeof cast.abilityId !== 'string' || !cast.abilityId.trim()) issues.push({ code: 'invalid-ability-id', path: `${path}.activeCast.abilityId` })
      if (!isText(cast.abilityName)) issues.push({ code: 'invalid-ability-name', path: `${path}.activeCast.abilityName` })
      if (!Number.isFinite(cast.startedAtMs) || !Number.isFinite(cast.endsAtMs) || (cast.endsAtMs as number) <= (cast.startedAtMs as number)) issues.push({ code: 'invalid-cast-time', path: `${path}.activeCast` })
    }
  }
  return issues.length ? { ok: false, issues } : { ok: true, value: cloneValue(target) }
}
