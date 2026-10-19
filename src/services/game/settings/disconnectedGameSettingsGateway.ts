import type {
  DisplayResolution,
  GameSettingsCapabilities,
  GameSettingsSnapshot,
} from '@/views/game/types/gameSettings'
import { cloneSettings, resolutionKey } from '@/views/game/types/gameSettings'
import {
  applyPatch,
  normalizeSettings,
  validateSnapshot,
  type RuntimeValidationIssue,
} from './gameSettingsValidation'
import type {
  ApplyGameSettingsRequest,
  ApplyGameSettingsResult,
  GameSettingsGateway,
  LoadGameSettingsResult,
} from './gameSettingsGateway'

const storageKey = 'ew.game-settings.disconnected.v1'
const previewDurationMs = 15000
const qualityGroups = [
  'viewDistance',
  'antiAliasingQuality',
  'shadowQuality',
  'globalIlluminationQuality',
  'reflectionQuality',
  'postProcessQuality',
  'textureQuality',
  'effectsQuality',
  'foliageQuality',
  'shadingQuality',
  'landscapeQuality',
] as const
const numeric = (min: number, max: number, step: number, defaultValue: number) => ({
  min,
  max,
  step,
  defaultValue,
})
const resolutions: DisplayResolution[] = [
  { width: 1280, height: 720, refreshRateHz: 60 },
  { width: 1920, height: 1080, refreshRateHz: 60 },
  { width: 2560, height: 1440, refreshRateHz: 144 },
]
const defaults: GameSettingsSnapshot = {
  schemaVersion: 1,
  revision: 1,
  video: {
    display: { windowMode: 'fullscreen', resolution: resolutions[1]! },
    visibility: { brightness: 1, characterVisibility: 100, npcVisibility: 100 },
    graphics: {
      overallQuality: 'high',
      viewDistance: 'high',
      antiAliasingQuality: 'high',
      antiAliasingMethod: 'taa',
      shadowQuality: 'high',
      globalIlluminationQuality: 'high',
      reflectionQuality: 'high',
      postProcessQuality: 'high',
      textureQuality: 'high',
      effectsQuality: 'high',
      foliageQuality: 'high',
      shadingQuality: 'high',
      landscapeQuality: 'high',
    },
    superResolution: { method: 'native', dlssMode: 'quality', frameGenerationMode: 'off' },
    outline: {
      outlineThickness: 1,
      outlineCurve: 0.5,
      highlightThicknessNear: 1,
      highlightThicknessFar: 0.5,
      highlightBrightness: 1,
    },
    performance: {
      vSyncEnabled: true,
      frameRateLimitEnabled: true,
      maxFps: 120,
      fieldOfView: 90,
      renderScalePercent: 100,
    },
  },
  input: { cameraSensitivity: 1, zoomSensitivity: 1 },
}
const capabilities: GameSettingsCapabilities = {
  schemaVersion: 1,
  platform: 'disconnected-sample',
  resolutions,
  windowModes: ['fullscreen', 'borderless', 'windowed'],
  qualityLevels: ['low', 'medium', 'high', 'epic', 'cinematic'],
  graphicsGroups: ['overallQuality', ...qualityGroups],
  antiAliasingMethods: ['none', 'fxaa', 'taa', 'tsr'],
  superResolutionMethods: ['native', 'dlss'],
  dlss: {
    supported: true,
    modes: ['dlaa', 'quality', 'balanced', 'performance', 'ultra-performance'],
  },
  frameGeneration: {
    supported: true,
    modes: ['off', '2x', '3x', '4x'],
    requiresDlssSuperResolution: true,
  },
  ranges: {
    brightness: numeric(0.5, 1.5, 0.01, 1),
    characterVisibility: numeric(0, 100, 1, 100),
    npcVisibility: numeric(0, 100, 1, 100),
    outlineThickness: numeric(0, 4, 0.1, 1),
    outlineCurve: numeric(0, 1, 0.01, 0.5),
    highlightThicknessNear: numeric(0, 4, 0.1, 1),
    highlightThicknessFar: numeric(0, 4, 0.1, 0.5),
    highlightBrightness: numeric(0, 2, 0.01, 1),
    maxFps: numeric(1, 999, 1, 120),
    fieldOfView: numeric(40, 140, 1, 90),
    renderScalePercent: numeric(20, 200, 1, 100),
    cameraSensitivity: numeric(0.1, 5, 0.1, 1),
    zoomSensitivity: numeric(0.1, 5, 0.1, 1),
  },
}
function readStored(): GameSettingsSnapshot {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey)
    if (raw) {
      const candidate = JSON.parse(raw) as GameSettingsSnapshot
      if (
        candidate?.schemaVersion === 1 &&
        Number.isInteger(candidate.revision) &&
        validateSnapshot(candidate, capabilities).length === 0
      )
        return normalizeSettings(candidate, capabilities)
    }
  } catch {
    /* fall back to safe sample defaults */
  }
  return cloneSettings(defaults)
}
function writeStored(snapshot: GameSettingsSnapshot): void {
  try {
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(snapshot))
  } catch {
    /* storage is optional in development */
  }
}
export class DisconnectedGameSettingsGateway implements GameSettingsGateway {
  private current = readStored()
  private listeners = new Set<(snapshot: GameSettingsSnapshot) => void>()
  private previews = new Map<
    string,
    { previous: GameSettingsSnapshot; current: GameSettingsSnapshot; expiresAtMs: number }
  >()
  private requests = new Map<string, ApplyGameSettingsResult>()
  async load(): Promise<LoadGameSettingsResult> {
    return {
      capabilities: cloneSettings(capabilities),
      defaults: cloneSettings(defaults),
      current: cloneSettings(this.current),
    }
  }
  async apply(request: ApplyGameSettingsRequest): Promise<ApplyGameSettingsResult> {
    const prior = this.requests.get(request.requestId)
    if (prior) return cloneSettings(prior)
    if (request.baseRevision !== this.current.revision)
      return { kind: 'revision-conflict', current: cloneSettings(this.current) }
    const next = normalizeSettings(applyPatch(this.current, request.patch), capabilities)
    const issues = validateSnapshot(next, capabilities) as RuntimeValidationIssue[]
    if (issues.length > 0) return { kind: 'rejected', issues, current: cloneSettings(this.current) }
    const hasDisplayChange =
      resolutionKey(next.video.display.resolution) !==
        resolutionKey(this.current.video.display.resolution) ||
      next.video.display.windowMode !== this.current.video.display.windowMode
    if (hasDisplayChange) {
      const previewToken = `preview-${Date.now()}`
      const expiresAtMs = Date.now() + previewDurationMs
      const result = {
        kind: 'display-preview' as const,
        previewToken,
        expiresAtMs,
        currentPreview: { ...cloneSettings(next), revision: this.current.revision },
      }
      this.previews.set(previewToken, {
        previous: cloneSettings(this.current),
        current: result.currentPreview,
        expiresAtMs,
      })
      this.requests.set(request.requestId, result)
      return cloneSettings(result)
    }
    this.current = { ...next, revision: this.current.revision + 1 }
    writeStored(this.current)
    this.emit()
    const result = { kind: 'applied' as const, current: cloneSettings(this.current) }
    this.requests.set(request.requestId, result)
    return cloneSettings(result)
  }
  async confirmDisplayPreview(token: string): Promise<GameSettingsSnapshot> {
    const preview = this.previews.get(token)
    if (!preview) return cloneSettings(this.current)
    if (Date.now() >= preview.expiresAtMs) {
      this.previews.delete(token)
      return cloneSettings(this.current)
    }
    this.current = { ...preview.current, revision: this.current.revision + 1 }
    writeStored(this.current)
    this.previews.delete(token)
    this.emit()
    return cloneSettings(this.current)
  }
  async revertDisplayPreview(token: string): Promise<GameSettingsSnapshot> {
    const preview = this.previews.get(token)
    if (preview) {
      this.current = cloneSettings(preview.previous)
      this.previews.delete(token)
      this.emit()
    }
    return cloneSettings(this.current)
  }
  subscribe(listener: (snapshot: GameSettingsSnapshot) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  private emit(): void {
    const snapshot = cloneSettings(this.current)
    this.listeners.forEach((listener) => listener(snapshot))
  }
}
