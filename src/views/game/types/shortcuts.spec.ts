import { describe, expect, it } from 'vitest'
import { createEmptyShortcutSlots, positionsForRows, visibleRows } from './shortcuts'

describe('shortcut positions', () => {
  it('creates 24 stable positions', () => {
    expect(createEmptyShortcutSlots().map((slot) => slot.position)).toEqual(
      Array.from({ length: 24 }, (_, index) => index + 1),
    )
  })
  it('selects visible rows from the bottom upward', () => {
    expect(positionsForRows(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(visibleRows(2)).toEqual([
      [9, 10, 11, 12, 13, 14, 15, 16],
      [1, 2, 3, 4, 5, 6, 7, 8],
    ])
    expect(visibleRows(3)[0]).toEqual([17, 18, 19, 20, 21, 22, 23, 24])
  })
})
