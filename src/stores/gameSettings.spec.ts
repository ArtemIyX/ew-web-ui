import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameSettingsStore } from './gameSettings'

describe('game settings store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  it('keeps authoritative and draft state separate until apply', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    const initial = store.authoritative!.video.performance.maxFps
    store.setField('video.performance.maxFps', 60)
    expect(store.draft!.video.performance.maxFps).toBe(60)
    expect(store.authoritative!.video.performance.maxFps).toBe(initial)
    expect(store.isDirty).toBe(true)
    expect((await store.apply()).kind).toBe('applied')
    expect(store.lastApplied!.video.performance.maxFps).toBe(60)
  })
  it('applies dependency rules in the draft', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    store.setField('video.superResolution.method', 'dlss')
    store.setField('video.superResolution.dlssMode', 'dlaa')
    expect(store.draft!.video.performance.renderScalePercent).toBe(100)
    expect(store.isRenderScaleDisabled).toBe(true)
  })
  it('marks overall quality custom when one quality group diverges', async () => {
    const store = useGameSettingsStore()
    await store.initialize()
    store.setField('video.graphics.shadowQuality', 'low')
    expect(store.draft!.video.graphics.overallQuality).toBe('custom')
    store.setField('video.graphics.overallQuality', 'cinematic')
    expect(store.draft!.video.graphics.overallQuality).toBe('cinematic')
    expect(store.draft!.video.graphics.shadowQuality).toBe('cinematic')
  })
})
