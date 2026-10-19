import type { GameToggleHostTransport } from '@/views/game/types/gameToggles'
import type { GameToggleGateway } from './gameToggleGateway'
export class ConnectedGameToggleGateway implements GameToggleGateway {
  constructor(private readonly transport: GameToggleHostTransport) {}
  load() {
    return this.transport.loadGameToggles()
  }
  subscribe(listener: Parameters<GameToggleHostTransport['subscribeGameToggles']>[0]) {
    return this.transport.subscribeGameToggles(listener)
  }
}
