export enum RuntimeIntegrationMode { Disconnected = 'disconnected', Connected = 'connected' }
let mode = RuntimeIntegrationMode.Disconnected
export const runtimeIntegrationMode = { get: () => mode, set: (next: RuntimeIntegrationMode) => { mode = next } }
