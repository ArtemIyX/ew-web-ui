import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createGamePartySnapshot, createPartyMember } from '@/views/game/types/gamePartyFixtures'
import { useGamePartyStore } from './gameParty'

describe('useGamePartyStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sorts members and exposes display state', () => {
    const store = useGamePartyStore()
    store.replaceSnapshot({
      revision: 2,
      members: [
        createPartyMember({ memberId: 'z', order: 2 }),
        createPartyMember({ memberId: 'a', order: 1 }),
      ],
    })
    expect(store.members.map((member) => member.memberId)).toEqual(['a', 'z'])
    expect(store.memberCount).toBe(2)
    expect(store.hasDisplayableParty).toBe(true)
  })

  it('ignores stale events and resists invalid upserts', () => {
    const store = useGamePartyStore()
    store.replaceSnapshot(createGamePartySnapshot({ revision: 4 }))
    expect(
      store.applyRuntimeEvent({
        kind: 'upsert-member',
        revision: 5,
        member: createPartyMember({ memberId: 'third', order: 2, isLeader: true }),
      }),
    ).toBe('ignored')
    expect(store.memberCount).toBe(2)
    expect(store.applyRuntimeEvent({ kind: 'clear', revision: 3 })).toBe('ignored')
    expect(store.memberCount).toBe(2)
  })

  it('marks revision gaps stale and keeps nested effects isolated', () => {
    const store = useGamePartyStore()
    const first = createPartyMember({ memberId: 'first', order: 0 })
    const second = createPartyMember({ memberId: 'second', order: 1 })
    store.replaceSnapshot({ revision: 1, members: [first, second] })
    expect(store.applyRuntimeEvent({ kind: 'clear', revision: 3 })).toBe('needs-resync')
    expect(store.status).toBe('stale')
    expect(store.memberById('first')).toEqual(first)
  })
})
