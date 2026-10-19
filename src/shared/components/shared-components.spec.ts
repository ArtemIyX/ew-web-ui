import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import * as components from './index'
import GButton from './actions/GButton/GButton.vue'
import GInput from './forms/GInput/GInput.vue'
import GSelect from './forms/GSelect/GSelect.vue'
import GStepper from './actions/GStepper/GStepper.vue'
import GDisclosure from './collections/GDisclosure/GDisclosure.vue'
import GToggleGroup from './actions/GToggleGroup/GToggleGroup.vue'
import GModal from './overlays/GModal/GModal.vue'
import GTab from './navigation/GTab/GTab.vue'
import GMenu from './navigation/GMenu/GMenu.vue'
import GMenuItem from './navigation/GMenuItem/GMenuItem.vue'
import { createLocalizationService } from '../services/localization/localizationService'
import GText from './content/GText/GText.vue'
import GLocalizationProvider from '../providers/localization/GLocalizationProvider.vue'

describe('shared component catalog', () => {
  it('exports the complete documented component inventory', () => {
    expect(Object.keys(components)).toHaveLength(77)
  })

  it('keeps interactive roots semantic and forwards model events', async () => {
    const button = mount(GButton, { slots: { default: 'Play' } })
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.classes()).toContain('ew-button')

    const input = mount(GInput, { props: { modelValue: 'old' } })
    await input.find('input').setValue('new')
    expect(input.emitted('update:modelValue')).toEqual([['new']])

    const select = mount(GSelect, {
      props: { modelValue: 'one' },
      slots: { default: '<option value="one">One</option><option value="two">Two</option>' },
    })
    await select.find('select').setValue('two')
    expect(select.emitted('update:modelValue')).toEqual([['two']])
    expect(select.emitted('change')).toEqual([['two']])
  })

  it('deduplicates localization requests and resolves fallback parameters', async () => {
    let calls = 0
    const service = createLocalizationService(async () => {
      calls += 1
      return { greeting: 'Welcome, {name}' }
    })
    const text = { table: 'ui', textKey: 'greeting', params: { name: 'Ari' } }
    const [first, second] = await Promise.all([service.resolve('en', text), service.resolve('en', text)])
    expect(first).toBe('Welcome, Ari')
    expect(second).toBe('Welcome, Ari')
    expect(calls).toBe(1)
  })

  it('keeps the raw key for unknown lines and supports cache invalidation', async () => {
    let line = 'First'
    const service = createLocalizationService(async () => ({ greeting: line }))
    const text = { table: 'ui', textKey: 'missing', fallback: 'Do not hide this' }
    expect(await service.resolve('en', text)).toBe('missing')
    line = 'Second'
    expect(await service.resolve('en', { table: 'ui', textKey: 'greeting' })).toBe('First')
    service.invalidate('en', 'ui')
    expect(await service.resolve('en', { table: 'ui', textKey: 'greeting' })).toBe('Second')
  })

  it('renders raw keys while disconnected and replaces them from the loader', async () => {
    const loader = async (_culture: string, table: string): Promise<Record<string, string>> => table === 'MainMenu' ? { '#ENTER': 'Enter World' } : {}
    const wrapper = mount(GLocalizationProvider, { props: { loader }, slots: { default: () => h(GText, { content: { table: 'MainMenu', textKey: '#ENTER' } }) } })
    expect(wrapper.text()).toBe('#ENTER')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toBe('Enter World')
  })

  it('renders the raw key when no localization provider is present', () => {
    expect(mount(GText, { props: { content: { table: 'MainMenu', textKey: '#ENTER' } } }).text()).toBe('#ENTER')
  })

  it('updates immediately when the complete localization reference changes', async () => {
    const text = mount(GText, { props: { content: { table: 'MainMenu', textKey: '#PLAY' } } })
    await text.setProps({ content: { table: 'MainMenu', textKey: '#SETTINGS' } })
    expect(text.text()).toBe('#SETTINGS')
  })

  it('keeps the raw key when the table is absent or the loader fails', async () => {
    const absent = mount(GLocalizationProvider, { props: { loader: async (): Promise<Record<string, string>> => ({}) }, slots: { default: () => h(GText, { content: { table: 'MainMenu', textKey: '#ENTER' } }) } })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(absent.text()).toBe('#ENTER')
    const failed = mount(GLocalizationProvider, { props: { loader: async (): Promise<Record<string, string>> => { throw new Error('offline') } }, slots: { default: () => h(GText, { content: { table: 'MainMenu', textKey: '#ENTER' } }) } })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(failed.text()).toBe('#ENTER')
  })

  it('re-resolves localized content when culture changes', async () => {
    const loader = async (culture: string): Promise<Record<string, string>> => ({ '#TITLE': culture === 'fr' ? 'Accueil' : 'Home' })
    const Demo = { setup: () => () => h(GText, { content: { table: 'MainMenu', textKey: '#TITLE' } }) }
    const wrapper = mount(GLocalizationProvider, { props: { loader, culture: 'en' }, slots: { default: () => h(Demo) } })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toBe('Home')
    await wrapper.setProps({ culture: 'fr' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toBe('Accueil')
  })

  it('keeps the newest key when an older localization response arrives late', async () => {
    let releaseOld!: (value: Record<string, string>) => void
    let releaseNew!: (value: Record<string, string>) => void
    const loader = (culture: string) => new Promise<Record<string, string>>((resolve) => { if (culture === 'en') releaseOld = resolve; else releaseNew = resolve })
    const wrapper = mount(GLocalizationProvider, { props: { loader, culture: 'en' }, slots: { default: () => h(GText, { content: { table: 'MainMenu', textKey: '#TITLE' } }) } })
    await wrapper.setProps({ culture: 'fr' })
    releaseNew({ '#TITLE': 'Nouveau' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toBe('Nouveau')
    releaseOld({ '#OLD': 'Old' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toBe('Nouveau')
  })

  it('honors numeric boundaries and disabled disclosure state', async () => {
    const stepper = mount(GStepper, { props: { modelValue: 10, min: 10, max: 12, step: 1 } })
    const buttons = stepper.findAll('button')
    await buttons[1]!.trigger('click')
    expect(stepper.emitted('update:modelValue')).toEqual([[11]])
    expect(buttons[0]!.attributes('disabled')).toBe('')
    const disclosure = mount(GDisclosure, { props: { disabled: true }, slots: { summary: 'More', default: 'Content' } })
    await disclosure.find('summary').trigger('click')
    expect(disclosure.find('details').element.open).toBe(false)
  })

  it('keeps typed selection values and overlay semantics observable', async () => {
    const select = mount(GSelect, { props: { options: [{ value: 2, label: 'Two' }] } })
    await select.find('select').setValue('2')
    expect(select.emitted('update:modelValue')).toEqual([[2]])
    const toggles = mount(GToggleGroup, { props: { options: [{ value: 1, label: 'One' }, { value: 2, label: 'Two', disabled: true }] } })
    await toggles.findAll('button')[0]!.trigger('click')
    expect(toggles.emitted('update:modelValue')).toEqual([[1]])
    const modal = mount(GModal, { props: { open: true, title: 'Confirm action' }, slots: { default: 'Content' }, attachTo: document.body })
    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    modal.unmount()
  })

  it('resolves option labels without changing typed option values', async () => {
    const loader = async (): Promise<Record<string, string>> => ({ '#TWO': 'Deux' })
    const wrapper = mount(GLocalizationProvider, { props: { loader }, slots: { default: () => h(GSelect, { options: [{ value: 2, label: { table: 'Options', textKey: '#TWO' } }], modelValue: 2 }) } })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.find('option').text()).toBe('Deux')
    expect(wrapper.find('select').element.value).toBe('2')
  })

  it('resolves localized modal titles and accessible close labels', async () => {
    const loader = async (): Promise<Record<string, string>> => ({ '#TITLE': 'Settings', '#CLOSE': 'Fermer' })
    const wrapper = mount(GLocalizationProvider, { props: { loader }, slots: { default: () => h(GModal, { open: true, title: { table: 'Common', textKey: '#TITLE' }, closeLabel: { table: 'Common', textKey: '#CLOSE' } }) }, attachTo: document.body })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.body.querySelector('[role="dialog"] h2')?.textContent).toBe('Settings')
    expect(document.body.querySelector('[role="dialog"] button')?.getAttribute('aria-label')).toBe('Fermer')
    wrapper.unmount()
  })

  it('provides composite keyboard semantics and a stable export boundary', async () => {
    const tabs = mount(GTab, { props: { selected: true }, slots: { default: 'Current' } })
    expect(tabs.attributes('role')).toBe('tab')
    expect(tabs.attributes('tabindex')).toBe('0')
    const menu = mount(GMenu, { slots: { default: () => [h(GMenuItem, { disabled: false }, () => 'First'), h(GMenuItem, { disabled: false }, () => 'Second')] } })
    expect(menu.attributes('role')).toBe('menu')
    expect(menu.findAll('[role="menuitem"]')).toHaveLength(2)
    expect(Object.hasOwn(components, 'GTree')).toBe(false)
  })
})
