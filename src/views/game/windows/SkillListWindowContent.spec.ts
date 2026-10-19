import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import SkillListWindowContent from './SkillListWindowContent.vue'
import { useGameSkillsStore } from '@/stores/gameSkills'
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
describe('SkillListWindowContent', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('renders localized group tabs and runtime skill sections', () => {
    useGameSkillsStore().replaceSnapshot(snapshot)
    const wrapper = mount(SkillListWindowContent)
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3)
    expect(wrapper.find('[role="tabpanel"]').text()).toContain('Combat')
    expect(wrapper.findAll('.ew-skill-list__skill')).toHaveLength(1)
  })
  it('changes group panels without changing catalog identity', async () => {
    const store = useGameSkillsStore()
    store.replaceSnapshot(snapshot)
    const wrapper = mount(SkillListWindowContent)
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.find('[role="tabpanel"]').text()).toContain('#SKILL_LIST_EMPTY')
    expect(store.record('strike')?.definition.skillId).toBe('strike')
  })
  it('keeps blocked catalog skills visible and interactive', () => {
    const store = useGameSkillsStore()
    store.replaceSnapshot({
      ...snapshot,
      skills: [
        {
          ...snapshot.skills[0]!,
          runtime: { ...snapshot.skills[0]!.runtime, usable: false, blocked: true },
        },
      ],
    })
    const wrapper = mount(SkillListWindowContent)
    const skill = wrapper.get('.ew-skill-list__skill')
    expect(skill.attributes('disabled')).toBeUndefined()
    expect(skill.find('.is-blocked').exists()).toBe(false)
  })
})
