import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import PlayerAbilityCastWindowContent from './PlayerAbilityCastWindowContent.vue'
import { usePlayerAbilityCastStore } from '@/stores/playerAbilityCast'

describe('PlayerAbilityCastWindowContent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    usePlayerAbilityCastStore().dispose()
    vi.useRealTimers()
  })

  it('stays empty while idle and renders the shared cast bar while casting', async () => {
    const store = usePlayerAbilityCastStore()
    const wrapper = mount(PlayerAbilityCastWindowContent)
    expect(wrapper.find('.ew-cast-bar').exists()).toBe(false)

    const nowMs = Date.now()
    store.replaceCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      startedAtMs: nowMs,
      endsAtMs: nowMs + 4000,
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('.ew-cast-bar__heading').text()).toBe('Sample Ability')
    expect(wrapper.get('.ew-cast-bar').attributes('data-ew-window-no-drag')).toBeUndefined()
    await wrapper.unmount()
  })
})
