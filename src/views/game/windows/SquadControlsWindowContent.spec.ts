import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { appLocalizationLoader } from '@/localization/appLocalizationLoader'
import GLocalizationProvider from '@/shared/providers/localization/GLocalizationProvider.vue'
import SquadControlsWindowContent from './SquadControlsWindowContent.vue'

describe('SquadControlsWindowContent', () => {
  it('renders four localized actions in order with the intended variants', async () => {
    const wrapper = mount(GLocalizationProvider, {
      props: { loader: appLocalizationLoader },
      global: { plugins: [createPinia()] },
      slots: { default: SquadControlsWindowContent },
    })

    await flushPromises()
    const buttons = wrapper.findAll('.ew-compact-controls__action')

    expect(buttons.map((button) => button.text())).toEqual([
      '#SQUAD_KICK_GROUP',
      '#SQUAD_CHECK_READINESS',
      '#SQUAD_LEAVE',
      '#SQUAD_DISMISS',
    ])
    expect(buttons[0]!.classes()).toContain('ew-button--danger')
    expect(buttons[1]!.classes()).toContain('ew-button--dark')
    expect(buttons[2]!.classes()).toContain('ew-button--danger')
    expect(buttons[3]!.classes()).toContain('ew-button--danger')
    expect(buttons.every((button) => button.attributes('type') === 'button')).toBe(true)
    expect(buttons.every((button) => !button.attributes('disabled'))).toBe(true)

    await wrapper.unmount()
  })

  it('keeps every action inert', async () => {
    const wrapper = mount(SquadControlsWindowContent, {
      global: { plugins: [createPinia()] },
    })
    const buttons = wrapper.findAll('button')
    const initialHtml = wrapper.html()

    for (const button of buttons) {
      await button.trigger('click')
    }

    expect(wrapper.emitted('action')).toBeUndefined()
    expect(wrapper.html()).toBe(initialHtml)
    await wrapper.unmount()
  })
})
