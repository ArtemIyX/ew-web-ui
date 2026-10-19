import { describe, expect, it } from 'vitest'
import { DisconnectedGameBuffGateway } from './disconnectedGameBuffGateway'

describe('DisconnectedGameBuffGateway', () => {
  it('does not create runtime data or subscription activity', async () => {
    const gateway = new DisconnectedGameBuffGateway()
    expect(await gateway.load()).toEqual({ revision: 0, buffs: [] })
    expect(gateway.subscribe(() => undefined)()).toBeUndefined()
  })
})
