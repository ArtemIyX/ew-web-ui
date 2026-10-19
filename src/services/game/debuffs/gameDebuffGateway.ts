import type { GameDebuffRuntimeEvent, GameDebuffSnapshot } from '@/views/game/types/gameDebuffs'
export interface GameDebuffGateway {
  load(): Promise<GameDebuffSnapshot>
  subscribe(listener: (event: GameDebuffRuntimeEvent) => void): () => void
}
