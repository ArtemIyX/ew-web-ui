import { describe, expect, it } from 'vitest'
import type { GradientVariant } from '@/shared/types/components'
import { gradientPalettes } from '@/shared/types/gradients'
import { resolveGradient } from './resolveGradient'

describe('resolveGradient', () => {
  it('resolves the named bronze alias', () => {
    expect(resolveGradient('bronze')).toBe(
      `linear-gradient(135deg, ${gradientPalettes[2]![0]}, ${gradientPalettes[2]![1]})`,
    )
  })

  it('clamps supported gradient indexes and accepts an angle override', () => {
    expect(resolveGradient('gradient-01', '45deg')).toContain(
      `linear-gradient(45deg, ${gradientPalettes[0]![0]}`,
    )
    expect(resolveGradient('gradient-99')).toContain(gradientPalettes.at(-1)![1])
  })

  it('falls back for malformed runtime values without mutating palettes', () => {
    const before = JSON.stringify(gradientPalettes)
    expect(resolveGradient('gradient-invalid' as unknown as GradientVariant)).toContain(
      gradientPalettes[2]![0],
    )
    expect(JSON.stringify(gradientPalettes)).toBe(before)
  })
})
