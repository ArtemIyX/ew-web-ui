import type { ResourceValue } from '@/views/game/types/gameResources'

export interface NormalizedResourceValue extends ResourceValue {
  percentage: number
}

export function normalizeResourceValue(value: ResourceValue): NormalizedResourceValue {
  const maximum = Number.isFinite(value.maximum) ? Math.max(0, value.maximum) : 0
  const current = Number.isFinite(value.current)
    ? Math.min(maximum, Math.max(0, value.current))
    : 0
  return {
    current,
    maximum,
    percentage: maximum > 0 ? (current / maximum) * 100 : 0,
  }
}
