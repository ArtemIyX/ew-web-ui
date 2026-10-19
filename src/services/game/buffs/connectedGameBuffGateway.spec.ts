import { describe, expect, it } from 'vitest'
import { ConnectedGameBuffGateway } from './connectedGameBuffGateway'

describe('ConnectedGameBuffGateway', () => {
  it('delegates load and subscription operations', async () => {
    let subscribed = false
    const gateway = new ConnectedGameBuffGateway({
      loadGameBuffs: async () => ({ revision: 4, buffs: [] }),
      subscribeGameBuffs: () => {
        subscribed = true
        return () => {
          subscribed = false
        }
      },
    })
    expect(await gateway.load()).toEqual({ revision: 4, buffs: [] })
    const unsubscribe = gateway.subscribe(() => undefined)
    expect(subscribed).toBe(true)
    unsubscribe()
    expect(subscribed).toBe(false)
  })
})
