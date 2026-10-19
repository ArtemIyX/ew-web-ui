import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GameSkillVisual from './GameSkillVisual.vue'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'

const record: GameSkillRecord = {
  definition: {
    skillId: 'strike',
    subcategoryId: 'combat',
    name: 'Strike',
    level: 1,
    icon: { kind: 'local', src: '/strike.svg' },
    flags: { toggleable: true, active: false, usable: true, passive: false },
  },
  runtime: { skillId: 'strike', usable: true, active: false, cooldown: null },
}
describe('GameSkillVisual', () => {
  it('renders compact icon visuals and optional debug metadata', async () => {
    const wrapper = mount(GameSkillVisual, { props: { record } })
    expect(wrapper.find('.ew-skill-visual').classes()).not.toContain('is-blocked')
    expect(wrapper.find('.ew-skill-visual__name').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'GIcon' }).exists()).toBe(true)
    await wrapper.setProps({ debug: true })
    expect(wrapper.find('.ew-shortcuts__level').text()).toBe('1')
    expect(wrapper.find('.ew-shortcuts__debug').text()).toBe('strike')
    await wrapper.setProps({
      record: {
        ...record,
        runtime: { ...record.runtime, active: true, blocked: true },
      },
    })
    expect(wrapper.find('.ew-shortcuts__active').exists()).toBe(true)
    expect(wrapper.find('.ew-skill-visual').classes()).toContain('is-blocked')
  })
})
