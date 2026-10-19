import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { configureConnectedGameBuffGateway, getGameBuffGateway } from './gameBuffService'
import type { GameBuffGateway } from './gameBuffGateway'

describe('game buff service', () => {
  beforeEach(() => runtimeIntegrationMode.set(RuntimeIntegrationMode.Disconnected))
  afterEach(() => runtimeIntegrationMode.set(RuntimeIntegrationMode.Disconnected))

  it('uses a configured gateway only in connected mode', () => {
    const configured: GameBuffGateway = {
      load: async () => ({ revision: 1, buffs: [] }),
      subscribe: () => () => undefined,
    }
    configureConnectedGameBuffGateway(configured)
    expect(getGameBuffGateway()).not.toBe(configured)
    runtimeIntegrationMode.set(RuntimeIntegrationMode.Connected)
    expect(getGameBuffGateway()).toBe(configured)
  })
})
