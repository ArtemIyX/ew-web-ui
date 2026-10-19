import { describe, expect, it } from 'vitest'
import { clampRect, cascadePosition, moveRect, resizeRect, resolveInitialRect } from './geometry'

describe('window geometry', () => {
  const viewport = { width: 800, height: 600 }
  const rect = { x: 100, y: 100, width: 300, height: 200 }
  it('clamps invalid positions and dimensions', () => {
    expect(
      clampRect({ x: -10, y: 900, width: Number.NaN, height: 900 }, viewport, {
        minWidth: 200,
        minHeight: 100,
        maxWidth: 500,
        maxHeight: 400,
      }),
    ).toEqual({ x: 0, y: 200, width: 200, height: 400 })
  })
  it('preserves pointer offset while moving', () => {
    expect(moveRect(rect, { x: 150, y: 180 }, { x: 50, y: 80 }, viewport)).toEqual(rect)
  })
  it('resizes from the bottom-right corner only', () => {
    expect(resizeRect(rect, { x: 100, y: 50 }, viewport)).toEqual({
      ...rect,
      width: 400,
      height: 250,
    })
  })
  it('cascades new windows without crossing the viewport edge', () => {
    expect(cascadePosition(viewport, { width: 400, height: 300 }, 20)).toEqual({ x: 400, y: 300 })
  })
  it('anchors a default window above the bottom center of the viewport', () => {
    expect(
      resolveInitialRect(
        undefined,
        viewport,
        { width: 320, height: 64 },
        { anchor: 'bottom-center', insetBlockEnd: 96 },
        { minHeight: 1 },
      ),
    ).toEqual({ x: 240, y: 440, width: 320, height: 64 })
  })
})
