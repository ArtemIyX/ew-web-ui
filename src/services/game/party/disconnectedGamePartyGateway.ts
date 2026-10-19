import type { GamePartyRuntimeEvent, GamePartySnapshot } from '@/views/game/types/gameParty'
import type { GamePartyGateway } from './gamePartyGateway'

export class DisconnectedGamePartyGateway implements GamePartyGateway {
  load(): Promise<GamePartySnapshot> {
    return Promise.resolve({ revision: 0, members: [] })
  }

  subscribe(_listener: (event: GamePartyRuntimeEvent) => void): () => void {
    return () => undefined
  }
}
