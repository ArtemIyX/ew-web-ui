import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import GameSettingsVideoPanel from './GameSettingsVideoPanel.vue'
import { useGameSettingsStore } from '@/stores/gameSettings'

describe('GameSettingsVideoPanel display performance', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders separate Frame Rate and View & Rendering sections', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    const wrapper = mount(GameSettingsVideoPanel)

    const tables = wrapper.findAll('.ew-settings-performance-table')
    expect(tables).toHaveLength(2)
    const sections = wrapper.findAll('.ew-settings__section')
    expect(sections.map((section) => section.find('h2').text())).toContain('#FRAME_RATE')
    expect(sections.map((section) => section.find('h2').text())).toContain('#VIEW_RENDERING')
    expect(tables[0]!.findAll('tbody > tr')).toHaveLength(3)
    expect(tables[1]!.findAll('tbody > tr')).toHaveLength(2)
    expect(tables[1]!.findAll('input[type="number"]')).toHaveLength(2)
    expect(tables[1]!.findAll('input[type="range"]')).toHaveLength(2)
  })

  it('mutes and disables Max FPS without losing its value', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    const wrapper = mount(GameSettingsVideoPanel)
    store.setField('video.performance.maxFps', 144)
    store.setField('video.performance.frameRateLimitEnabled', false)
    await wrapper.vm.$nextTick()

    const maxFps = wrapper.find('#settings-max-fps')
    expect(maxFps.attributes('disabled')).toBeDefined()
    expect((maxFps.element as HTMLInputElement).value).toBe('144')
    expect(maxFps.element.parentElement?.classList.contains('is-muted')).toBe(true)
    store.setField('video.performance.frameRateLimitEnabled', true)
    await wrapper.vm.$nextTick()
    expect(maxFps.attributes('disabled')).toBeUndefined()
    expect((maxFps.element as HTMLInputElement).value).toBe('144')
  })

  it('renders Visibility as aligned title, number input, and slider columns', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    const wrapper = mount(GameSettingsVideoPanel)

    const table = wrapper.find('.ew-settings-range-table')
    const rows = table.findAll('tbody > tr')

    expect(rows).toHaveLength(3)
    expect(rows.every((row) => row.findAll('th, td').length === 3)).toBe(true)
    expect(table.findAll('input[type="number"]')).toHaveLength(3)
    expect(table.findAll('input[type="range"]')).toHaveLength(3)
  })
})
