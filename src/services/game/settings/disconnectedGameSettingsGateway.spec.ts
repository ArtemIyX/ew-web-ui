import { describe, expect, it } from 'vitest'
import { DisconnectedGameSettingsGateway } from './disconnectedGameSettingsGateway'

describe('DisconnectedGameSettingsGateway', () => {
  it('advertises Unreal quality levels including Cinematic', async () => {
    const result = await new DisconnectedGameSettingsGateway().load()
    expect(result.capabilities.qualityLevels).toEqual([
      'low',
      'medium',
      'high',
      'epic',
      'cinematic',
    ])
    expect(result.capabilities.ranges.maxFps).toMatchObject({ min: 1, max: 999 })
    expect(result.capabilities.ranges.fieldOfView).toMatchObject({ min: 40, max: 140 })
    expect(result.capabilities.ranges.renderScalePercent).toMatchObject({ min: 20, max: 200 })
  })
})
