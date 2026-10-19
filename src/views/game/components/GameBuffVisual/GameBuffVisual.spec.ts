import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GameBuffVisual from './GameBuffVisual.vue'
import type { GameBuffRecord } from '@/views/game/types/gameBuffs'

const record: GameBuffRecord = {
  buffId: 'buff-1',
  definition: {
    skillId: 'skill-1',
    name: 'Sample buff',
    icon: { kind: 'local', src: '/buff.svg' },
    level: 3,
  },
  appliedAtMs: 1_000,
  endsAtMs: 61_000,
  order: 0,
}

describe('GameBuffVisual', () => {
  it('renders a non-actionable icon with a small countdown but no animation', async () => {
    const wrapper = mount(GameBuffVisual, {
      props: { record, nowMs: 1_000, debug: true },
      global: { stubs: { GIcon: true } },
    })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('.ew-buff-visual').classes()).not.toContain('is-cooling')
    expect(wrapper.find('.ew-shortcuts__cooldown').text()).toBe('60')
    expect(wrapper.find('.ew-shortcuts__cooldown').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ew-buff-visual__level').text()).toBe('3')
    expect(wrapper.find('.ew-buff-visual__skill-id').text()).toBe('skill-1')

    await wrapper.setProps({ nowMs: 31_000 })
    expect(wrapper.find('.ew-shortcuts__cooldown').text()).toBe('30')
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('does not show cooldown animation or number for permanent or expired buffs', async () => {
    const wrapper = mount(GameBuffVisual, {
      props: { record: { ...record, endsAtMs: null }, nowMs: 1_000 },
      global: { stubs: { GIcon: true } },
    })
    expect(wrapper.find('.ew-shortcuts__cooldown').exists()).toBe(false)
    await wrapper.setProps({ record: { ...record, endsAtMs: 1_000 }, nowMs: 1_000 })
    expect(wrapper.find('.ew-shortcuts__cooldown').exists()).toBe(false)
  })
})
