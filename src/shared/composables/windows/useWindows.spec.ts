import { defineComponent, h, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import { useWindows } from './useWindows'

const Content = defineComponent({
  setup: () => () => h('p', 'Window content'),
})

let windowApi: ReturnType<typeof useWindows>

function createLauncher() {
  return defineComponent({
    setup() {
      const windows = useWindows()
      windowApi = windows
      return { windows }
    },
    render() {
      return h('button', { onClick: () => this.windows.openWindow('tool') }, 'Open')
    },
  })
}

describe('useWindows', () => {
  it('defaults managed windows to non-closable and focuses them when reopened', async () => {
    const pinia = createPinia()
    const wrapper = mount(GOverlayHost, {
      global: { plugins: [pinia] },
      props: { windowDefinitions: [{ id: 'tool', component: Content }] },
      slots: { default: () => h(createLauncher()) },
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    setActivePinia(pinia)
    const firstState = windowApi.getWindowState('tool')
    expect(firstState.value.open).toBe(true)
    expect(firstState.value.active).toBe(true)
    expect(windowApi.toggleWindow('tool')).toMatchObject({ status: 'focused-existing' })
    expect(firstState.value.open).toBe(true)
    await wrapper.unmount()
  })

  it('retains explicit closability and supports force close', async () => {
    const pinia = createPinia()
    const wrapper = mount(GOverlayHost, {
      global: { plugins: [pinia] },
      props: {
        windowDefinitions: [{ id: 'tool', component: Content, closable: true }],
      },
      slots: { default: () => h(createLauncher()) },
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    setActivePinia(pinia)
    expect(windowApi.toggleWindow('tool')).toMatchObject({ status: 'closed' })
    expect(windowApi.getWindowState('tool').value.open).toBe(false)
    windowApi.openWindow('tool')
    expect(windowApi.closeWindow('tool', { force: true })).toBe(true)
    expect(windowApi.getWindowState('tool').value.open).toBe(false)
    await wrapper.unmount()
  })
})
