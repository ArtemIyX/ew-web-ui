import { describe, expect, it } from 'vitest'
import { createSamplePlayerTarget, createSampleStructureTarget } from '@/views/game/types/gameTargetStatusFixtures'
import { validateGameTargetStatusSnapshot } from './gameTargetStatusValidation'

describe('game target status validation', () => {
  it('accepts player and non-player target contracts', () => {
    expect(validateGameTargetStatusSnapshot({ revision: 1, target: createSamplePlayerTarget() }).ok).toBe(true)
    expect(validateGameTargetStatusSnapshot({ revision: 2, target: createSampleStructureTarget() }).ok).toBe(true)
  })
  it('rejects player-only fields on structures and invalid cast times', () => {
    const target = createSampleStructureTarget({ portrait: { kind: 'local', src: 'sample.svg' } })
    const result = validateGameTargetStatusSnapshot({ revision: 1, target })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.some((issue) => issue.code === 'player-only-field')).toBe(true)
  })
})
