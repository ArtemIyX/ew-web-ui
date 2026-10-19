import { describe, expect, it } from 'vitest'
import { CHAT_MIN_SIZE, clampChatSize } from './useChatResize'

describe('clampChatSize', () => {
  it('keeps the widget within its minimum size', () => {
    expect(clampChatSize({ inline: 1, block: 1 }, 1000, 1000)).toEqual(CHAT_MIN_SIZE)
  })

  it('limits the widget to the usable viewport', () => {
    expect(clampChatSize({ inline: 1000, block: 1000 }, 400, 300)).toEqual({
      inline: 384,
      block: 284,
    })
  })
})
