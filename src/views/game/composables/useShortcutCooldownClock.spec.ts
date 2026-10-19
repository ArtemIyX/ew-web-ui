import { describe, expect, it } from 'vitest'
import { cooldownProgress, cooldownSeconds } from './useShortcutCooldownClock'

describe('shortcut cooldown calculations', () => {
  it('uses ceiling seconds and clamps progress', () => {
    expect(cooldownSeconds(2500, 1000)).toBe(2)
    expect(cooldownSeconds(1000, 2500)).toBe(0)
    expect(cooldownProgress(1000, 3000, 0)).toBe(0)
    expect(cooldownProgress(1000, 3000, 2000)).toBe(0.5)
    expect(cooldownProgress(1000, 3000, 4000)).toBe(1)
  })
})
