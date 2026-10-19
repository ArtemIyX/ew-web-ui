import { describe, expect, it } from 'vitest'
import type { GamePlayerCastDeveloperApi } from './gamePlayerCastDeveloperApi'
import { installGamePlayerCastDeveloperApi } from './gamePlayerCastDeveloperApi'

const api = {} as GamePlayerCastDeveloperApi

describe('installGamePlayerCastDeveloperApi', () => {
  it('preserves sibling APIs and removes only its own registration', () => {
    const target = { ew: { other: true } } as unknown as Window
    const cleanup = installGamePlayerCastDeveloperApi(api, target)

    expect(target.ew?.playerCast).toBe(api)
    expect((target.ew as unknown as { other: boolean }).other).toBe(true)

    cleanup()
    expect(target.ew?.playerCast).toBeUndefined()
    expect((target.ew as unknown as { other: boolean }).other).toBe(true)
  })

  it('does not remove a replacement API during stale cleanup', () => {
    const target = { ew: {} } as unknown as Window
    const cleanup = installGamePlayerCastDeveloperApi(api, target)
    const replacement = {} as GamePlayerCastDeveloperApi
    target.ew!.playerCast = replacement

    cleanup()
    expect(target.ew?.playerCast).toBe(replacement)
  })
})
