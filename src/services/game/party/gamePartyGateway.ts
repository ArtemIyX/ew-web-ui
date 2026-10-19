import type { GamePartyRuntimeEvent, GamePartySnapshot } from '@/views/game/types/gameParty'

export interface GamePartyGateway {
  load(): Promise<GamePartySnapshot>
  subscribe(listener: (event: GamePartyRuntimeEvent) => void): () => void
}

export interface GamePartyHostTransport {
  loadGameParty(): Promise<GamePartySnapshot>
  subscribeGameParty(listener: (event: GamePartyRuntimeEvent) => void): () => void
}
