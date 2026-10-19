import { describe, expect, it } from 'vitest'
import { createGamePartySnapshot, createPartyMember } from '@/views/game/types/gamePartyFixtures'
import { validateGamePartySnapshot } from './gamePartyValidation'

describe('validateGamePartySnapshot', () => {
  it.each([0, 1, 2, 5])('accepts a roster with %i members', (count) => {
    const members = Array.from({ length: count }, (_, index) =>
      createPartyMember({
        memberId: `member-${index}`,
        order: index,
        characterName: `Sample Member ${index}`,
        isLeader: index === 0 && count > 0,
      }),
    )
    expect(validateGamePartySnapshot({ revision: 1, members }).ok).toBe(true)
  })

  it('rejects more than five members atomically', () => {
    const snapshot = createGamePartySnapshot({
      members: Array.from({ length: 6 }, (_, index) =>
        createPartyMember({ memberId: `member-${index}`, order: index }),
      ),
    })
    const result = validateGamePartySnapshot(snapshot)
    expect(result.ok).toBe(false)
    expect(result.ok ? [] : result.issues).toContainEqual({
      code: 'too-many-members',
      path: 'members',
    })
  })

  it('rejects duplicate identities, orders, and leaders', () => {
    const members = [
      createPartyMember({ memberId: 'same', order: 1, isLeader: true }),
      createPartyMember({ memberId: 'same', order: 1, isLeader: true }),
    ]
    const result = validateGamePartySnapshot({ revision: 1, members })
    expect(result.ok).toBe(false)
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['duplicate-member-id', 'duplicate-order', 'multiple-leaders']),
    )
  })

  it('returns a defensive clone', () => {
    const snapshot = createGamePartySnapshot()
    const result = validateGamePartySnapshot(snapshot)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    result.value.members[0]!.resources.hp.current = 1
    expect(snapshot.members[0]!.resources.hp.current).not.toBe(1)
  })
})
