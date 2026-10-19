import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { DisconnectedGameToggleGateway } from './disconnectedGameToggleGateway'
import type { GameToggleGateway } from './gameToggleGateway'
let connectedGateway: GameToggleGateway | null = null
const disconnectedGateway = new DisconnectedGameToggleGateway()
export function configureConnectedGameToggleGateway(gateway: GameToggleGateway): void {
  connectedGateway = gateway
}
export function getGameToggleGateway(): GameToggleGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
