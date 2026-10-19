import { describe, expect, it } from 'vitest'
import { computeTooltipPosition, type Rect } from './tooltipPosition'

const anchor: Rect = { top: 100, right: 200, bottom: 140, left: 100, width: 100, height: 40 }
const base = {
  anchor,
  tooltip: { width: 80, height: 40 },
  viewport: { width: 400, height: 300 },
  fallbackPlacements: [] as const,
  offset: 8,
  viewportPadding: 8,
}

describe('computeTooltipPosition', () => {
  it('places a tooltip above the anchor', () => {
    expect(computeTooltipPosition({ ...base, preferredPlacement: 'top' })).toMatchObject({
      x: 110,
      y: 52,
      placement: 'top',
      shifted: false,
    })
  })

  it('uses a fitting fallback before shifting', () => {
    expect(
      computeTooltipPosition({
        ...base,
        anchor: { ...anchor, top: 10, bottom: 50 },
        preferredPlacement: 'top',
        fallbackPlacements: ['bottom'],
      }),
    ).toMatchObject({ placement: 'bottom', y: 58 })
  })

  it('shifts oversized or edge-adjacent content into safe bounds', () => {
    const result = computeTooltipPosition({
      ...base,
      anchor: { ...anchor, left: 0, right: 20 },
      tooltip: { width: 180, height: 40 },
      preferredPlacement: 'bottom',
    })
    expect(result.x).toBe(8)
    expect(result.shifted).toBe(true)
  })

  it('anchors content larger than the viewport to the safe edge', () => {
    const result = computeTooltipPosition({
      ...base,
      tooltip: { width: 500, height: 400 },
      preferredPlacement: 'top',
    })
    expect(result.x).toBe(8)
    expect(result.y).toBe(8)
  })
})
