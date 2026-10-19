import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createGameSkillApi } from './gameSkillService'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'

const skill: GameSkillRecord = {
  definition: {
    skillId: 'strike',
    subcategoryId: 'combat',
    name: 'Strike',
    level: 1,
    icon: { kind: 'local', src: '/strike.svg' },
    flags: { toggleable: false, active: false, usable: true, passive: false },
  },
  runtime: { skillId: 'strike', usable: true, active: false, cooldown: null },
}
describe('game skill developer api', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('rejects invalid batch records before changing the catalog', () => {
    const api = createGameSkillApi()
    api.upsertSubcategory({ id: 'combat', group: 'active', label: 'Combat', order: 1 })
    const result = api.upsertSkills([
      skill,
      { ...skill, definition: { ...skill.definition, skillId: '' } },
    ])
    expect(result).toMatchObject({ ok: false, error: 'duplicate-id' })
    expect(api.getSkill('strike')).toBeNull()
  })
  it('exposes defensive snapshots and stable ordering queries', () => {
    const api = createGameSkillApi()
    api.upsertSubcategory({ id: 'combat', group: 'active', label: 'Combat', order: 1 })
    api.upsertSkill(skill)
    const snapshot = api.getSnapshot()
    snapshot.skills[0]!.definition.name = 'Mutated'
    expect(api.getSkill('strike')?.definition.name).toBe('Strike')
    expect(api.listSkills('combat')).toHaveLength(1)
  })
})
