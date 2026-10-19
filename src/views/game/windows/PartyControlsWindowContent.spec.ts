import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { appLocalizationLoader } from '@/localization/appLocalizationLoader'
import GLocalizationProvider from '@/shared/providers/localization/GLocalizationProvider.vue'
import PartyControlsWindowContent from './PartyControlsWindowContent.vue'

describe('PartyControlsWindowContent', () => {
  it('renders the five localized actions in order without a close control', async () => {
    const wrapper = mount(GLocalizationProvider, {
      props: { loader: appLocalizationLoader },
      global: { plugins: [createPinia()] },
      slots: { default: PartyControlsWindowContent },
    })

    await flushPromises()
    const buttons = wrapper.findAll('.ew-party-controls__action')

    expect(buttons.map((button) => button.text())).toEqual([
      '#PARTY_LEAVE',
      '#PARTY_TOGGLE_PIN',
      '#PARTY_TOGGLE_VISIBILITY',
      '#PARTY_CHANGE_DROP',
      '#PARTY_CHECK_READINESS',
    ])
    expect(buttons[0]!.classes()).toContain('ew-button--danger')
    expect(buttons.slice(1).every((button) => button.classes('ew-button--dark'))).toBe(true)
    expect(wrapper.find('.ew-window-close').exists()).toBe(false)

    await wrapper.unmount()
  })

  it('emits exactly one typed intent for every action', async () => {
    const wrapper = mount(PartyControlsWindowContent, {
      global: { plugins: [createPinia()] },
    })

    const buttons = wrapper.findAll('button')
    const expectedActions = [
      'leave-party',
      'toggle-party-pin',
      'toggle-party-visibility',
      'change-party-drop',
      'check-party-readiness',
    ] as const

    for (const [index, button] of buttons.entries()) {
      await button.trigger('click')
      expect(wrapper.emitted('action')?.[index]).toEqual([
        {
          action: expectedActions[index],
          source: 'party-controls-window',
        },
      ])
    }

    expect(wrapper.emitted('action')).toHaveLength(expectedActions.length)
    await wrapper.unmount()
  })
})
