import { nextTick, defineComponent, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GOverlayHost from './GOverlayHost.vue'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { useWindowManagerStore } from '@/stores/windowManager'

const Content = defineComponent({
  setup: () => () => h('p', { class: 'managed-content' }, 'Managed content'),
})

describe('GOverlayHost managed windows', () => {
  it('opens one registered window from a descendant and renders its content', async () => {
    const launcher = defineComponent({
      setup() {
        const { openWindow } = useWindows()
        return () => h('button', { onClick: () => openWindow('settings') }, 'Open')
      },
    })
    const wrapper = mount(GOverlayHost, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowDefinitions: [{ id: 'settings', component: Content, title: 'Settings' }] },
      slots: { default: () => h(launcher) },
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.managed-content')).not.toBeNull()
    expect(document.body.querySelectorAll('.ew-window-frame')).toHaveLength(1)
    await wrapper.unmount()
  })
  it('keeps the managed instance across host remounts', async () => {
    const pinia = createPinia()
    const definition = { id: 'inventory', component: Content, title: 'Inventory' }
    const first = mount(GOverlayHost, {
      attachTo: document.body,
      global: { plugins: [pinia] },
      props: { windowDefinitions: [definition] },
    })
    setActivePinia(pinia)
    useWindowManagerStore().openManagedWindow('inventory', { closable: true })
    await nextTick()
    await first.unmount()
    mount(GOverlayHost, {
      attachTo: document.body,
      global: { plugins: [pinia] },
      props: { windowDefinitions: [definition] },
    })
    await nextTick()
    expect(document.body.querySelectorAll('.ew-window-frame')).toHaveLength(1)
  })
  it('respects closability until force-close is requested', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const definition = { id: 'locked', component: Content, title: 'Locked', closable: false }
    const wrapper = mount(GOverlayHost, {
      attachTo: document.body,
      global: { plugins: [pinia] },
      props: { windowDefinitions: [definition] },
    })
    const manager = useWindowManagerStore()
    manager.openManagedWindow('locked', { closable: false })
    await nextTick()
    manager.closeManagedWindow('locked')
    expect(manager.managedWindows.locked?.open).toBe(true)
    manager.closeManagedWindow('locked', true)
    expect(manager.managedWindows.locked?.open).toBe(false)
    await wrapper.unmount()
  })
  it('forwards a definition default position to the managed window', async () => {
    const pinia = createPinia()
    const wrapper = mount(GOverlayHost, {
      global: {
        plugins: [pinia],
        stubs: {
          GWindow: defineComponent({
            props: { defaultPosition: { type: [String, Object], default: undefined } },
            setup(props) {
              return () =>
                h('div', { 'data-default-position': JSON.stringify(props.defaultPosition) })
            },
          }),
        },
      },
      props: {
        windowDefinitions: [
          { id: 'positioned', component: Content, defaultPosition: { x: 32, y: 48 } },
        ],
      },
    })
    setActivePinia(pinia)
    useWindowManagerStore().openManagedWindow('positioned')
    await nextTick()
    expect(wrapper.find('[data-default-position]').attributes('data-default-position')).toBe(
      '{"x":32,"y":48}',
    )
    await wrapper.unmount()
  })
  it('forwards the expanded chrome contract to managed windows', async () => {
    const pinia = createPinia()
    const wrapper = mount(GOverlayHost, {
      global: {
        plugins: [pinia],
        stubs: {
          GWindow: defineComponent({
            props: {
              headerPlacement: String,
              headerVisible: Boolean,
              movable: Boolean,
              resizeMode: String,
              resizeLabel: String,
              titleSize: String,
              headerSize: String,
              surface: String,
              headerSurface: String,
              opacity: Number,
              closable: Boolean,
            },
            setup(props) {
              return () => h('div', { 'data-window-props': JSON.stringify(props) })
            },
          }),
        },
      },
      props: {
        windowDefinitions: [
          {
            id: 'tool',
            component: Content,
            ariaLabel: 'Tool window',
            headerPlacement: 'left',
            headerVisible: true,
            movable: false,
            resizeMode: 'none',
            resizeLabel: 'Resize tool window',
            titleSize: 'lg',
            headerSize: 'sm',
            surface: 'iron',
            headerSurface: 'bronze',
            opacity: 0.5,
            closable: false,
          },
        ],
      },
    })
    setActivePinia(pinia)
    useWindowManagerStore().openManagedWindow('tool', { closable: false })
    await nextTick()
    expect(JSON.parse(wrapper.find('[data-window-props]').attributes('data-window-props')!)).toMatchObject({
      headerPlacement: 'left',
      headerVisible: true,
      movable: false,
      resizeMode: 'none',
      resizeLabel: 'Resize tool window',
      titleSize: 'lg',
      headerSize: 'sm',
      surface: 'iron',
      headerSurface: 'bronze',
      opacity: 0.5,
      closable: false,
    })
    await wrapper.unmount()
  })
})
