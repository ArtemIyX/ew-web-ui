import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import DebugView from './DebugView.vue'

describe('DebugView progress atlas', () => {
  function mountAtlas() {
    return mount(DebugView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          GWindow: true,
          GTooltip: true,
          GPopover: true,
          GModal: true,
        },
      },
    })
  }

  it('documents all window placements and both compatibility samples', async () => {
    const wrapper = mountAtlas()

    expect(wrapper.text()).toContain('Window framework')
    expect(wrapper.text()).toContain('top sample')
    expect(wrapper.text()).toContain('right sample')
    expect(wrapper.text()).toContain('bottom sample')
    expect(wrapper.text()).toContain('left sample')
    expect(wrapper.text()).toContain('Open titleless sample')
    expect(wrapper.text()).toContain('Open classic sample')

    const placement = wrapper.findAll('select')[0]!
    await placement.setValue('left')
    const selects = wrapper.findAll('select')
    await selects[1]!.setValue('lg')
    await selects[2]!.setValue('sm')
    await selects[3]!.setValue('iron')
    await selects[4]!.setValue('bronze')
    expect(wrapper.findComponent({ name: 'GWindow' }).props('headerPlacement')).toBe('left')
    expect(wrapper.findComponent({ name: 'GWindow' }).props('headerSize')).toBe('sm')
    expect(wrapper.findComponent({ name: 'GWindow' }).props('surface')).toBe('iron')
    expect(wrapper.findComponent({ name: 'GWindow' }).props('headerSurface')).toBe('bronze')
    expect(wrapper.findComponent({ name: 'GWindow' }).props('closable')).toBe(false)
    expect(wrapper.findComponent({ name: 'GWindow' }).props('ariaLabel')).toBe(
      'Titleless window sample',
    )
    const windows = wrapper.findAllComponents({ name: 'GWindow' })
    const classic = windows.find((window) => window.props('windowId') === 'debug.window-classic')
    expect(classic?.props('title')).toBe('Settings sample')
    expect(classic?.props('titleSize')).toBe('lg')
    expect(classic?.props('closable')).toBe(true)
  })

  it('includes the dedicated progress section and released semantic tones', () => {
    const wrapper = mountAtlas()

    expect(wrapper.text()).toContain('Progress bars')
    expect(wrapper.text()).toContain('interactive samples')
    expect(wrapper.findAll('.ew-progress')).toHaveLength(22)
    expect(wrapper.find('[data-tone="neutral"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="hp"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="mp"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="energy"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="shield"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="cp"]').exists()).toBe(true)
    expect(wrapper.find('[data-tone="xp"]').exists()).toBe(true)
  })

  it('updates the interactive sample from each progress control button', async () => {
    const wrapper = mountAtlas()
    const button = (label: string) =>
      wrapper.findAll('button').find((item) => item.text() === label)!
    const sample = () => wrapper.find('.ew-progress')

    await button('Increase 10%').trigger('click')
    expect(sample().get('[role="progressbar"]').attributes('aria-valuenow')).toBe('72')

    await button('Library gradient').trigger('click')
    expect(sample().attributes('data-fill-kind')).toBe('gradient')

    await button('CSS gradient').trigger('click')
    expect(sample().attributes('data-fill-kind')).toBe('css')

    await button('Tone').trigger('click')
    expect(sample().attributes('data-fill-kind')).toBe('tone')
  })

  it('updates the sample semantic tone from the tone selector', async () => {
    const wrapper = mountAtlas()

    const toneSelect = wrapper.findAll('select').find((select) => select.find('option[value="hp"]').exists())!
    await toneSelect.setValue('mp')

    expect(wrapper.find('.ew-progress').attributes('data-tone')).toBe('mp')
  })
})
