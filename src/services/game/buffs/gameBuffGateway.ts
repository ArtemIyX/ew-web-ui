import type { GameBuffRuntimeEvent, GameBuffSnapshot } from '@/views/game/types/gameBuffs'

export interface GameBuffGateway {
  load(): Promise<GameBuffSnapshot>
  subscribe(listener: (event: GameBuffRuntimeEvent) => void): () => void
}
