export const windowModes = ['fullscreen', 'borderless', 'windowed'] as const
export type WindowMode = (typeof windowModes)[number]

export interface DisplayResolution {
  width: number
  height: number
  refreshRateHz?: number
}

export const qualityLevels = ['low', 'medium', 'high', 'epic', 'cinematic'] as const
export type QualityLevel = (typeof qualityLevels)[number]
export const antiAliasingMethods = ['none', 'fxaa', 'taa', 'tsr', 'smaa'] as const
export type AntiAliasingMethod = (typeof antiAliasingMethods)[number]
export const superResolutionMethods = ['native', 'dlss'] as const
export type SuperResolutionMethod = (typeof superResolutionMethods)[number]
export const dlssModes = [
  'dlaa',
  'quality',
  'balanced',
  'performance',
  'ultra-performance',
] as const
export type DlssMode = (typeof dlssModes)[number]
export const frameGenerationModes = ['off', '2x', '3x', '4x'] as const
export type FrameGenerationMode = (typeof frameGenerationModes)[number]

export interface VideoSettings {
  display: { windowMode: WindowMode; resolution: DisplayResolution }
  visibility: { brightness: number; characterVisibility: number; npcVisibility: number }
  graphics: {
    overallQuality: QualityLevel | 'custom'
    viewDistance: QualityLevel
    antiAliasingQuality: QualityLevel
    antiAliasingMethod: AntiAliasingMethod
    shadowQuality: QualityLevel
    globalIlluminationQuality: QualityLevel
    reflectionQuality: QualityLevel
    postProcessQuality: QualityLevel
    textureQuality: QualityLevel
    effectsQuality: QualityLevel
    foliageQuality: QualityLevel
    shadingQuality: QualityLevel
    landscapeQuality: QualityLevel
  }
  superResolution: {
    method: SuperResolutionMethod
    dlssMode: DlssMode
    frameGenerationMode: FrameGenerationMode
  }
  outline: {
    outlineThickness: number
    outlineCurve: number
    highlightThicknessNear: number
    highlightThicknessFar: number
    highlightBrightness: number
  }
  performance: {
    vSyncEnabled: boolean
    frameRateLimitEnabled: boolean
    maxFps: number
    fieldOfView: number
    renderScalePercent: number
  }
}

export interface InputSettings {
  cameraSensitivity: number
  zoomSensitivity: number
}
export interface GameSettingsSnapshot {
  schemaVersion: 1
  revision: number
  video: VideoSettings
  input: InputSettings
}
export interface NumericSettingCapability {
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
}
export interface SettingAvailability {
  supported: boolean
  disabledReason?: string
}
export interface GameSettingsCapabilities {
  schemaVersion: 1
  platform: string
  resolutions: DisplayResolution[]
  windowModes: WindowMode[]
  qualityLevels: QualityLevel[]
  graphicsGroups: Array<keyof VideoSettings['graphics']>
  antiAliasingMethods: AntiAliasingMethod[]
  superResolutionMethods: SuperResolutionMethod[]
  dlss: SettingAvailability & { modes: DlssMode[] }
  frameGeneration: SettingAvailability & {
    modes: FrameGenerationMode[]
    requiresDlssSuperResolution: boolean
  }
  ranges: Record<keyof NumericRanges, NumericSettingCapability>
}
export interface NumericRanges {
  brightness: number
  characterVisibility: number
  npcVisibility: number
  outlineThickness: number
  outlineCurve: number
  highlightThicknessNear: number
  highlightThicknessFar: number
  highlightBrightness: number
  maxFps: number
  fieldOfView: number
  renderScalePercent: number
  cameraSensitivity: number
  zoomSensitivity: number
}

export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }
export type GameSettingsPath =
  | 'video.display.windowMode'
  | 'video.display.resolution'
  | 'video.visibility.brightness'
  | 'video.visibility.characterVisibility'
  | 'video.visibility.npcVisibility'
  | `video.graphics.${Exclude<keyof VideoSettings['graphics'], 'overallQuality'> | 'overallQuality'}`
  | 'video.superResolution.method'
  | 'video.superResolution.dlssMode'
  | 'video.superResolution.frameGenerationMode'
  | `video.outline.${keyof VideoSettings['outline']}`
  | `video.performance.${keyof VideoSettings['performance']}`
  | 'input.cameraSensitivity'
  | 'input.zoomSensitivity'
export type GameSettingsPathValue<P extends GameSettingsPath> = P extends 'video.display.resolution'
  ? DisplayResolution
  : P extends `${string}.windowMode`
    ? WindowMode
    : P extends `${string}.overallQuality`
      ? QualityLevel | 'custom'
      : P extends `${string}.method`
        ? SuperResolutionMethod
        : P extends `${string}.dlssMode`
          ? DlssMode
          : P extends `${string}.frameGenerationMode`
            ? FrameGenerationMode
            : P extends
                  | `${string}.frameGenerationMode`
                  | `${string}.vSyncEnabled`
                  | `${string}.frameRateLimitEnabled`
              ? boolean
              : P extends `video.graphics.${string}`
                ? QualityLevel
                : number

export function cloneSettings<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
export function resolutionKey(value: DisplayResolution): string {
  return `${value.width}x${value.height}@${value.refreshRateHz ?? 0}`
}
export function deriveOverallQuality(
  graphics: VideoSettings['graphics'],
  groups: readonly string[],
): QualityLevel | 'custom' {
  const values = groups
    .filter((group) => group !== 'overallQuality')
    .map((group) => graphics[group as keyof typeof graphics])
  return values.length > 0 && values.every((value) => value === values[0])
    ? (values[0] as QualityLevel)
    : 'custom'
}
