import { describe, expect, it } from 'vitest'
import type { GameBuffDeveloperApi } from './gameBuffDeveloperApi'
import { installGameBuffDeveloperApi } from './gameBuffDeveloperApi'

const api = {} as GameBuffDeveloperApi

describe('installGameBuffDeveloperApi', () => {
  it('preserves other namespaces and only cleans up its own instance', () => {
    const target = { ew: { other: { enabled: true } } } as unknown as Window
    const cleanup = installGameBuffDeveloperApi(api, target)
    expect((target.ew as unknown as { other: { enabled: boolean } }).other).toEqual({
      enabled: true,
    })
    expect(target.ew?.buffList).toBe(api)

    cleanup()
    expect((target.ew as unknown as { other: { enabled: boolean } }).other).toEqual({
      enabled: true,
    })
    expect(target.ew?.buffList).toBeUndefined()
  })

  it('does not remove a replacement API during cleanup', () => {
    const target = { ew: {} } as unknown as Window
    const cleanup = installGameBuffDeveloperApi(api, target)
    const replacement = {} as GameBuffDeveloperApi
    target.ew!.buffList = replacement
    cleanup()
    expect(target.ew?.buffList).toBe(replacement)
  })
})
