import type { GamePartyRuntimeEvent, GamePartySnapshot } from '@/views/game/types/gameParty'
import type { GamePartyGateway, GamePartyHostTransport } from './gamePartyGateway'

export class ConnectedGamePartyGateway implements GamePartyGateway {
  public constructor(private readonly transport: GamePartyHostTransport) {}

  public load(): Promise<GamePartySnapshot> {
    return this.transport.loadGameParty()
  }

  public subscribe(listener: (event: GamePartyRuntimeEvent) => void): () => void {
    return this.transport.subscribeGameParty(listener)
  }
}
