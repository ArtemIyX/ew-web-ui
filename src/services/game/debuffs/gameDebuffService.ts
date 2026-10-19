import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { DisconnectedGameDebuffGateway } from './disconnectedGameDebuffGateway'
import type { GameDebuffGateway } from './gameDebuffGateway'
let connectedGateway: GameDebuffGateway | null = null
const disconnectedGateway = new DisconnectedGameDebuffGateway()
export function configureConnectedGameDebuffGateway(gateway: GameDebuffGateway): void {
  connectedGateway = gateway
}
export function getGameDebuffGateway(): GameDebuffGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
