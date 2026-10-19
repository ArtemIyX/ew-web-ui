import { beforeEach, describe, expect, it } from 'vitest'
import { WINDOW_LAYOUT_KEY, readWindowLayouts, writeWindowLayouts } from './persistence'

describe('window layout persistence', () => {
  let storage: Storage
  beforeEach(() => {
    const data = new Map<string, string>()
    storage = {
      getItem(key: string) {
        return data.get(key) ?? null
      },
      setItem(key: string, value: string) {
        data.set(key, value)
      },
      removeItem() {},
      clear() {},
      key() {
        return null
      },
      get length() {
        return data.size
      },
    } as unknown as Storage
  })
  it('recovers valid records when one entry is malformed', () => {
    storage.setItem(
      WINDOW_LAYOUT_KEY,
      JSON.stringify({
        version: 1,
        windows: {
          settings: { x: 1, y: 2, width: 300, height: 200, updatedAt: 1 },
          broken: { width: 'bad' },
        },
      }),
    )
    expect(readWindowLayouts(storage)).toHaveProperty('settings')
    expect(readWindowLayouts(storage)).not.toHaveProperty('broken')
  })
  it('ignores unsupported versions and storage failures', () => {
    storage.setItem(WINDOW_LAYOUT_KEY, JSON.stringify({ version: 99, windows: {} }))
    expect(readWindowLayouts(storage)).toEqual({})
    expect(() =>
      writeWindowLayouts({}, {
        getItem: () => null,
        setItem: () => {
          throw new Error('blocked')
        },
      } as unknown as Storage),
    ).not.toThrow()
  })
})
