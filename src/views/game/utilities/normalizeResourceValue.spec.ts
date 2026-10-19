import { describe, expect, it } from 'vitest'
import { normalizeResourceValue } from './normalizeResourceValue'

describe('normalizeResourceValue', () => {
  it('clamps finite values and safely handles invalid ranges', () => {
    expect(normalizeResourceValue({ current: -10, maximum: 100 })).toEqual({
      current: 0,
      maximum: 100,
      percentage: 0,
    })
    expect(normalizeResourceValue({ current: 120, maximum: 100 })).toEqual({
      current: 100,
      maximum: 100,
      percentage: 100,
    })
    expect(normalizeResourceValue({ current: Number.NaN, maximum: 0 })).toEqual({
      current: 0,
      maximum: 0,
      percentage: 0,
    })
  })
})
