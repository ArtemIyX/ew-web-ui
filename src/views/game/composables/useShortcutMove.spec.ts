import { describe, expect, it } from 'vitest'
import { useShortcutMove } from './useShortcutMove'

describe('shortcut movement threshold', () => {
  it('keeps jitter as a click and recognizes a drag', () => {
    const move = useShortcutMove()
    move.begin(4, 10, 10)
    expect(move.update(12, 12, 5)).toBe(false)
    expect(move.update(16, 10, 5)).toBe(true)
    move.cancel()
    expect(move.source.value).toBeNull()
  })
})
