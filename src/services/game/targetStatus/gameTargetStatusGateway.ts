import type {
  GameTargetStatusRuntimeEvent,
  GameTargetStatusSnapshot,
} from '@/views/game/types/gameTargetStatus'

export interface GameTargetStatusGateway {
  load(): Promise<GameTargetStatusSnapshot>
  subscribe(listener: (event: GameTargetStatusRuntimeEvent) => void): () => void
}

export interface GameTargetStatusHostTransport {
  loadTargetStatus(): Promise<GameTargetStatusSnapshot>
  subscribeTargetStatus(listener: (event: GameTargetStatusRuntimeEvent) => void): () => void
}
