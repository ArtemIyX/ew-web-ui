import {
  RuntimeIntegrationMode,
  runtimeIntegrationMode,
} from '@/services/runtime/runtimeIntegrationMode'
import { DisconnectedGameSettingsGateway } from './disconnectedGameSettingsGateway'
import type { GameSettingsGateway } from './gameSettingsGateway'
let connectedGateway: GameSettingsGateway | null = null
const disconnectedGateway = new DisconnectedGameSettingsGateway()
export function configureConnectedGameSettingsGateway(gateway: GameSettingsGateway): void {
  connectedGateway = gateway
}
export function getGameSettingsGateway(): GameSettingsGateway {
  return runtimeIntegrationMode.get() === RuntimeIntegrationMode.Connected && connectedGateway
    ? connectedGateway
    : disconnectedGateway
}
