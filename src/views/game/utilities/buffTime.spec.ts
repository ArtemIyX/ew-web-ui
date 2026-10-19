import { describe, expect, it } from 'vitest'
import {
  buffProgress,
  buffRemainingMs,
  buffRemainingSeconds,
  shouldShowBuffCountdown,
} from './buffTime'

describe('buff time helpers', () => {
  it('clamps cooldown progress to the skill cooldown range', () => {
    expect(buffProgress(1_000, 3_000, 0)).toBe(0)
    expect(buffProgress(1_000, 3_000, 2_000)).toBe(0.5)
    expect(buffProgress(1_000, 3_000, 4_000)).toBe(1)
  })

  it('uses the strict final-minute countdown boundary', () => {
    expect(buffRemainingMs(null, 100)).toBeNull()
    expect(shouldShowBuffCountdown(null, 100)).toBe(false)
    expect(shouldShowBuffCountdown(99, 100)).toBe(false)
    expect(shouldShowBuffCountdown(101, 100)).toBe(true)
    expect(shouldShowBuffCountdown(60_099, 100)).toBe(true)
    expect(shouldShowBuffCountdown(60_100, 100)).toBe(false)
  })

  it('rounds visible seconds up without going negative', () => {
    expect(buffRemainingSeconds(1_001, 1_000)).toBe(1)
    expect(buffRemainingSeconds(59_999, 1_000)).toBe(59)
    expect(buffRemainingSeconds(1_000, 1_001)).toBe(0)
  })
})
