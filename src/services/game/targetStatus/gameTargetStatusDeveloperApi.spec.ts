import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createGameTargetStatusDeveloperApi } from './gameTargetStatusDeveloperApi'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { createSamplePlayerTarget } from '@/views/game/types/gameTargetStatusFixtures'

describe('game target status developer API', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('supports guarded target, health, and cast mutations', () => {
    const api = createGameTargetStatusDeveloperApi()
    expect(api.selectTarget(createSamplePlayerTarget()).ok).toBe(true)
    expect(api.setHealth(500, 1000).ok).toBe(true)
    expect(api.startCast({ castId: 'cast-1', abilityId: 'ability-1', abilityName: 'Sample Ability', durationMs: 1200, nowMs: 1000 }).ok).toBe(true)
    expect(useGameTargetStatusStore().target?.hp.current).toBe(500)
    expect(useGameTargetStatusStore().target?.activeCast?.endsAtMs).toBe(2200)
  })

  it('returns defensive target values and rejects invalid duration', () => {
    const api = createGameTargetStatusDeveloperApi()
    api.selectTarget(createSamplePlayerTarget())
    const copy = api.getTarget()!
    copy.displayName = 'Changed copy'
    expect(api.getTarget()?.displayName).toBe('Sample Target')
    expect(api.startCast({ castId: 'cast-2', abilityId: 'ability-2', abilityName: 'Invalid', durationMs: 0 })).toMatchObject({ ok: false, error: 'invalid-duration' })
    expect(api.clearTarget().ok).toBe(true)
    expect(api.setHealth(1).ok).toBe(false)
  })
})
