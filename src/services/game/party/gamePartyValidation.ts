import { isReactive, toRaw } from 'vue'
import { validateStatusEffectRecord } from '@/services/game/statusEffects/gameStatusEffectValidation'
import type {
  GamePartySnapshot,
  PartyMemberSnapshot,
} from '@/views/game/types/gameParty'
import type { IconSource } from '@/shared/types/components'

export interface GamePartyValidationIssue {
  code:
    | 'invalid-snapshot'
    | 'invalid-revision'
    | 'too-many-members'
    | 'duplicate-member-id'
    | 'duplicate-order'
    | 'multiple-leaders'
    | 'invalid-member-id'
    | 'invalid-name'
    | 'invalid-level'
    | 'invalid-class-id'
    | 'invalid-class-icon'
    | 'invalid-life-state'
    | 'invalid-resource'
    | 'duplicate-effect-id'
    | 'invalid-effect'
  path: string
}

export type GamePartyValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: readonly GamePartyValidationIssue[] }

function cloneValue<T>(value: T): T {
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

function isIconSource(value: unknown): value is IconSource {
  if (!value || typeof value !== 'object') return false
  const source = value as Record<string, unknown>
  return (
    (source.kind === 'local' && typeof source.src === 'string' && source.src.trim().length > 0) ||
    (source.kind === 'server' &&
      typeof source.resourceId === 'string' &&
      source.resourceId.trim().length > 0)
  )
}

function validateResource(value: unknown, path: string, issues: GamePartyValidationIssue[]): void {
  if (!value || typeof value !== 'object') {
    issues.push({ code: 'invalid-resource', path })
    return
  }
  const resource = value as Record<string, unknown>
  if (!Number.isFinite(resource.current) || !Number.isFinite(resource.maximum)) {
    issues.push({ code: 'invalid-resource', path })
  }
  if (typeof resource.maximum === 'number' && resource.maximum < 0) {
    issues.push({ code: 'invalid-resource', path: `${path}.maximum` })
  }
}

function validateEffects(
  effects: unknown,
  path: string,
  issues: GamePartyValidationIssue[],
): void {
  if (!Array.isArray(effects)) {
    issues.push({ code: 'invalid-effect', path })
    return
  }
  const ids = new Set<string>()
  effects.forEach((effect, index) => {
    let result: ReturnType<typeof validateStatusEffectRecord>
    try {
      result = validateStatusEffectRecord(effect as never)
    } catch {
      issues.push({ code: 'invalid-effect', path: `${path}[${index}]` })
      return
    }
    if (!result.ok) {
      issues.push({ code: 'invalid-effect', path: `${path}[${index}]` })
      return
    }
    if (ids.has(result.value.id)) {
      issues.push({ code: 'duplicate-effect-id', path: `${path}[${index}].id` })
    }
    ids.add(result.value.id)
  })
}

function validateMember(
  member: unknown,
  index: number,
  issues: GamePartyValidationIssue[],
): member is PartyMemberSnapshot {
  if (!member || typeof member !== 'object') {
    issues.push({ code: 'invalid-snapshot', path: `members[${index}]` })
    return false
  }
  const value = member as Record<string, unknown>
  const path = `members[${index}]`
  if (typeof value.memberId !== 'string' || !value.memberId.trim())
    issues.push({ code: 'invalid-member-id', path: `${path}.memberId` })
  if (!Number.isInteger(value.order) || (value.order as number) < 0)
    issues.push({ code: 'duplicate-order', path: `${path}.order` })
  if (typeof value.characterName !== 'string' || !value.characterName.trim())
    issues.push({ code: 'invalid-name', path: `${path}.characterName` })
  if (!Number.isInteger(value.level) || (value.level as number) <= 0)
    issues.push({ code: 'invalid-level', path: `${path}.level` })
  if (typeof value.classId !== 'string' || !value.classId.trim())
    issues.push({ code: 'invalid-class-id', path: `${path}.classId` })
  if (!isIconSource(value.classIcon))
    issues.push({ code: 'invalid-class-icon', path: `${path}.classIcon` })
  if (value.lifeState !== 'alive' && value.lifeState !== 'dead')
    issues.push({ code: 'invalid-life-state', path: `${path}.lifeState` })
  const resources = value.resources as Record<string, unknown> | undefined
  validateResource(resources?.hp, `${path}.resources.hp`, issues)
  validateResource(resources?.mp, `${path}.resources.mp`, issues)
  validateResource(resources?.energy, `${path}.resources.energy`, issues)
  validateEffects(value.buffs, `${path}.buffs`, issues)
  validateEffects(value.debuffs, `${path}.debuffs`, issues)
  return true
}

export function cloneGamePartySnapshot(snapshot: GamePartySnapshot): GamePartySnapshot {
  return cloneValue(snapshot)
}

export function validateGamePartySnapshot(
  snapshot: GamePartySnapshot,
): GamePartyValidationResult<GamePartySnapshot> {
  const issues: GamePartyValidationIssue[] = []
  if (!snapshot || typeof snapshot !== 'object') {
    return { ok: false, issues: [{ code: 'invalid-snapshot', path: '' }] }
  }
  if (!Number.isInteger(snapshot.revision) || snapshot.revision < 0) {
    issues.push({ code: 'invalid-revision', path: 'revision' })
  }
  if (!Array.isArray(snapshot.members)) {
    return { ok: false, issues: [{ code: 'invalid-snapshot', path: 'members' }] }
  }
  if (snapshot.members.length > 5) {
    issues.push({ code: 'too-many-members', path: 'members' })
  }
  const memberIds = new Set<string>()
  const orders = new Set<number>()
  let leaderCount = 0
  snapshot.members.forEach((member, index) => {
    validateMember(member, index, issues)
    if (typeof member.memberId === 'string') {
      if (memberIds.has(member.memberId))
        issues.push({ code: 'duplicate-member-id', path: `members[${index}].memberId` })
      memberIds.add(member.memberId)
    }
    if (Number.isInteger(member.order)) {
      if (orders.has(member.order))
        issues.push({ code: 'duplicate-order', path: `members[${index}].order` })
      orders.add(member.order)
    }
    if (member.isLeader === true) leaderCount += 1
  })
  if (leaderCount > 1) issues.push({ code: 'multiple-leaders', path: 'members' })
  return issues.length
    ? { ok: false, issues }
    : { ok: true, value: cloneGamePartySnapshot(snapshot) }
}

export function validatePartyMember(
  member: PartyMemberSnapshot,
): GamePartyValidationResult<PartyMemberSnapshot> {
  const result = validateGamePartySnapshot({ revision: 0, members: [member] })
  return result.ok
    ? { ok: true, value: result.value.members[0]! }
    : { ok: false, issues: result.issues }
}
