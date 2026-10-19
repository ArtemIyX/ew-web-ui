import { describe, expect, it } from 'vitest'
import {
  createSkillTooltipFromShortcut,
  formatSkillTooltipValue,
  validateSkillTooltipModel,
} from './skillTooltipModel'
import type { SkillTooltipModel } from '../types/skills'

const resolveText = (value: string | { textKey: string }) =>
  typeof value === 'string' ? value : value.textKey
const context = { locale: 'de-DE', resolveText }

describe('skill tooltip model', () => {
  it('accepts sparse identity-only skills', () => {
    const model: SkillTooltipModel = { skillId: 'passive-defense', name: 'Defense' }
    expect(validateSkillTooltipModel(model)).toEqual({ ok: true, value: model })
  })

  it('reports invalid levels, duplicate keys, and invalid values', () => {
    const result = validateSkillTooltipModel({
      skillId: '4001',
      name: 'Strike',
      level: 0,
      facts: [
        { key: 'reuse', label: 'Reuse', value: { kind: 'duration', milliseconds: -1 } },
        { key: 'reuse', label: 'Reuse', value: { kind: 'number', value: Number.NaN } },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toEqual([
      'invalid-level',
      'negative-duration',
      'duplicate-fact-key',
      'non-finite-number',
    ])
  })

  it('formats localized numbers, durations, and booleans', () => {
    expect(formatSkillTooltipValue({ kind: 'number', value: 1234.5 }, context)).toBe('1.234,5')
    expect(formatSkillTooltipValue({ kind: 'duration', milliseconds: 1500 }, context)).toBe('1,5 s')
    expect(
      formatSkillTooltipValue(
        { kind: 'boolean', value: true, trueLabel: 'Yes', falseLabel: 'No' },
        context,
      ),
    ).toBe('Yes')
  })

  it('maps shortcut presentation data without runtime cooldown facts', () => {
    const model = createSkillTooltipFromShortcut({
      kind: 'skill',
      skillId: '1',
      level: 1,
      name: 'Strike',
      icon: { kind: 'local', src: '/strike' },
      description: 'A strike',
      type: 'Active',
      flags: { toggleable: false, active: false, usable: true, passive: false },
      cooldown: null,
    })
    expect(model).toMatchObject({
      skillId: '1',
      name: 'Strike',
      description: 'A strike',
      type: 'Active',
    })
    expect(model.facts).toBeUndefined()
  })
})
