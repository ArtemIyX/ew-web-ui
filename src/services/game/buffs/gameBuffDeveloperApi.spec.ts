import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameBuffsStore } from '@/stores/gameBuffs'
import { createGameBuffDeveloperApi } from './gameBuffDeveloperApi'

describe('game buff developer api', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('fills defaults and protects queried snapshots', () => {
    const api = createGameBuffDeveloperApi({ now: () => 1_000, allowMutations: () => true })
    const result = api.addBuff({
      buffId: 'debug-1',
      definition: {
        skillId: 'skill-1',
        name: 'Debug buff',
        icon: { kind: 'local', src: '/buff.svg' },
        level: 1,
      },
    })
    expect(result).toMatchObject({ ok: true })
    expect(api.getBuff('debug-1')?.appliedAtMs).toBe(1_000)
    const snapshot = api.getSnapshot()
    snapshot.buffs[0]!.definition.name = 'Changed'
    expect(api.getBuff('debug-1')?.definition.name).toBe('Debug buff')
  })

  it('rejects mutations when the connected production guard is closed', () => {
    const api = createGameBuffDeveloperApi({ allowMutations: () => false })
    expect(api.clearBuffs()).toEqual({ ok: false, error: 'developer-mutations-disabled' })
  })

  it('updates end times and emits defensive snapshots for runtime changes', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const api = createGameBuffDeveloperApi({
      now: () => 1_000,
      allowMutations: () => true,
    })
    api.addBuff({
      buffId: 'timed',
      definition: {
        skillId: 'skill-timed',
        name: 'Timed buff',
        icon: { kind: 'local', src: '/buff.svg' },
        level: 1,
      },
      endsAtMs: 5_000,
    })
    const received: number[] = []
    const unsubscribe = api.subscribe((snapshot) => received.push(snapshot.buffs.length))
    expect(api.setRemainingTime('timed', 3_000, 2_000).ok).toBe(true)
    expect(api.adjustEndTime('timed', 1_000).ok).toBe(true)
    expect(api.makePermanent('timed').ok).toBe(true)
    expect(api.adjustEndTime('timed', 1_000)).toMatchObject({ ok: false })
    expect(received).toEqual([1, 1, 1])
    unsubscribe()
  })
})
