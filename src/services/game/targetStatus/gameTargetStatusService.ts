import { RuntimeIntegrationMode, runtimeIntegrationMode } from '@/services/runtime/runtimeIntegrationMode'
import { ConnectedGameTargetStatusGateway } from './connectedGameTargetStatusGateway'
import { DisconnectedGameTargetStatusGateway } from './disconnectedGameTargetStatusGateway'
import type { GameTargetStatusGateway, GameTargetStatusHostTransport } from './gameTargetStatusGateway'

let connectedGateway: GameTargetStatusGateway | null = null
const disconnectedGateway = new DisconnectedGameTargetStatusGateway()

export function configureConnectedGameTargetStatusGateway(transport: GameTargetStatusHostTransport): void {
  connectedGateway = new ConnectedGameTargetStatusGateway(transport)
}
export function configureGameTargetStatusGateway(gateway: GameTargetStatusGateway): void {
  connectedGateway = gateway
}
export function getGameTargetStatusGateway(): GameTargetStatusGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
