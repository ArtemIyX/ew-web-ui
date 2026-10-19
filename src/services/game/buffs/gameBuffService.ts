import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { DisconnectedGameBuffGateway } from './disconnectedGameBuffGateway'
import type { GameBuffGateway } from './gameBuffGateway'

let connectedGateway: GameBuffGateway | null = null
const disconnectedGateway = new DisconnectedGameBuffGateway()

export function configureConnectedGameBuffGateway(gateway: GameBuffGateway): void {
  connectedGateway = gateway
}

export function getGameBuffGateway(): GameBuffGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
