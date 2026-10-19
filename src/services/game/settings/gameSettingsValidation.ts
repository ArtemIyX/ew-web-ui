import {
  cloneSettings,
  deriveOverallQuality,
  resolutionKey,
  type DeepPartial,
  type DisplayResolution,
  type GameSettingsCapabilities,
  type GameSettingsSnapshot,
  type GameSettingsPath,
  type GameSettingsPathValue,
} from '@/views/game/types/gameSettings'
export { cloneSettings } from '@/views/game/types/gameSettings'

export interface SettingsValidationIssue {
  path: string
  code: 'required' | 'not-finite' | 'out-of-range' | 'unsupported' | 'dependency'
  messageKey: string
}
export type RuntimeValidationIssue = SettingsValidationIssue
export function normalizeResolutions(values: readonly DisplayResolution[]): DisplayResolution[] {
  const unique = new Map<string, DisplayResolution>()
  values
    .filter(
      (value) =>
        Number.isInteger(value.width) &&
        Number.isInteger(value.height) &&
        value.width > 0 &&
        value.height > 0,
    )
    .forEach((value) => unique.set(resolutionKey(value), { ...value }))
  return [...unique.values()].sort(
    (a, b) =>
      a.width - b.width || a.height - b.height || (a.refreshRateHz ?? 0) - (b.refreshRateHz ?? 0),
  )
}
export function validateSnapshot(
  snapshot: GameSettingsSnapshot,
  capabilities: GameSettingsCapabilities,
): SettingsValidationIssue[] {
  const issues: SettingsValidationIssue[] = []
  const add = (path: string, code: SettingsValidationIssue['code'], messageKey: string) =>
    issues.push({ path, code, messageKey })
  const numeric: Array<[string, number, keyof GameSettingsCapabilities['ranges']]> = [
    ['video.visibility.brightness', snapshot.video.visibility.brightness, 'brightness'],
    [
      'video.visibility.characterVisibility',
      snapshot.video.visibility.characterVisibility,
      'characterVisibility',
    ],
    ['video.visibility.npcVisibility', snapshot.video.visibility.npcVisibility, 'npcVisibility'],
    ['video.outline.outlineThickness', snapshot.video.outline.outlineThickness, 'outlineThickness'],
    ['video.outline.outlineCurve', snapshot.video.outline.outlineCurve, 'outlineCurve'],
    [
      'video.outline.highlightThicknessNear',
      snapshot.video.outline.highlightThicknessNear,
      'highlightThicknessNear',
    ],
    [
      'video.outline.highlightThicknessFar',
      snapshot.video.outline.highlightThicknessFar,
      'highlightThicknessFar',
    ],
    [
      'video.outline.highlightBrightness',
      snapshot.video.outline.highlightBrightness,
      'highlightBrightness',
    ],
    ['video.performance.maxFps', snapshot.video.performance.maxFps, 'maxFps'],
    ['video.performance.fieldOfView', snapshot.video.performance.fieldOfView, 'fieldOfView'],
    [
      'video.performance.renderScalePercent',
      snapshot.video.performance.renderScalePercent,
      'renderScalePercent',
    ],
    ['input.cameraSensitivity', snapshot.input.cameraSensitivity, 'cameraSensitivity'],
    ['input.zoomSensitivity', snapshot.input.zoomSensitivity, 'zoomSensitivity'],
  ]
  numeric.forEach(([path, value, rangeKey]) => {
    const range = capabilities.ranges[rangeKey]
    if (!Number.isFinite(value)) add(path, 'not-finite', '#SETTINGS_ERROR_FINITE')
    else if (value < range.min || value > range.max)
      add(path, 'out-of-range', '#SETTINGS_ERROR_RANGE')
  })
  if (!capabilities.windowModes.includes(snapshot.video.display.windowMode))
    add('video.display.windowMode', 'unsupported', '#SETTINGS_ERROR_UNSUPPORTED')
  if (
    !capabilities.resolutions.some(
      (item) => resolutionKey(item) === resolutionKey(snapshot.video.display.resolution),
    )
  )
    add('video.display.resolution', 'unsupported', '#SETTINGS_ERROR_UNSUPPORTED')
  if (!capabilities.superResolutionMethods.includes(snapshot.video.superResolution.method))
    add('video.superResolution.method', 'unsupported', '#SETTINGS_ERROR_UNSUPPORTED')
  if (snapshot.video.superResolution.method === 'dlss' && !capabilities.dlss.supported)
    add('video.superResolution.method', 'dependency', '#SETTINGS_ERROR_DLSS')
  if (
    snapshot.video.superResolution.method === 'dlss' &&
    !capabilities.dlss.modes.includes(snapshot.video.superResolution.dlssMode)
  )
    add('video.superResolution.dlssMode', 'unsupported', '#SETTINGS_ERROR_UNSUPPORTED')
  if (
    !capabilities.frameGeneration.modes.includes(snapshot.video.superResolution.frameGenerationMode)
  )
    add('video.superResolution.frameGenerationMode', 'unsupported', '#SETTINGS_ERROR_UNSUPPORTED')
  if (
    snapshot.video.superResolution.dlssMode === 'dlaa' &&
    snapshot.video.performance.renderScalePercent !== 100
  )
    add('video.performance.renderScalePercent', 'dependency', '#SETTINGS_ERROR_DLAA_SCALE')
  if (
    snapshot.video.superResolution.method === 'dlss' &&
    snapshot.video.graphics.antiAliasingMethod !== 'taa'
  )
    add('video.graphics.antiAliasingMethod', 'dependency', '#SETTINGS_ERROR_DLSS_AA')
  if (
    snapshot.video.superResolution.method === 'native' &&
    snapshot.video.superResolution.frameGenerationMode !== 'off'
  )
    add(
      'video.superResolution.frameGenerationMode',
      'dependency',
      '#SETTINGS_ERROR_FRAME_GENERATION',
    )
  return issues
}
export function normalizeSettings(
  snapshot: GameSettingsSnapshot,
  capabilities: GameSettingsCapabilities,
): GameSettingsSnapshot {
  const next = cloneSettings(snapshot)
  next.video.graphics.overallQuality = deriveOverallQuality(
    next.video.graphics,
    capabilities.graphicsGroups,
  )
  if (
    next.video.superResolution.method === 'dlss' &&
    next.video.superResolution.dlssMode === 'dlaa'
  )
    next.video.performance.renderScalePercent = 100
  if (next.video.superResolution.method === 'native')
    next.video.superResolution.frameGenerationMode = 'off'
  if (
    capabilities.frameGeneration.requiresDlssSuperResolution &&
    next.video.superResolution.method !== 'dlss'
  )
    next.video.superResolution.frameGenerationMode = 'off'
  return next
}
export function applyPatch(
  snapshot: GameSettingsSnapshot,
  patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>>,
): GameSettingsSnapshot {
  const next = cloneSettings(snapshot)
  return {
    ...next,
    video: {
      ...next.video,
      ...patch.video,
      display: {
        ...next.video.display,
        ...patch.video?.display,
      } as GameSettingsSnapshot['video']['display'],
      visibility: { ...next.video.visibility, ...patch.video?.visibility },
      graphics: { ...next.video.graphics, ...patch.video?.graphics },
      superResolution: { ...next.video.superResolution, ...patch.video?.superResolution },
      outline: { ...next.video.outline, ...patch.video?.outline },
      performance: { ...next.video.performance, ...patch.video?.performance },
    },
    input: { ...next.input, ...patch.input },
  } as GameSettingsSnapshot
}
export function setPath<P extends GameSettingsPath>(
  snapshot: GameSettingsSnapshot,
  path: P,
  value: GameSettingsPathValue<P>,
): GameSettingsSnapshot {
  const next = cloneSettings(snapshot)
  const parts = path.split('.')
  const first = parts[0]
  const second = parts[1]
  const third = parts[2]
  if (first === 'input' && second)
    (next.input as unknown as Record<string, unknown>)[second] = value
  else if (first === 'video' && second && third) {
    const group = (next.video as unknown as Record<string, Record<string, unknown>>)[second]
    if (group) group[third] = value
  }
  return next
}
export function createPatch(
  before: GameSettingsSnapshot,
  after: GameSettingsSnapshot,
): DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>> {
  const patch: DeepPartial<Pick<GameSettingsSnapshot, 'video' | 'input'>> = {}
  if (JSON.stringify(before.video) !== JSON.stringify(after.video)) patch.video = after.video
  if (JSON.stringify(before.input) !== JSON.stringify(after.input)) patch.input = after.input
  return patch
}
