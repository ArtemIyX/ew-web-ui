import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import DebuffListWindowContent from './DebuffListWindowContent.vue'
import ToggleListWindowContent from './ToggleListWindowContent.vue'
import { useGameDebuffsStore } from '@/stores/gameDebuffs'
import { useGameTogglesStore } from '@/stores/gameToggles'

const TooltipStub = defineComponent({
  props: { model: { type: Object, required: true } },
  setup(_props, { slots }) {
    return () => h('div', slots.trigger?.({ triggerProps: {} }))
  },
})

function record(id: string) {
  return {
    debuffId: id,
    toggleId: id,
    definition: {
      skillId: `${id}-skill`,
      name: id,
      icon: { kind: 'local' as const, src: '/effect.svg' },
      level: 1,
    },
    appliedAtMs: 0,
    endsAtMs: null,
    order: 0,
  }
}

function definition(skillId: string) {
  return {
    skillId,
    name: skillId,
    icon: { kind: 'local' as const, src: '/effect.svg' },
    level: 1,
  }
}

describe('status-effect list windows', () => {
  it.each([
    ['debuff', DebuffListWindowContent, useGameDebuffsStore],
    ['toggle', ToggleListWindowContent, useGameTogglesStore],
  ] as const)('renders %s entries in the shared accessible list', (kind, component, useStore) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useStore(pinia)
    const replaceSnapshot = (value: unknown) =>
      (store as unknown as { replaceSnapshot: (snapshot: unknown) => boolean }).replaceSnapshot(
        value,
      )
    if (kind === 'debuff') replaceSnapshot({ revision: 1, debuffs: [record('slow')] })
    else replaceSnapshot({ revision: 1, toggles: [record('stance')] })
    const wrapper = mount(component, {
      global: {
        plugins: [pinia],
        stubs: { SkillTooltip: TooltipStub, GameStatusEffectVisual: true },
      },
    })

    expect(wrapper.find('[role="list"]').attributes('aria-label')).toBe(
      kind === 'debuff' ? '#DEBUFF_LIST_ARIA' : '#TOGGLE_LIST_ARIA',
    )
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(1)
    expect(wrapper.find('[data-ew-window-drag-handle]').attributes('aria-label')).toBe(
      kind === 'debuff' ? '#DEBUFF_LIST_DRAG' : '#TOGGLE_LIST_DRAG',
    )
  })

  it('keeps the shared list keyed by domain records and fixed to twelve columns', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useGameDebuffsStore(pinia)
    store.replaceSnapshot({
      revision: 1,
      debuffs: Array.from({ length: 13 }, (_, index) => ({
        debuffId: `debuff-${index}`,
        definition: definition(`skill-${index}`),
        appliedAtMs: index,
        endsAtMs: null,
        order: index,
      })),
    })
    const wrapper = mount(DebuffListWindowContent, {
      global: {
        plugins: [pinia],
        stubs: { SkillTooltip: TooltipStub, GameStatusEffectVisual: true },
      },
    })

    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(13)
    expect(wrapper.find('[data-effect-kind="debuff"]').exists()).toBe(true)
  })
})
