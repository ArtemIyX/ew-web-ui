import { RuntimeIntegrationMode, runtimeIntegrationMode } from '@/services/runtime/runtimeIntegrationMode'
import { createDisconnectedMenuGateway } from './disconnectedMenuGateway'
import type { MenuGateway } from './menuGateway'
export const menuService: MenuGateway = createDisconnectedMenuGateway()
export function getMenuGateway(): MenuGateway { if(runtimeIntegrationMode.get() === RuntimeIntegrationMode.Disconnected) return menuService; return menuService }
