import { describe, expect, it } from 'vitest'
import { abilityCastElapsedMs, abilityCastProgress, abilityCastRemainingTenths, formatAbilityCastRemaining } from './abilityCastTime'
import type { AbilityCastSnapshot } from '@/views/game/types/gameAbilityCast'

const cast: AbilityCastSnapshot = { castId: 'cast', abilityId: 'ability', abilityName: 'Ability', startedAtMs: 1000, endsAtMs: 2200 }
describe('ability cast time utilities', () => {
  it('clamps elapsed progress at both ends', () => {
    expect(abilityCastElapsedMs(cast, 900)).toBe(0)
    expect(abilityCastProgress(cast, 1600)).toBe(0.5)
    expect(abilityCastProgress(cast, 3000)).toBe(1)
  })
  it('keeps positive remaining time visible in tenths', () => {
    expect(abilityCastRemainingTenths(cast, 2101)).toBe(0.1)
    expect(formatAbilityCastRemaining(cast, 2101)).toBe('0.1s')
    expect(formatAbilityCastRemaining(cast, 2200)).toBe('0.0s')
  })
})
