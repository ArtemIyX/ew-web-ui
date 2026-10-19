import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { createSamplePlayerTarget, createSampleStructureTarget, createSampleTargetEffect } from '@/views/game/types/gameTargetStatusFixtures'
import TargetStatusWindowContent from './TargetStatusWindowContent.vue'

describe('TargetStatusWindowContent', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders player portrait and independently optional affiliations', () => {
    const store = useGameTargetStatusStore()
    store.replaceSnapshot({ revision: 1, target: createSamplePlayerTarget() })
    const wrapper = mount(TargetStatusWindowContent)
    expect(wrapper.find('.ew-target-status__portrait').exists()).toBe(true)
    expect(wrapper.findAll('.ew-target-affiliation-badge')).toHaveLength(2)
    expect(wrapper.find('.ew-target-marker--ally').exists()).toBe(true)
    expect(wrapper.find('.ew-game-health-bar').exists()).toBe(true)
  })

  it('omits player-only content and wraps effects at twelve columns', () => {
    const store = useGameTargetStatusStore()
    store.replaceSnapshot({
      revision: 1,
      target: createSampleStructureTarget({
        buffs: Array.from({ length: 13 }, (_, index) => createSampleTargetEffect(index + 1)),
      }),
    })
    const wrapper = mount(TargetStatusWindowContent)
    expect(wrapper.find('.ew-target-status__portrait').exists()).toBe(false)
    expect(wrapper.findAll('.ew-target-affiliation-badge')).toHaveLength(0)
    expect(wrapper.find('[data-effect-kind="buff"]')?.findAll('[role="listitem"]')).toHaveLength(13)
    expect(wrapper.find('.ew-target-marker--world-structure').exists()).toBe(true)
  })
})
