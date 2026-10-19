import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerResourceBar from './PlayerResourceBar.vue'

describe('PlayerResourceBar', () => {
  it('clamps display and toggles through keyboard-compatible button activation', async () => {
    const wrapper = mount(PlayerResourceBar, {
      props: {
        kind: 'hp',
        value: { current: 120, maximum: 100 },
        mode: 'exact',
        label: 'Health',
        tone: 'hp',
      },
    })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.find('.ew-progress--angled').exists()).toBe(true)
    expect(wrapper.text()).toContain('100 / 100')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
