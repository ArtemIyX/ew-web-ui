import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import BuffListWindowContent from './BuffListWindowContent.vue'
import { useGameBuffsStore } from '@/stores/gameBuffs'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import type { GameBuffRecord } from '@/views/game/types/gameBuffs'

const TooltipStub = defineComponent({
  props: { model: { type: Object, required: true }, showDebugMetadata: Boolean },
  setup(_props, { slots }) {
    return () => h('div', { class: 'skill-tooltip-stub' }, slots.trigger?.({ triggerProps: {} }))
  },
})

function buff(index: number, endsAtMs: number | null = null): GameBuffRecord {
  return {
    buffId: `buff-${index}`,
    definition: {
      skillId: `skill-${index}`,
      name: `Buff ${index}`,
      icon: { kind: 'local', src: '/buff.svg' },
      level: 1,
    },
    appliedAtMs: index,
    endsAtMs,
    order: index,
  }
}

describe('BuffListWindowContent', () => {
  it('uses a fixed twelve-column list and forwards debug metadata without actions', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const buffs = useGameBuffsStore(pinia)
    const shortcuts = useGameShortcutsStore(pinia)
    buffs.replaceSnapshot({ revision: 1, buffs: Array.from({ length: 13 }, (_, i) => buff(i + 1)) })
    shortcuts.setDebugMetadataVisible(true)

    const wrapper = mount(BuffListWindowContent, {
      global: {
        plugins: [pinia],
        stubs: { SkillTooltip: TooltipStub, GameBuffVisual: true },
      },
    })

    expect(wrapper.find('.ew-buff-list__grid').attributes('role')).toBe('list')
    expect(wrapper.findAll('.ew-buff-list__item')).toHaveLength(13)
    expect(wrapper.findAllComponents(TooltipStub)[0]?.props('showDebugMetadata')).toBe(true)
    expect(wrapper.find('.ew-buff-list__grid').attributes('style')).toBeUndefined()
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('.ew-buff-list__drag-handle').attributes('aria-label')).toBe(
      '#BUFF_LIST_DRAG',
    )
    await wrapper.unmount()
  })
})
