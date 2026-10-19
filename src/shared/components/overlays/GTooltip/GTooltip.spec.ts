import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import GTooltip from './GTooltip.vue'

function mountTooltip(props: Record<string, unknown> = {}) {
  return mount(GTooltip, {
    props: { openDelayMs: 0, closeDelayMs: 0, ...props },
    slots: {
      trigger: ({ triggerProps }: { triggerProps: Record<string, unknown> }) =>
        h('button', { type: 'button', ...triggerProps }, 'Skill'),
      default: '<span>Details</span>',
    },
    attachTo: document.body,
  })
}

describe('GTooltip', () => {
  it('opens from focus and links the trigger with aria-describedby', async () => {
    const wrapper = mountTooltip()
    const trigger = wrapper.find('button')
    await trigger.trigger('focusin')
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('Details')
    expect(trigger.attributes('aria-describedby')).toMatch(/^ew-tooltip-/)
    wrapper.unmount()
  })

  it('closes on Escape and keeps the trigger available', async () => {
    const wrapper = mountTooltip({ defaultOpen: true })
    await wrapper.find('button').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    expect(wrapper.emitted('close')).toEqual([['escape']])
    wrapper.unmount()
  })

  it('does not reopen a fixed tooltip from mouse-click focus', async () => {
    const wrapper = mountTooltip({ defaultOpen: true })
    const trigger = wrapper.find('button')
    await trigger.trigger('pointerdown', { pointerType: 'mouse' })
    await trigger.trigger('focusin')
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('cancels delayed hover when the pointer leaves', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ openDelayMs: 300 })
    const trigger = wrapper.find('button')
    await trigger.trigger('pointerenter', { pointerType: 'mouse' })
    await trigger.trigger('pointerleave', { pointerType: 'mouse' })
    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    vi.useRealTimers()
    wrapper.unmount()
  })

  it('stays open while the pointer remains over the trigger', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ openDelayMs: 350 })
    await wrapper.find('button').trigger('pointerenter', { pointerType: 'mouse' })
    vi.advanceTimersByTime(350)
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    vi.useRealTimers()
    wrapper.unmount()
  })

  it('ignores a transient leave while the trigger is still hovered', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ defaultOpen: true, closeDelayMs: 100 })
    const trigger = wrapper.find('button')
    await trigger.trigger('focusin')
    await trigger.trigger('pointerleave', { pointerType: 'mouse' })
    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    vi.useRealTimers()
    wrapper.unmount()
  })

  it('closes after the pointer actually moves away', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ defaultOpen: true, closeDelayMs: 100 })
    const trigger = wrapper.find('button')
    await trigger.trigger('pointerenter', { pointerType: 'mouse' })
    await trigger.trigger('pointermove', { pointerType: 'mouse' })
    vi.spyOn(trigger.element, 'matches').mockReturnValue(false)
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 150,
      top: 50,
      bottom: 150,
      width: 100,
      height: 100,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    })
    await trigger.trigger('pointerleave', { pointerType: 'mouse' })
    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    vi.useRealTimers()
    wrapper.unmount()
  })

  it('closes when pointerleave arrives without pointermove', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ defaultOpen: true, closeDelayMs: 100 })
    const trigger = wrapper.find('button')
    vi.spyOn(trigger.element, 'matches').mockReturnValue(false)
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 150,
      top: 50,
      bottom: 150,
      width: 100,
      height: 100,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    })
    await trigger.trigger('pointerleave', { pointerType: 'mouse' })
    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    vi.useRealTimers()
    wrapper.unmount()
  })
})
