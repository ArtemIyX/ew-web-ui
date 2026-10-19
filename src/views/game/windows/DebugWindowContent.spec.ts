import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import DebugWindowContent from './DebugWindowContent.vue'
import { useWindowManagerStore } from '@/stores/windowManager'
import { usePlayerStatusStore } from '@/stores/playerStatus'

const StubWindow = defineComponent({ template: '<div />' })

describe('DebugWindowContent', () => {
  it('uses an adaptive wrapping tab rail', () => {
    const wrapper = mount(DebugWindowContent, { global: { plugins: [createPinia()] } })
    const rail = wrapper.get('.ew-debug-window-content__tabs')
    expect(rail.classes()).toContain('ew-tabs')
    expect(rail.classes()).toContain('ew-debug-window-content__tabs')
    expect(rail.attributes('aria-label')).toBe('Debug sections')
    wrapper.unmount()
  })

  it('groups skill list and settings launchers under Windows', async () => {
    const pinia = createPinia()
    const wrapper = mount(GOverlayHost, {
      attachTo: document.body,
      props: {
        windowDefinitions: [
          { id: 'debug', component: DebugWindowContent },
          { id: 'skill-list', component: StubWindow },
          { id: 'game-settings', component: StubWindow },
          { id: 'buff-list', component: StubWindow },
        ],
      },
      global: { plugins: [pinia] },
      slots: { default: DebugWindowContent },
    })
    const debug = wrapper.findComponent(DebugWindowContent)
    await debug.find('[role="tab"]:nth-child(3)').trigger('click')
    const buttons = debug.findAll('.ew-debug-window-content__panel button')
    expect(buttons).toHaveLength(2)
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    const store = useWindowManagerStore(pinia)
    expect(store.isWindowOpen('skill-list').value).toBe(true)
    expect(store.isWindowOpen('game-settings').value).toBe(true)
    await debug.get('a[href="#buff-list"]').trigger('click')
    expect(store.isWindowOpen('buff-list').value).toBe(true)
    await debug.find('[role="tab"]:nth-child(4)').trigger('click')
    await wrapper.unmount()
  })

  it('adjusts prototype status values from the Status tab', async () => {
    const pinia = createPinia()
    const wrapper = mount(DebugWindowContent, { global: { plugins: [pinia] } })
    const statusStore = usePlayerStatusStore(pinia)

    await wrapper.find('[role="tab"]:nth-child(2)').trigger('click')
    const increaseHealth = wrapper.get('button[aria-label="Increase Health"]')
    const decreaseHealth = wrapper.get('button[aria-label="Decrease Health"]')
    await increaseHealth.trigger('click')
    expect(statusStore.snapshot.hp.current).toBe(100000)

    await decreaseHealth.trigger('click')
    expect(statusStore.snapshot.hp.current).toBe(90000)

    await wrapper.get('button[aria-label="Decrease Mana"]').trigger('click')
    expect(statusStore.snapshot.mp.current).toBe(54000)
    await wrapper.unmount()
  })

  it('provides player cast lifecycle and timing examples', async () => {
    const pinia = createPinia()
    const wrapper = mount(DebugWindowContent, { global: { plugins: [pinia] } })

    const playerCastTab = wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.text().trim() === 'Player cast')
    expect(playerCastTab).toBeDefined()
    await playerCastTab!.trigger('click')

    const labels = wrapper.findAll('button').map((button) => button.text().trim())
    expect(labels).toContain('Start 1.2s cast')
    expect(labels).toContain('Pause cast')
    expect(labels).toContain('Set 50% progress')
    expect(labels).toContain('Finish cast')
    expect(labels).toContain('Cancel cast')
    expect(labels).toContain('Interrupt cast')
    expect(labels).toContain('Clear immediately')
    expect(labels).toContain('Reset cast position')
    await wrapper.unmount()
  })
})
