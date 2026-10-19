import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameSkillsStore } from './gameSkills'
import type { GameSkillSnapshot } from '@/views/game/types/gameSkills'

const snapshot: GameSkillSnapshot = {
  revision: 1,
  subcategories: [{ id: 'combat', group: 'active', label: 'Combat', order: 1 }],
  skills: [
    {
      definition: {
        skillId: 'strike',
        subcategoryId: 'combat',
        name: 'Strike',
        level: 1,
        icon: { kind: 'local', src: '/strike.svg' },
        flags: { toggleable: false, active: false, usable: true, passive: false },
      },
      runtime: { skillId: 'strike', usable: true, active: false, cooldown: null },
    },
  ],
}

describe('game skills store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('commits valid snapshots atomically and clones input', () => {
    const store = useGameSkillsStore()
    expect(store.replaceSnapshot(snapshot)).toBe(true)
    snapshot.skills[0]!.definition.name = 'Changed'
    expect(store.record('strike')?.definition.name).toBe('Strike')
  })
  it('rejects stale and malformed snapshots without partial mutation', () => {
    const store = useGameSkillsStore()
    expect(store.replaceSnapshot(snapshot)).toBe(true)
    expect(store.replaceSnapshot({ ...snapshot, revision: 0, subcategories: [] })).toBe(false)
    expect(store.record('strike')).toBeDefined()
    expect(
      store.replaceSnapshot({
        ...snapshot,
        revision: 2,
        skills: [
          {
            ...snapshot.skills[0]!,
            definition: { ...snapshot.skills[0]!.definition, subcategoryId: 'missing' },
          },
        ],
      }),
    ).toBe(false)
    expect(store.record('strike')).toBeDefined()
  })
  it('requires explicit options for destructive removal', () => {
    const store = useGameSkillsStore()
    store.replaceSnapshot(snapshot)
    store.bind(1, 'strike')
    expect(store.removeSkill('strike')).toBe(false)
    expect(store.removeSkill('strike', true)).toBe(true)
    expect(store.bindings[1]).toBeUndefined()
  })
})
