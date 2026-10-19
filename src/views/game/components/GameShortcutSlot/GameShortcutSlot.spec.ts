import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GameShortcutSlot from './GameShortcutSlot.vue'
import type { ShortcutSlot } from '../../types/shortcuts'

const empty: ShortcutSlot = { position: 4, entry: null }
describe('GameShortcutSlot', () => {
  it('exposes position and toggles its lock from context menu', async () => {
    const wrapper = mount(GameShortcutSlot, {
      props: { shortcutSlot: empty, locked: false, debug: false, nowMs: 0 },
    })
    await wrapper.trigger('contextmenu')
    expect(wrapper.emitted('lock')).toEqual([[4]])
    expect(wrapper.attributes('aria-label')).toContain('4')
  })
  it('does not activate an unsupported entry', async () => {
    const wrapper = mount(GameShortcutSlot, {
      props: {
        shortcutSlot: { position: 5, entry: { kind: 'item', itemId: 'item', unsupported: true } },
        locked: false,
        debug: false,
        nowMs: 0,
      },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('activate')).toBeUndefined()
  })
})
