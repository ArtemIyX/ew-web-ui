import type { GameTargetStatusGateway } from './gameTargetStatusGateway'
import type { GameTargetStatusRuntimeEvent, GameTargetStatusSnapshot } from '@/views/game/types/gameTargetStatus'

export class DisconnectedGameTargetStatusGateway implements GameTargetStatusGateway {
  public load(): Promise<GameTargetStatusSnapshot> { return Promise.resolve({ revision: 0, target: null }) }
  public subscribe(_listener: (event: GameTargetStatusRuntimeEvent) => void): () => void {
    return () => undefined
  }
}
