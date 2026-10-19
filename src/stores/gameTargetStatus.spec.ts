import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameTargetStatusStore } from './gameTargetStatus'
import { createSamplePlayerTarget, createSampleStructureTarget } from '@/views/game/types/gameTargetStatusFixtures'

describe('useGameTargetStatusStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('replaces targets atomically and ignores patches for another target', () => {
    const store = useGameTargetStatusStore()
    expect(store.replaceSnapshot({ revision: 1, target: createSamplePlayerTarget() })).toBe(true)
    expect(store.applyRuntimeEvent({ kind: 'target-patched', revision: 2, targetId: 'other', patch: { displayName: 'Wrong target' } })).toBe('ignored')
    expect(store.target?.displayName).toBe('Sample Target')
    expect(store.applyRuntimeEvent({ kind: 'target-selected', revision: 2, target: createSampleStructureTarget() })).toBe('applied')
    expect(store.target?.entityKind).toBe('world-structure')
    expect(store.target?.guild).toBeNull()
  })

  it('retains valid state on invalid patches and requests resync on revision gaps', () => {
    const store = useGameTargetStatusStore()
    store.replaceSnapshot({ revision: 4, target: createSamplePlayerTarget() })
    expect(store.applyRuntimeEvent({ kind: 'target-patched', revision: 5, targetId: 'sample-target-player', patch: { hp: { current: -1, maximum: 1000 } } })).toBe('ignored')
    expect(store.target?.hp.current).toBe(730)
    expect(store.applyRuntimeEvent({ kind: 'target-patched', revision: 7, targetId: 'sample-target-player', patch: { displayName: 'Skipped revision' } })).toBe('needs-resync')
    expect(store.status).toBe('stale')
    expect(store.target?.displayName).toBe('Sample Target')
  })

  it('returns defensive snapshots', () => {
    const store = useGameTargetStatusStore()
    store.replaceSnapshot({ revision: 1, target: createSamplePlayerTarget() })
    const snapshot = store.getSnapshot()
    snapshot.target!.displayName = 'Mutated copy'
    expect(store.target?.displayName).toBe('Sample Target')
  })
})
