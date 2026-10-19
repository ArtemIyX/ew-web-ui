import type { GameDebuffGateway } from './gameDebuffGateway'
import type { GameDebuffRuntimeEvent } from '@/views/game/types/gameDebuffs'
export class DisconnectedGameDebuffGateway implements GameDebuffGateway {
  load() {
    return Promise.resolve({ revision: 0, debuffs: [] })
  }
  subscribe(_listener: (event: GameDebuffRuntimeEvent) => void) {
    return () => undefined
  }
}
