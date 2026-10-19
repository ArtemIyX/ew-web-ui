import { h, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SkillTooltip from './SkillTooltip.vue'
import type { SkillTooltipModel } from '../../types/skills'

const sampleModel: SkillTooltipModel = {
  skillId: 'harness-skill',
  name: 'Development harness skill',
  description: 'Sample content used only to exercise shared surfaces.',
  facts: [{ key: 'range', label: 'Range', value: { kind: 'number', value: 600 } }],
  upgrades: [{ key: 'next', text: 'Sample next-rank outcome.' }],
}

function tooltipTrigger() {
  return ({ triggerProps }: { triggerProps: Record<string, unknown> }) =>
    h('button', { type: 'button', ...triggerProps }, 'Skill')
}

const SkillTooltipHarness = defineComponent({
  setup() {
    return () =>
      h('div', [
        h(
          'div',
          { class: 'harness-shortcut' },
          h(SkillTooltip, { model: sampleModel }, { trigger: tooltipTrigger() }),
        ),
        h(
          'div',
          { class: 'harness-buff-row' },
          h(SkillTooltip, { model: sampleModel }, { trigger: tooltipTrigger() }),
        ),
        h(
          'div',
          { class: 'harness-scroll-list' },
          h(SkillTooltip, { model: sampleModel }, { trigger: tooltipTrigger() }),
        ),
        h(
          'div',
          { class: 'harness-learning-tree' },
          h(SkillTooltip, { model: sampleModel }, { trigger: tooltipTrigger() }),
        ),
      ])
  },
})

describe('SkillTooltip development harness', () => {
  it('mounts the same public model API across game surfaces', () => {
    const wrapper = mount(SkillTooltipHarness, { attachTo: document.body })
    expect(wrapper.findAll('button')).toHaveLength(4)
    expect(wrapper.findAll('.ew-tooltip')).toHaveLength(4)
    wrapper.unmount()
  })
})
