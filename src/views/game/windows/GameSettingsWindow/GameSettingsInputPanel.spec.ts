import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import GameSettingsInputPanel from './GameSettingsInputPanel.vue'
import { useGameSettingsStore } from '@/stores/gameSettings'

describe('GameSettingsInputPanel camera controls', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders Camera with number inputs and sliders', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    const wrapper = mount(GameSettingsInputPanel)

    const table = wrapper.find('.ew-settings-range-table')

    expect(table.findAll('tbody > tr')).toHaveLength(2)
    expect(table.findAll('input[type="number"]')).toHaveLength(2)
    expect(table.findAll('input[type="range"]')).toHaveLength(2)
  })
})
