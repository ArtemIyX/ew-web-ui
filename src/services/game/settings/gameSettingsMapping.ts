import type { QualityLevel } from '@/views/game/types/gameSettings'
export const unrealQualityValues: Record<QualityLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  epic: 3,
  cinematic: 4,
}
export function toUnrealQuality(value: QualityLevel): number {
  return unrealQualityValues[value]
}
export function fromUnrealQuality(value: number): QualityLevel | undefined {
  return Object.entries(unrealQualityValues).find(([, ordinal]) => ordinal === value)?.[0] as
    QualityLevel | undefined
}
