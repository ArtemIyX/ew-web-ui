import { describe, expect, it } from 'vitest'
import { normalizeProgress } from './normalizeProgress'

describe('normalizeProgress', () => {
  it('uses the default range and preserves fractional precision', () => {
    expect(normalizeProgress(12.5, 0, 100)).toEqual({
      value: 12.5,
      min: 0,
      max: 100,
      ratio: 0.125,
      percentage: 12.5,
    })
  })

  it('supports non-zero and negative minima', () => {
    expect(normalizeProgress(-25, -50, 50).ratio).toBe(0.25)
  })

  it('clamps values to the inclusive range', () => {
    expect(normalizeProgress(-1, 0, 100).value).toBe(0)
    expect(normalizeProgress(101, 0, 100).value).toBe(100)
  })

  it('resolves invalid values safely', () => {
    expect(normalizeProgress(Number.NaN, 0, 100).value).toBe(0)
    expect(normalizeProgress(Number.POSITIVE_INFINITY, 0, 100).value).toBe(0)
    expect(normalizeProgress(Number.NEGATIVE_INFINITY, 0, 100).value).toBe(0)
  })

  it('returns zero progress for an invalid range', () => {
    expect(normalizeProgress(50, 10, 10)).toEqual({
      value: 10,
      min: 10,
      max: 10,
      ratio: 0,
      percentage: 0,
    })
    expect(normalizeProgress(50, 10, 5).ratio).toBe(0)
  })
})
