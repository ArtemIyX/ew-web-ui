import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameBuffsStore } from './gameBuffs'
import type { GameBuffRecord, GameBuffRuntimeEvent } from '@/views/game/types/gameBuffs'
import { configureConnectedGameBuffGateway } from '@/services/game/buffs/gameBuffService'
import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'

const createBuff = (
  buffId: string,
  order: number,
  endsAtMs: number | null = null,
): GameBuffRecord => ({
  buffId,
  definition: {
    skillId: `skill-${buffId}`,
    name: buffId,
    icon: { kind: 'local', src: '/buff.svg' },
    level: 1,
  },
  appliedAtMs: order,
  endsAtMs,
  order,
})

describe('game buffs store', () => {
  beforeEach(() => {
    runtimeIntegrationMode.set(RuntimeIntegrationMode.Disconnected)
    setActivePinia(createPinia())
  })

  it('orders records deterministically and keeps buff identity independent from skill identity', () => {
    const store = useGameBuffsStore()
    const first = createBuff('b', 2)
    const second = {
      ...createBuff('a', 1),
      definition: { ...createBuff('a', 1).definition, skillId: first.definition.skillId },
    }
    expect(store.replaceSnapshot({ revision: 3, buffs: [first, second] })).toBe(true)
    expect(store.allBuffs.map((buff) => buff.buffId)).toEqual(['a', 'b'])
  })

  it('patches immutable skill identity fields without allowing replacement', () => {
    const store = useGameBuffsStore()
    const current = createBuff('buff', 1)
    store.replaceSnapshot({ revision: 1, buffs: [current] })
    expect(
      store.patchBuff('buff', {
        definition: { name: 'Updated', skillId: 'other' } as never,
        endsAtMs: 5_000,
        order: 4,
      }),
    ).toBe(true)
    expect(store.record('buff')?.definition.skillId).toBe(current.definition.skillId)
    expect(store.record('buff')?.definition.name).toBe('Updated')
  })

  it('detects revision gaps, applies expiration locally, and rejects atomic invalid batches', () => {
    const store = useGameBuffsStore()
    const active = createBuff('active', 1, 10_000)
    const permanent = createBuff('permanent', 2)
    store.replaceSnapshot({ revision: 1, buffs: [active, permanent] })
    expect(store.applyRuntimeEvent({ kind: 'clear', revision: 3 })).toBe('needs-resync')
    expect(store.allBuffs).toHaveLength(2)
    expect(store.expireDueBuffs(10_000)).toEqual(['active'])
    expect(store.revision).toBe(1)
    expect(store.upsertBuffs([permanent, { ...active, buffId: '' }])).toBe(false)
    expect(store.allBuffs).toHaveLength(1)
  })

  it('loads, subscribes, resynchronizes revision gaps, and disposes cleanly', async () => {
    const first = createBuff('first', 1)
    const second = createBuff('second', 2)
    let loadCount = 0
    let listener: ((event: GameBuffRuntimeEvent) => void) | undefined
    let unsubscribed = false
    configureConnectedGameBuffGateway({
      load: async () => {
        loadCount += 1
        return { revision: loadCount === 1 ? 1 : 3, buffs: loadCount === 1 ? [first] : [second] }
      },
      subscribe: (nextListener) => {
        listener = nextListener
        return () => {
          unsubscribed = true
        }
      },
    })
    runtimeIntegrationMode.set(RuntimeIntegrationMode.Connected)
    const store = useGameBuffsStore()
    await store.initialize()
    expect(store.status).toBe('ready')
    expect(store.allBuffs.map((buff) => buff.buffId)).toEqual(['first'])
    listener?.({ kind: 'upsert', revision: 2, buff: second })
    expect(store.allBuffs.map((buff) => buff.buffId)).toEqual(['first', 'second'])
    listener?.({ kind: 'clear', revision: 4 })
    await Promise.resolve()
    expect(loadCount).toBe(2)
    expect(store.allBuffs.map((buff) => buff.buffId)).toEqual(['second'])
    store.dispose()
    expect(unsubscribed).toBe(true)
    runtimeIntegrationMode.set(RuntimeIntegrationMode.Disconnected)
  })
})
