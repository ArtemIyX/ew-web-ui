import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { ConnectedGamePartyGateway } from './connectedGamePartyGateway'
import { DisconnectedGamePartyGateway } from './disconnectedGamePartyGateway'
import type { GamePartyGateway, GamePartyHostTransport } from './gamePartyGateway'

let connectedGateway: GamePartyGateway | null = null
const disconnectedGateway = new DisconnectedGamePartyGateway()

export function configureConnectedGamePartyGateway(transport: GamePartyHostTransport): void {
  connectedGateway = new ConnectedGamePartyGateway(transport)
}

export function configureGamePartyGateway(gateway: GamePartyGateway): void {
  connectedGateway = gateway
}

export function getGamePartyGateway(): GamePartyGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
