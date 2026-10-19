import { describe, expect, it } from 'vitest'
import { DisconnectedGameSettingsGateway } from './disconnectedGameSettingsGateway'
import { applyPatch, normalizeResolutions } from './gameSettingsValidation'

describe('game settings validation', () => {
  it('sorts and de-duplicates resolution capabilities', () => {
    expect(normalizeResolutions([{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 1920, height: 1080 }])).toEqual([{ width: 1280, height: 720 }, { width: 1920, height: 1080 }])
  })
  it('merges a partial patch without losing unrelated values', async () => {
    const gateway = new DisconnectedGameSettingsGateway()
    const loaded = await gateway.load()
    const next = applyPatch(loaded.current, { video: { performance: { maxFps: 60 } } })
    expect(next.video.performance.maxFps).toBe(60)
    expect(next.video.visibility.brightness).toBe(loaded.current.video.visibility.brightness)
  })
})
