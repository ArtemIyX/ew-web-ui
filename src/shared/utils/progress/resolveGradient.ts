import type { GradientVariant } from '@/shared/types/components'
import { gradientPalettes } from '@/shared/types/gradients'

export function resolveGradient(variant: GradientVariant, angle = '135deg'): string {
  const fallbackIndex = 2
  const requestedIndex =
    variant === 'bronze' ? fallbackIndex : Number(variant.replace('gradient-', '')) - 1
  const index = Number.isInteger(requestedIndex)
    ? Math.min(gradientPalettes.length - 1, Math.max(0, requestedIndex))
    : fallbackIndex
  const palette = gradientPalettes[index] ?? gradientPalettes[fallbackIndex]!

  return `linear-gradient(${angle}, ${palette[0]}, ${palette[1]})`
}
