import type { GameBuffRuntimeEvent, GameBuffSnapshot } from '@/views/game/types/gameBuffs'
import type { GameBuffGateway } from './gameBuffGateway'

export interface GameBuffHostTransport {
  loadGameBuffs(): Promise<GameBuffSnapshot>
  subscribeGameBuffs(listener: (event: GameBuffRuntimeEvent) => void): () => void
}

export class ConnectedGameBuffGateway implements GameBuffGateway {
  constructor(private readonly transport: GameBuffHostTransport) {}

  load(): Promise<GameBuffSnapshot> {
    return this.transport.loadGameBuffs()
  }

  subscribe(listener: (event: GameBuffRuntimeEvent) => void): () => void {
    return this.transport.subscribeGameBuffs(listener)
  }
}
