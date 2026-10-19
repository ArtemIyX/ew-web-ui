import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import SkillTooltip from './SkillTooltip.vue'
import type { SkillTooltipModel } from '../../types/skills'

const model: SkillTooltipModel = { skillId: '1001', name: 'Sample skill' }

describe('SkillTooltip', () => {
  it('forwards the trigger scope and emits skill-aware lifecycle events', async () => {
    const wrapper = mount(SkillTooltip, {
      props: { model },
      slots: {
        trigger: ({ triggerProps }: { triggerProps: Record<string, unknown> }) =>
          h('button', { type: 'button', ...triggerProps }, 'Skill'),
      },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
    await wrapper.find('button').trigger('focusin')
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('.ew-skill-tooltip')?.textContent).toContain('Sample skill')
    expect(wrapper.emitted('open')).toEqual([['1001']])
  })
})
