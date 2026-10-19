import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createGamePlayerCastDeveloperApi } from './gamePlayerCastDeveloperApi'
import { usePlayerAbilityCastStore } from '@/stores/playerAbilityCast'

describe('game player cast developer API', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    vi.setSystemTime(1000)
  })

  afterEach(() => {
    usePlayerAbilityCastStore().dispose()
    vi.useRealTimers()
  })

  it('starts, inspects, and defensively returns a cast', () => {
    const api = createGamePlayerCastDeveloperApi()
    const result = api.startCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      durationMs: 4000,
      nowMs: 1000,
    })

    expect(result).toMatchObject({ ok: true, revision: 1 })
    expect(api.getCast()).toMatchObject({ startedAtMs: 1000, endsAtMs: 5000 })
    const copy = api.getCast()!
    copy.abilityName = 'Changed'
    expect(api.getCast()?.abilityName).toBe('Sample Ability')
  })

  it('rebases progress and timing while preserving the cast duration', () => {
    const api = createGamePlayerCastDeveloperApi()
    api.startCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      durationMs: 4000,
      nowMs: 1000,
    })

    expect(api.setProgress(50, 3000)).toMatchObject({ ok: true })
    expect(api.getCast()).toMatchObject({ startedAtMs: 1000, endsAtMs: 5000 })
    expect(api.setElapsedTime(1000, 4000)).toMatchObject({ ok: true })
    expect(api.getCast()).toMatchObject({ startedAtMs: 3000, endsAtMs: 7000 })
    expect(api.setRemainingTime(2500, 4000)).toMatchObject({ ok: true })
    expect(api.getCast()?.endsAtMs).toBe(6500)
    expect(api.adjustEndTime(500)).toMatchObject({ ok: true })
    expect(api.getCast()?.endsAtMs).toBe(7000)
  })

  it('freezes on pause and shifts the complete timing window on resume', () => {
    const api = createGamePlayerCastDeveloperApi()
    api.startCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      durationMs: 4000,
      nowMs: 1000,
    })

    expect(api.pauseCast(2000)).toMatchObject({ ok: true })
    expect(api.getStatus().phase).toBe('paused')
    expect(api.resumeCast(5000)).toMatchObject({ ok: true })
    expect(api.getCast()).toMatchObject({ startedAtMs: 4000, endsAtMs: 8000 })
    expect(api.getStatus().phase).toBe('casting')
  })

  it.each([
    ['finishCast', 'finished'],
    ['cancelCast', 'cancelled'],
    ['interruptCast', 'interrupted'],
  ] as const)('records the %s termination outcome', (method, reason) => {
    const api = createGamePlayerCastDeveloperApi()
    api.startCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      durationMs: 4000,
      nowMs: 1000,
    })

    expect(api[method]()).toMatchObject({ ok: true, revision: 2 })
    expect(usePlayerAbilityCastStore().terminationReason).toBe(reason)
    expect(api.getCast()).toBeNull()
  })

  it('notifies subscribers and rejects invalid input without advancing revision', () => {
    const api = createGamePlayerCastDeveloperApi()
    const revisions: number[] = []
    const unsubscribe = api.subscribe((snapshot) => revisions.push(snapshot.revision), {
      emitCurrent: true,
    })

    expect(
      api.startCast({
        castId: '',
        abilityId: 'ability-1',
        abilityName: 'Sample Ability',
        durationMs: 4000,
      }),
    ).toMatchObject({ ok: false, error: 'invalid-cast' })
    expect(api.setProgress(101)).toMatchObject({ ok: false, error: 'invalid-progress' })
    expect(api.getSnapshot().revision).toBe(0)
    expect(revisions).toEqual([0])
    unsubscribe()
  })

  it('finishes naturally when the cast deadline is reached', async () => {
    const api = createGamePlayerCastDeveloperApi()
    api.startCast({
      castId: 'cast-1',
      abilityId: 'ability-1',
      abilityName: 'Sample Ability',
      durationMs: 1200,
      nowMs: 1000,
    })

    await vi.advanceTimersByTimeAsync(1200)
    expect(api.getCast()).toBeNull()
    expect(api.getSnapshot().terminationReason).toBe('finished')
    expect(api.getSnapshot().revision).toBe(2)
  })
})
