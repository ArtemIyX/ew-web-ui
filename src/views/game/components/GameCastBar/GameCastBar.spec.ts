import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GameCastBar from './GameCastBar.vue'

describe('GameCastBar', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => vi.useRealTimers())

  it('renders the ability above a purple cast meter with remaining time', async () => {
    const nowMs = Date.now()
    const wrapper = mount(GameCastBar, { props: { cast: { castId: 'cast-1', abilityId: 'ability-1', abilityName: 'Sample Ability', startedAtMs: nowMs, endsAtMs: nowMs + 1200 } } })
    expect(wrapper.find('.ew-cast-bar__heading').text()).toBe('Sample Ability')
    expect(wrapper.find('.ew-progress[data-tone="cast"]').exists()).toBe(true)
    expect(wrapper.find('.ew-cast-bar__remaining').text()).toBe('1.2s')
    await wrapper.unmount()
  })

  it('hides after completion and does not keep the clock consumer alive', async () => {
    const nowMs = Date.now()
    const wrapper = mount(GameCastBar, { props: { cast: { castId: 'cast-1', abilityId: 'ability-1', abilityName: 'Sample Ability', startedAtMs: nowMs, endsAtMs: nowMs + 100 } } })
    await vi.advanceTimersByTimeAsync(100)
    await nextTick()
    expect(wrapper.find('.ew-cast-bar').exists()).toBe(false)
    await wrapper.unmount()
  })

  it('freezes and dims an interrupted cast before removing it', async () => {
    const nowMs = Date.now()
    const wrapper = mount(GameCastBar, {
      props: {
        cast: {
          castId: 'cast-1',
          abilityId: 'ability-1',
          abilityName: 'Sample Ability',
          startedAtMs: nowMs,
          endsAtMs: nowMs + 5000,
        },
      },
    })

    await wrapper.setProps({ cast: null })
    expect(wrapper.find('.ew-cast-bar--interrupted').exists()).toBe(true)
    expect(wrapper.find('.ew-progress__fill').exists()).toBe(true)

    await vi.advanceTimersByTimeAsync(500)
    await nextTick()
    expect(wrapper.find('.ew-cast-bar').exists()).toBe(false)
    await wrapper.unmount()
  })

  it('freezes progress while paused', async () => {
    const nowMs = Date.now()
    const wrapper = mount(GameCastBar, {
      props: {
        cast: {
          castId: 'cast-1',
          abilityId: 'ability-1',
          abilityName: 'Sample Ability',
          startedAtMs: nowMs,
          endsAtMs: nowMs + 4000,
        },
        pausedAtMs: nowMs + 1000,
      },
    })

    expect(wrapper.get('.ew-progress__meter').attributes('aria-valuenow')).toBe('25')
    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.get('.ew-progress__meter').attributes('aria-valuenow')).toBe('25')
    await wrapper.unmount()
  })

  it('uses a restrained cancellation exit', async () => {
    const nowMs = Date.now()
    const cast = {
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      startedAtMs: nowMs,
      endsAtMs: nowMs + 4000,
    }
    const wrapper = mount(GameCastBar, { props: { cast } })

    await wrapper.setProps({ terminationReason: 'cancelled', cast: null })
    expect(wrapper.find('.ew-cast-bar--cancelled').exists()).toBe(true)
    expect(wrapper.find('.ew-cast-bar--interrupted').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(240)
    expect(wrapper.find('.ew-cast-bar').exists()).toBe(false)
    await wrapper.unmount()
  })

  it('shows completed progress before a finished cast exits', async () => {
    const nowMs = Date.now()
    const cast = {
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      startedAtMs: nowMs,
      endsAtMs: nowMs + 4000,
    }
    const wrapper = mount(GameCastBar, { props: { cast } })

    await wrapper.setProps({ terminationReason: 'finished', cast: null })
    expect(wrapper.find('.ew-cast-bar--finished').exists()).toBe(true)
    expect(wrapper.get('.ew-progress__meter').attributes('aria-valuenow')).toBe('100')
    await wrapper.unmount()
  })
})
