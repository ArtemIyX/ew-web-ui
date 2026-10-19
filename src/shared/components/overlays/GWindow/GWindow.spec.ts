import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import GWindow from './GWindow.vue'
import { useWindowManagerStore } from '@/stores/windowManager'

describe('GWindow', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })
  async function mountWindow() {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'settings',
        open: true,
        title: 'Settings',
        closable: true,
        defaultWidth: 300,
        defaultHeight: 200,
      },
      slots: { default: '<button>Content action</button>', header: 'Custom header' },
    })
    await nextTick()
    return wrapper
  }
  it('renders as a non-modal dialog with custom header and controls', async () => {
    const _wrapper = await mountWindow()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.body.querySelector('[aria-modal]')).toBeNull()
    expect(document.body.querySelector('.ew-backdrop')).toBeNull()
    expect(document.body.querySelector('.ew-window-header')?.textContent).toContain('Custom header')
    expect(document.body.querySelector('.ew-window-close')?.getAttribute('aria-label')).toBe(
      '#CLOSE',
    )
  })
  it('defaults to a titleless, non-closable top window with explicit accessible naming', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'default-window', open: true, ariaLabel: 'Tool window' },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    expect(frame.id).toBe('default-window')
    expect(frame.dataset.headerPlacement).toBe('top')
    expect(frame.dataset.headerVisible).toBe('true')
    expect(frame.dataset.movable).toBe('true')
    expect(frame.querySelector('h2')).toBeNull()
    expect(frame.getAttribute('aria-label')).toBe('Tool window')
    expect(frame.getAttribute('aria-labelledby')).toBeNull()
    expect(frame.querySelector('.ew-window-close')).toBeNull()
    await wrapper.unmount()
  })
  it('exposes title, header, surface, and opacity presentation controls', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'presentation-controls',
        open: true,
        title: 'Presentation sample',
        ariaLabel: 'Presentation sample',
        titleSize: 'lg',
        headerSize: 'sm',
        surface: 'iron',
        headerSurface: 'bronze',
        opacity: 0.42,
        fitContentHeight: true,
        fitContentWidth: true,
      },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    expect(frame.dataset.titleSize).toBe('lg')
    expect(frame.dataset.headerSize).toBe('sm')
    expect(frame.dataset.surface).toBe('iron')
    expect(frame.dataset.headerSurface).toBe('bronze')
    expect(frame.dataset.fitContentHeight).toBe('true')
    expect(frame.dataset.fitContentWidth).toBe('true')
    expect(frame.style.width).toBe('max-content')
    expect(frame.style.height).toBe('auto')
    expect(frame.style.getPropertyValue('--ew-window-opacity')).toBe('0.42')
    await wrapper.unmount()
  })
  it('persists measured dimensions for fit-content windows', async () => {
    const originalResizeObserver = globalThis.ResizeObserver
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect
    class ResizeObserverMock {
      private readonly callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe(): void {
        this.callback([], this as unknown as ResizeObserver)
      }

      disconnect(): void {}

      unobserve(): void {}
    }
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('ew-window-frame')) {
        return {
          x: 0,
          y: 0,
          width: 240,
          height: 96,
          top: 0,
          right: 240,
          bottom: 96,
          left: 0,
          toJSON: () => ({}),
        }
      }
      return originalGetBoundingClientRect.call(this)
    })
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'fit-content-measurement',
        open: true,
        ariaLabel: 'Fit content measurement',
        fitContentHeight: true,
        fitContentWidth: true,
        minWidth: 100,
        minHeight: 50,
      },
      slots: { default: '<div>Content</div>' },
    })
    await nextTick()
    const windowStore = useWindowManagerStore()
    expect(windowStore.layouts['fit-content-measurement']).toMatchObject({
      width: 240,
      height: 96,
    })
    await wrapper.unmount()
    globalThis.ResizeObserver = originalResizeObserver
    vi.restoreAllMocks()
  })
  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'supports %s header placement',
    async (placement) => {
      const wrapper = mount(GWindow, {
        attachTo: document.body,
        global: { plugins: [createPinia()] },
        props: {
          windowId: `placement-${placement}`,
          open: true,
          ariaLabel: 'Sample',
          headerPlacement: placement,
        },
      })
      await nextTick()
      expect(
        document.body.querySelector('.ew-window-frame')?.getAttribute('data-header-placement'),
      ).toBe(placement)
      await wrapper.unmount()
    },
  )
  it('references a title only when the title element is rendered', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'titled', open: true, title: 'Titled window' },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    expect(frame.getAttribute('aria-labelledby')).toBe('titled-title')
    expect(frame.getAttribute('aria-label')).toBeNull()
    await wrapper.unmount()
  })
  it('keeps the title reference valid when a custom header replaces the title region', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'custom-title', open: true, title: 'Accessible title' },
      slots: { header: '<span>Custom header</span>' },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    const labelledBy = frame.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('custom-title-title')
    expect(document.getElementById(labelledBy!)).not.toBeNull()
    expect(document.getElementById(labelledBy!)?.textContent).toContain('Accessible title')
    await wrapper.unmount()
  })
  it('warns when a titleless window has no accessible name', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'unnamed', open: true },
    })
    await nextTick()
    expect(warning).toHaveBeenCalledWith('[GWindow] Titleless window unnamed requires ariaLabel')
    warning.mockRestore()
    await wrapper.unmount()
  })
  it('hides the header and prevents movement when requested', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'hidden-header',
        open: true,
        ariaLabel: 'Hidden header',
        headerVisible: false,
      },
    })
    await nextTick()
    expect(document.body.querySelector('.ew-window-header')).toBeNull()
    expect(document.body.querySelector('.ew-window-frame')?.getAttribute('data-movable')).toBe(
      'false',
    )
    await wrapper.unmount()
  })
  it('moves a headerless surface window from empty space but not from controls', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'surface-window',
        open: true,
        ariaLabel: 'Surface window',
        headerVisible: false,
        dragRegion: 'surface',
        chrome: 'none',
        resizable: false,
      },
      slots: { default: '<button data-ew-window-no-drag>Action</button><span>Empty</span>' },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    frame.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerId: 5,
        clientX: 80,
        clientY: 80,
      }),
    )
    expect(wrapper.emitted('move-start')).toHaveLength(1)
    expect(frame.dataset.dragRegion).toBe('surface')
    expect(frame.dataset.chrome).toBe('none')
    await wrapper.unmount()
  })
  it('moves only from a dedicated handle and supports keyboard movement there', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'handle-window',
        open: true,
        ariaLabel: 'Handle window',
        headerVisible: false,
        dragRegion: 'handle',
        resizable: false,
      },
      slots: {
        default:
          '<button data-ew-window-drag-handle>Move</button><span data-testid="empty">Empty</span>',
      },
    })
    await nextTick()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    const empty = document.querySelector('[data-testid="empty"]') as HTMLElement
    empty.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerId: 12,
        clientX: 80,
        clientY: 80,
      }),
    )
    expect(wrapper.emitted('move-start')).toBeUndefined()

    const handle = document.querySelector('[data-ew-window-drag-handle]') as HTMLElement
    handle.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerId: 13,
        clientX: 80,
        clientY: 80,
      }),
    )
    expect(frame.dataset.dragRegion).toBe('handle')
    expect(wrapper.emitted('move-start')).toHaveLength(1)

    handle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
    expect(wrapper.emitted('move')).toBeTruthy()
    await wrapper.unmount()
  })
  it('does not begin dragging from a body control', async () => {
    const _wrapper = await mountWindow()
    const button = document.body.querySelector('.ew-window-body button') as HTMLElement
    button.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerId: 1,
        clientX: 10,
        clientY: 10,
      }),
    )
    expect(document.body.querySelector('.ew-window-dragging')).toBeNull()
  })
  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'starts movement from unused %s header space',
    async (placement) => {
      const wrapper = mount(GWindow, {
        attachTo: document.body,
        global: { plugins: [createPinia()] },
        props: {
          windowId: `drag-${placement}`,
          open: true,
          ariaLabel: 'Drag sample',
          headerPlacement: placement,
        },
      })
      await nextTick()
      const header = document.body.querySelector('.ew-window-header') as HTMLElement
      header.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          pointerId: 1,
          clientX: 80,
          clientY: 80,
        }),
      )
      await nextTick()
      expect(wrapper.emitted('move-start')).toHaveLength(1)
      expect(document.body.querySelector('.ew-window-dragging')).not.toBeNull()
      await wrapper.unmount()
    },
  )
  it('does not move a non-movable header or custom no-drag content', async () => {
    const nonMovable = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'non-movable', open: true, ariaLabel: 'Non-movable', movable: false },
    })
    await nextTick()
    ;(document.body.querySelector('.ew-window-header') as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 2 }),
    )
    expect(nonMovable.emitted('move-start')).toBeUndefined()
    await nonMovable.unmount()

    const custom = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'no-drag', open: true, ariaLabel: 'No drag' },
      slots: {
        header: '<span data-ew-window-no-drag>Selectable header content</span>',
      },
    })
    await nextTick()
    const noDrag = document.body.querySelector('[data-ew-window-no-drag]') as HTMLElement
    noDrag.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 3 }),
    )
    expect(custom.emitted('move-start')).toBeUndefined()
    await custom.unmount()
  })
  it('resizes with keyboard input and emits geometry changes', async () => {
    const wrapper = await mountWindow()
    const handle = document.body.querySelector('.ew-window-resize-handle') as HTMLElement
    handle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
    expect(wrapper.emitted('resize')).toHaveLength(1)
    expect(wrapper.emitted('geometry-change')).toHaveLength(1)
  })
  it('supports resize mode precedence and localized resize labels', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'resize-mode',
        open: true,
        ariaLabel: 'Resize mode',
        resizable: false,
        resizeMode: 'corner',
        resizeLabel: 'Resize sample',
      },
    })
    await nextTick()
    expect(
      document.body.querySelector('.ew-window-resize-handle')?.getAttribute('aria-label'),
    ).toBe('Resize sample')
    await wrapper.setProps({ resizeMode: 'none' })
    expect(document.body.querySelector('.ew-window-resize-handle')).toBeNull()
    await wrapper.unmount()
  })
  it('does not close on Escape while non-closable', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'locked', open: true, ariaLabel: 'Locked' },
    })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:open')).toBeUndefined()
    await wrapper.unmount()
  })
  it('closes on Escape only for an explicitly closable window', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'escape-close', open: true, ariaLabel: 'Escape close', closable: true },
    })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    await wrapper.unmount()
  })
  it('warns when Escape is explicitly enabled for a non-closable window', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: {
        windowId: 'escape-warning',
        open: true,
        ariaLabel: 'Escape warning',
        closeOnEscape: true,
        closable: false,
      },
    })
    await nextTick()
    expect(warning).toHaveBeenCalledWith(
      '[GWindow] Window escape-warning has closeOnEscape enabled but is not closable',
    )
    warning.mockRestore()
    await wrapper.unmount()
  })
  it('commits geometry when the owner unmounts', async () => {
    const wrapper = await mountWindow()
    const root = document.body.querySelector('[role="dialog"]') as HTMLElement
    root.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
    await wrapper.unmount()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
  it('supports a flush body independently from the frame', async () => {
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'flush', open: true, bodyFlush: true },
    })
    await nextTick()
    expect(document.body.querySelector('.ew-window-body-flush')).not.toBeNull()
    await wrapper.unmount()
  })
  it('does not opt into modal stacking or semantics', async () => {
    await mountWindow()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    expect(frame.getAttribute('aria-modal')).toBeNull()
    expect(Number(getComputedStyle(frame).zIndex)).toBeLessThan(1000)
  })
  it('restores focus to the invoking element when closed', async () => {
    const invoker = document.createElement('button')
    document.body.append(invoker)
    invoker.focus()
    const wrapper = mount(GWindow, {
      attachTo: document.body,
      global: { plugins: [createPinia()] },
      props: { windowId: 'focus', open: true },
    })
    await nextTick()
    await wrapper.setProps({ open: false })
    expect(document.activeElement).toBe(invoker)
    await wrapper.unmount()
  })
  it('promotes the window when keyboard focus enters it', async () => {
    const wrapper = await mountWindow()
    const frame = document.body.querySelector('.ew-window-frame') as HTMLElement
    frame.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(wrapper.emitted('focus')).toBeTruthy()
  })
})
