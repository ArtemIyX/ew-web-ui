import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStatusStore } from './playerStatus'

describe('player status store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('normalizes invalid resource values and toggles independent display modes', () => {
    const store = usePlayerStatusStore()
    store.replaceSnapshot({ ...store.snapshot, hp: { current: 120, maximum: 100 } })
    expect(store.normalized('hp')).toEqual({
      current: 100,
      maximum: 100,
      ratio: 1,
      percentage: 100,
    })
    expect(store.preferences.resourceModes.hp).toBe('exact')
    store.toggleResourceMode('hp')
    expect(store.preferences.resourceModes.hp).toBe('percentage')
  })

  it('falls back when persisted preferences are malformed', () => {
    localStorage.setItem('ew.player-status.preferences.v1', '{bad json')
    const store = usePlayerStatusStore()
    expect(store.preferences.resourceModes).toEqual({
      hp: 'exact',
      mp: 'percentage',
      energy: 'percentage',
    })
  })
})
