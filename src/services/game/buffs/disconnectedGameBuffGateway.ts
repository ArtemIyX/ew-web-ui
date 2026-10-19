import type { GameBuffGateway } from './gameBuffGateway'
import type { GameBuffRuntimeEvent, GameBuffSnapshot } from '@/views/game/types/gameBuffs'

export class DisconnectedGameBuffGateway implements GameBuffGateway {
  load(): Promise<GameBuffSnapshot> {
    return Promise.resolve({ revision: 0, buffs: [] })
  }

  subscribe(_listener: (event: GameBuffRuntimeEvent) => void): () => void {
    return () => undefined
  }
}
