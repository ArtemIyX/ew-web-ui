import type {
  DeepPartial,
  GameSettingsCapabilities,
  GameSettingsSnapshot,
} from '@/views/game/types/gameSettings'
import type { RuntimeValidationIssue } from './gameSettingsValidation'

export interface LoadGameSettingsResult {
  capabilities: GameSettingsCapabilities
  defaults: GameSettingsSnapshot
  current: GameSettingsSnapshot
}
export interface ApplyGameSettingsRequest {
  requestId: string
  baseRevision: number
  patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>>
  origin: 'settings-window' | 'developer-api'
}
export type ApplyGameSettingsResult =
  | { kind: 'applied'; current: GameSettingsSnapshot }
  | {
      kind: 'display-preview'
      previewToken: string
      expiresAtMs: number
      currentPreview: GameSettingsSnapshot
    }
  | { kind: 'revision-conflict'; current: GameSettingsSnapshot }
  | { kind: 'rejected'; issues: RuntimeValidationIssue[]; current: GameSettingsSnapshot }
export interface GameSettingsGateway {
  load(): Promise<LoadGameSettingsResult>
  apply(request: ApplyGameSettingsRequest): Promise<ApplyGameSettingsResult>
  confirmDisplayPreview(token: string): Promise<GameSettingsSnapshot>
  revertDisplayPreview(token: string): Promise<GameSettingsSnapshot>
  subscribe(listener: (snapshot: GameSettingsSnapshot) => void): () => void
}
