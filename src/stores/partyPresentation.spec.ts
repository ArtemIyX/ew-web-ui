import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePartyPresentationStore } from './partyPresentation'

describe('usePartyPresentationStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults to visible pinned mode and persists only preferences', () => {
    const store = usePartyPresentationStore()
    expect(store.mode).toBe('pinned')
    expect(store.visible).toBe(true)
    store.toggleMode()
    store.toggleVisible()
    expect(JSON.parse(localStorage.getItem('ew.party-window.preferences.v1')!)).toEqual({
      mode: 'unpinned',
      visible: false,
    })
    expect(localStorage.getItem('ew.party-window.preferences.v1')).not.toContain('member-1')
  })

  it('keeps assignments stable through reorder and frees departed slots', () => {
    const store = usePartyPresentationStore()
    const first = store.reconcileSlots(['a', 'b', 'c'])
    expect(first.map((assignment) => assignment.memberId)).toEqual(['a', 'b', 'c', null, null])
    const reordered = store.reconcileSlots(['c', 'a', 'd'])
    expect(reordered.map((assignment) => assignment.memberId)).toEqual(['a', 'd', 'c', null, null])
  })

  it('falls back safely for malformed persisted preferences', () => {
    localStorage.setItem('ew.party-window.preferences.v1', '{bad json')
    const store = usePartyPresentationStore()
    expect(store.mode).toBe('pinned')
    expect(store.visible).toBe(true)
  })
})
