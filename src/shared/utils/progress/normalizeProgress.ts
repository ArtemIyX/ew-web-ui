export interface NormalizedProgress {
  value: number
  min: number
  max: number
  ratio: number
  percentage: number
}

export function normalizeProgress(value: number, min: number, max: number): NormalizedProgress {
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? max : 100
  const safeValue = Number.isFinite(value) ? value : safeMin

  if (safeMax <= safeMin) {
    return {
      value: safeMin,
      min: safeMin,
      max: safeMax,
      ratio: 0,
      percentage: 0,
    }
  }

  const clampedValue = Math.min(safeMax, Math.max(safeMin, safeValue))
  const ratio = (clampedValue - safeMin) / (safeMax - safeMin)

  return {
    value: clampedValue,
    min: safeMin,
    max: safeMax,
    ratio,
    percentage: ratio * 100,
  }
}
