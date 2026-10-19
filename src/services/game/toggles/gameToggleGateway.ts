import type { GameToggleRuntimeEvent, GameToggleSnapshot } from '@/views/game/types/gameToggles'
export interface GameToggleGateway {
  load(): Promise<GameToggleSnapshot>
  subscribe(listener: (event: GameToggleRuntimeEvent) => void): () => void
}
