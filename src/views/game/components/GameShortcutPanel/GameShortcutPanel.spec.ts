import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import GameShortcutPanel from './GameShortcutPanel.vue'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import type { SkillShortcut } from '../../types/shortcuts'

const skill: SkillShortcut = {
  kind: 'skill',
  skillId: '1001',
  level: 1,
  name: 'Sample skill',
  icon: { kind: 'local', src: '/sample.svg' },
  flags: { toggleable: false, active: false, usable: true, passive: false },
  cooldown: null,
}

function pointerEvent(type: string, clientX: number, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: 1 },
  })
  return event
}

describe('GameShortcutPanel', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('renders eight bottom slots and expands upward', async () => {
    const wrapper = mount(GameShortcutPanel)
    expect(wrapper.findAll('.ew-shortcuts__slot')).toHaveLength(8)
    await wrapper.get('[aria-label="#SHORTCUT_ROWS_EXPAND"]').trigger('click')
    expect(wrapper.findAll('.ew-shortcuts__slot')).toHaveLength(16)
    expect(wrapper.findAll('.ew-shortcuts__number').map((node) => node.text())).toContain('9')
  })
  it('clears a dragged shortcut when released outside the panel', async () => {
    const store = useGameShortcutsStore()
    store.assignSkill(1, skill)
    const wrapper = mount(GameShortcutPanel)
    const slot = wrapper.get('#shortcut-1')
    slot.element.dispatchEvent(pointerEvent('pointerdown', 10, 10))
    slot.element.dispatchEvent(pointerEvent('pointermove', 30, 30))
    slot.element.dispatchEvent(pointerEvent('pointerup', 500, 500))
    expect(store.slot(1)?.entry).toBeNull()
  })
  it('keeps duplicate skill bindings synchronized through the canonical state', () => {
    const store = useGameShortcutsStore()
    store.assignSkill(1, skill)
    store.assignSkill(2, skill)
    store.patchSkill(1, { level: 2, name: 'Updated skill' })
    expect(store.slot(2)?.entry).toMatchObject({ level: 2, name: 'Updated skill' })
  })
  it('does not render a skill list launcher in the shortcut rail', () => {
    const wrapper = mount(GameShortcutPanel, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('.ew-shortcuts__skill-list').exists()).toBe(false)
  })
})
