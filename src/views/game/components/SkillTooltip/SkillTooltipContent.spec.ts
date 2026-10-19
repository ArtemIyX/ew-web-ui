import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SkillTooltipContent from './SkillTooltipContent.vue'
import type { SkillTooltipModel } from '../../types/skills'

const model: SkillTooltipModel = {
  skillId: '4001',
  name: 'Sample Strike',
  level: 2,
  type: 'Active',
  description: '<safe text>',
  facts: [
    { key: 'target', label: 'Target', value: { kind: 'text', content: 'Single enemy' } },
    { key: 'hidden', label: 'Hidden', hidden: true, value: { kind: 'text', content: 'Nope' } },
  ],
  upgrades: [{ key: 'next', text: 'Increases damage at the next rank.' }],
}

describe('SkillTooltipContent', () => {
  it('renders identity, details, and upgrades in order', () => {
    const wrapper = mount(SkillTooltipContent, { props: { model, showDebugMetadata: true } })
    expect(wrapper.find('article').text()).toContain('Sample Strike')
    expect(wrapper.text()).toContain('#SKILL_LEVEL 2')
    expect(wrapper.text()).toContain('#SKILL_ID: 4001')
    expect(wrapper.findAll('dt')).toHaveLength(1)
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.find('.ew-skill-tooltip__upgrade-icon').exists()).toBe(true)
    expect(wrapper.find('article').text().indexOf('Sample Strike')).toBeLessThan(
      wrapper.text().indexOf('Target'),
    )
  })

  it('does not interpret HTML-looking text or render empty sections', () => {
    const wrapper = mount(SkillTooltipContent, {
      props: { model: { skillId: '1', name: '<Name>' } },
    })
    expect(wrapper.find('article').text()).toContain('<Name>')
    expect(wrapper.find('.ew-skill-tooltip__details').exists()).toBe(false)
    expect(wrapper.find('.ew-skill-tooltip__upgrades').exists()).toBe(false)
  })
})
