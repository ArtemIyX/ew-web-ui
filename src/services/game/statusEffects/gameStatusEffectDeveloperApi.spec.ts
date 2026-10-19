import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameDebuffsStore } from '@/stores/gameDebuffs'
import { createGameStatusEffectDeveloperApi } from './gameStatusEffectDeveloperApi'

function effect(id: string) {
  return {
    id,
    definition: {
      skillId: `${id}-skill`,
      name: id,
      icon: { kind: 'local' as const, src: '/effect.svg' },
      level: 1,
    },
    appliedAtMs: 0,
    endsAtMs: null,
    order: 0,
  }
}

describe('game status-effect developer api', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('returns defensive data and supports optional initial subscription emission', () => {
    const store = useGameDebuffsStore()
    store.replaceSnapshot({ revision: 1, debuffs: [{ ...effect('slow'), debuffId: 'slow' }] })
    const api = createGameStatusEffectDeveloperApi({
      store: {
        revision: { value: store.revision },
        status: { value: store.status },
        lastError: { value: store.lastError },
        lastUpdatedAtMs: { value: store.lastUpdatedAtMs },
        allEffects: { value: [effect('slow')] },
        timedEffects: { value: [] },
        hasTimedEffects: { value: false },
        count: { value: store.count },
        record: (id: string) => (id === 'slow' ? effect(id) : undefined),
        replaceSnapshot: () => true,
        upsert: () => true,
        upsertMany: () => true,
        patch: () => true,
        remove: () => true,
        removeMany: () => true,
        clear: () => true,
        setEndTime: () => true,
        setRemainingTime: () => true,
        adjustEndTime: () => true,
        expireDue: () => [],
        applyRuntimeEvent: () => 'applied',
        refresh: async () => undefined,
      } as never,
    })
    const received: number[] = []
    const unsubscribe = api.subscribe((snapshot) => received.push(snapshot.effects.length), {
      emitCurrent: true,
    })
    const snapshot = api.getSnapshot()
    snapshot.effects[0]!.definition.name = 'changed'
    expect(received).toEqual([1])
    expect(api.getById('slow')?.definition.name).toBe('slow')
    unsubscribe()
  })
})
