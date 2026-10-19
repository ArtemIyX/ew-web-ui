import type { GameToggleGateway } from './gameToggleGateway'
import type { GameToggleRuntimeEvent } from '@/views/game/types/gameToggles'
export class DisconnectedGameToggleGateway implements GameToggleGateway {
  load() {
    return Promise.resolve({ revision: 0, toggles: [] })
  }
  subscribe(_listener: (event: GameToggleRuntimeEvent) => void) {
    return () => undefined
  }
}
