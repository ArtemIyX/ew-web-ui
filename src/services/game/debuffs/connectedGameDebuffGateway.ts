import type { GameDebuffHostTransport } from '@/views/game/types/gameDebuffs'
import type { GameDebuffGateway } from './gameDebuffGateway'
export class ConnectedGameDebuffGateway implements GameDebuffGateway {
  constructor(private readonly transport: GameDebuffHostTransport) {}
  load() {
    return this.transport.loadGameDebuffs()
  }
  subscribe(listener: Parameters<GameDebuffHostTransport['subscribeGameDebuffs']>[0]) {
    return this.transport.subscribeGameDebuffs(listener)
  }
}
