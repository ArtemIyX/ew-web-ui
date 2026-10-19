import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ProgressThreshold } from '@/shared/types/progress'
import GProgress from './GProgress.vue'

describe('GProgress', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('supports legacy value and max props with determinate ARIA values', () => {
    const wrapper = mount(GProgress, {
      props: { value: 25, max: 50, ariaLabel: 'Health' },
    })
    const meter = wrapper.get('[role="progressbar"]')

    expect(meter.attributes('aria-label')).toBe('Health')
    expect(meter.attributes('aria-valuemin')).toBe('0')
    expect(meter.attributes('aria-valuemax')).toBe('50')
    expect(meter.attributes('aria-valuenow')).toBe('25')
    expect(wrapper.get('.ew-progress').attributes('data-tone')).toBe('neutral')
    expect(wrapper.attributes('style')).not.toContain('--ew-progress-custom-fill')
    expect(wrapper.find('.ew-progress__delta').exists()).toBe(false)
  })

  it('gives percentage input precedence and clamps it', () => {
    const wrapper = mount(GProgress, {
      props: { value: 12, max: 20, percentage: 125, showPercentage: true },
    })

    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.text()).toContain('100%')
  })

  it('omits numeric ARIA attributes while indeterminate', () => {
    const meter = mount(GProgress, { props: { indeterminate: true, ariaLabel: 'Connecting' } }).get(
      '[role="progressbar"]',
    )

    expect(meter.attributes('aria-label')).toBe('Connecting')
    expect(meter.attributes('aria-valuenow')).toBeUndefined()
    expect(meter.attributes('aria-valuemin')).toBeUndefined()
    expect(meter.attributes('aria-valuemax')).toBeUndefined()
  })

  it('renders semantic state, size, direction, opacity, and fill attributes', () => {
    const wrapper = mount(GProgress, {
      props: {
        value: 20,
        max: 100,
        tone: 'hp',
        size: 'lg',
        orientation: 'vertical',
        reverse: true,
        segments: 120,
        fill: { kind: 'color', value: 'var(--feature-color)' },
        trackOpacity: 2,
        fillOpacity: -1,
      },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ew-progress--lg', 'ew-progress--vertical', 'ew-progress--reverse']),
    )
    expect(wrapper.attributes('data-tone')).toBe('hp')
    expect(wrapper.attributes('data-fill-kind')).toBe('color')
    expect(wrapper.attributes('data-segments')).toBe('100')
    expect(wrapper.attributes('style')).toContain('--ew-progress-track-opacity: 1')
    expect(wrapper.attributes('style')).toContain('--ew-progress-fill-opacity: 0')
  })

  it('exposes reusable progress shapes without changing normalization', async () => {
    const wrapper = mount(GProgress, { props: { percentage: 0, shape: 'angled' } })
    expect(wrapper.classes()).toContain('ew-progress--angled')
    expect(wrapper.attributes('data-shape')).toBe('angled')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuemax')).toBe('100')

    await wrapper.setProps({ percentage: 50, shape: 'square' })
    expect(wrapper.classes()).toContain('ew-progress--square')
    expect(wrapper.attributes('data-shape')).toBe('square')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')

    await wrapper.setProps({ shape: 'notched' })
    expect(wrapper.classes()).toContain('ew-progress--notched')
    expect(wrapper.attributes('data-shape')).toBe('notched')
  })

  it('uses threshold paint without mutating caller data', () => {
    const thresholds: ProgressThreshold[] = [
      { atOrBelow: 0.5, tone: 'mp' },
      { atOrBelow: 0.2, fill: { kind: 'gradient' as const, variant: 'gradient-13' as const } },
    ]
    const wrapper = mount(GProgress, {
      props: { percentage: 15, tone: 'hp', thresholds },
    })

    expect(wrapper.attributes('data-fill-kind')).toBe('gradient')
    expect(wrapper.attributes('data-tone')).toBe('hp')
    expect(thresholds.map((threshold) => threshold.atOrBelow)).toEqual([0.5, 0.2])
  })

  it('resolves custom CSS fills and forwards non-owned attributes', () => {
    const wrapper = mount(GProgress, {
      attrs: { id: 'custom-progress', 'data-sample': 'true', 'aria-valuenow': '999' },
      props: {
        percentage: 40,
        fill: { kind: 'css', value: 'linear-gradient(90deg, red, blue)' },
      },
    })

    const meter = wrapper.get('[role="progressbar"]')
    expect(meter.attributes('id')).toBe('custom-progress')
    expect(meter.attributes('data-sample')).toBe('true')
    expect(meter.attributes('aria-valuenow')).toBe('40')
    expect(wrapper.attributes('style')).toContain(
      '--ew-progress-custom-fill: linear-gradient(90deg, red, blue)',
    )
  })

  it('renders built-in text, formatter output, custom aria text, and slots', () => {
    const wrapper = mount(GProgress, {
      props: {
        value: 42,
        max: 80,
        label: 'Shield',
        showLabel: true,
        showValue: true,
        showPercentage: true,
        formatValue: ({ value, max }) => `${value}/${max}`,
        ariaValueText: '42 of 80 shield',
      },
      slots: {
        leading: '<span data-test="leading">L</span>',
        trailing: '<span data-test="trailing">T</span>',
        overlay: '<span data-test="overlay">Overlay</span>',
        markers: '<span data-test="markers">Markers</span>',
      },
    })

    expect(wrapper.text()).toContain('Overlay')
    expect(wrapper.text()).not.toContain('42/80')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuetext')).toBe('42 of 80 shield')
    expect(wrapper.find('[data-test="leading"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="trailing"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="markers"]').exists()).toBe(true)
  })

  it('tracks increase and decrease direction and cleans up delayed completion', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GProgress, {
      props: { percentage: 20, motion: { durationMs: 10, delayMs: 20 } },
    })

    await wrapper.setProps({ percentage: 70 })
    expect(wrapper.classes()).toContain('ew-progress--increase')
    expect(wrapper.find('.ew-progress__delta').exists()).toBe(true)
    await wrapper.setProps({ percentage: 10 })
    expect(wrapper.classes()).toContain('ew-progress--decrease')

    vi.advanceTimersByTime(31)
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('ew-progress--none')
    wrapper.unmount()
  })

  it('synchronizes immediately when animation is disabled', async () => {
    const wrapper = mount(GProgress, { props: { percentage: 20, animated: false } })

    await wrapper.setProps({ percentage: 80 })

    expect(wrapper.classes()).toContain('ew-progress--none')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('80')
  })

  it('settles cleanly when a decrease immediately reverses to an increase', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GProgress, {
      props: { percentage: 80, motion: { durationMs: 10, delayMs: 20 } },
    })

    await wrapper.setProps({ percentage: 20 })
    await wrapper.setProps({ percentage: 60 })
    expect(wrapper.classes()).toContain('ew-progress--increase')

    vi.advanceTimersByTime(31)
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('ew-progress--none')
    wrapper.unmount()
  })
})
