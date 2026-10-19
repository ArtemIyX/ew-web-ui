import type { GameTargetStatusGateway, GameTargetStatusHostTransport } from './gameTargetStatusGateway'
import type { GameTargetStatusRuntimeEvent, GameTargetStatusSnapshot } from '@/views/game/types/gameTargetStatus'

export class ConnectedGameTargetStatusGateway implements GameTargetStatusGateway {
  public constructor(private readonly transport: GameTargetStatusHostTransport) {}
  public load(): Promise<GameTargetStatusSnapshot> { return this.transport.loadTargetStatus() }
  public subscribe(listener: (event: GameTargetStatusRuntimeEvent) => void): () => void {
    return this.transport.subscribeTargetStatus(listener)
  }
}
