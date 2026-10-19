import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTargetStatusPresentationStore } from './targetStatusPresentation'

describe('useTargetStatusPresentationStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults to percentage and persists valid local toggles', () => {
    const store = useTargetStatusPresentationStore()
    expect(store.hpDisplayMode).toBe('percentage')
    store.toggleHpDisplayMode()
    expect(store.hpDisplayMode).toBe('exact')
    expect(JSON.parse(localStorage.getItem('ew.target-status.preferences.v1') ?? '{}')).toEqual({ hpDisplayMode: 'exact' })
  })

  it('falls back when stored preferences are malformed', () => {
    localStorage.setItem('ew.target-status.preferences.v1', '{invalid')
    expect(useTargetStatusPresentationStore().hpDisplayMode).toBe('percentage')
  })
})
