import { describe, expect, it } from 'vitest'
import { ConnectedGameBuffGateway } from './connectedGameBuffGateway'
import { DisconnectedGameBuffGateway } from './disconnectedGameBuffGateway'
import type { GameBuffRuntimeEvent } from '@/views/game/types/gameBuffs'

describe('game buff gateways', () => {
  it('provides an empty disconnected snapshot', async () => {
    const gateway = new DisconnectedGameBuffGateway()
    expect(await gateway.load()).toEqual({ revision: 0, buffs: [] })
    expect(gateway.subscribe(() => undefined)()).toBeUndefined()
  })

  it('delegates connected transport operations', async () => {
    const events: unknown[] = []
    const transport = {
      loadGameBuffs: async () => ({ revision: 2, buffs: [] }),
      subscribeGameBuffs: (listener: (event: GameBuffRuntimeEvent) => void) => {
        events.push(listener)
        return () => {
          events.pop()
        }
      },
    }
    const gateway = new ConnectedGameBuffGateway(transport)
    expect(await gateway.load()).toEqual({ revision: 2, buffs: [] })
    const unsubscribe = gateway.subscribe(() => undefined)
    unsubscribe()
    expect(events).toHaveLength(0)
  })
})
