import type { GameSettingsGateway } from './gameSettingsGateway'

export interface GameSettingsHostTransport {
  loadGameSettings(): ReturnType<GameSettingsGateway['load']>
  applyGameSettings: GameSettingsGateway['apply']
  confirmDisplayPreview: GameSettingsGateway['confirmDisplayPreview']
  revertDisplayPreview: GameSettingsGateway['revertDisplayPreview']
  subscribeGameSettings: GameSettingsGateway['subscribe']
}
export class ConnectedGameSettingsGateway implements GameSettingsGateway {
  constructor(private readonly transport: GameSettingsHostTransport) {}
  load() {
    return this.transport.loadGameSettings()
  }
  apply(request: Parameters<GameSettingsGateway['apply']>[0]) {
    return this.transport.applyGameSettings(request)
  }
  confirmDisplayPreview(token: string) {
    return this.transport.confirmDisplayPreview(token)
  }
  revertDisplayPreview(token: string) {
    return this.transport.revertDisplayPreview(token)
  }
  subscribe(listener: Parameters<GameSettingsGateway['subscribe']>[0]) {
    return this.transport.subscribeGameSettings(listener)
  }
}
