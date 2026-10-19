import { describe, expect, it } from 'vitest'
import type { GameBuffRecord } from '@/views/game/types/gameBuffs'
import {
  cloneGameBuff,
  validateGameBuffRecord,
  validateGameBuffSnapshot,
} from './gameBuffValidation'

const buff: GameBuffRecord = {
  buffId: 'buff-1',
  definition: {
    skillId: 'skill-1',
    name: 'Sample buff',
    icon: { kind: 'local', src: '/buff.svg' },
    level: 2,
  },
  appliedAtMs: 1_000,
  endsAtMs: null,
  order: 0,
}

describe('game buff validation', () => {
  it('accepts indefinite records and returns defensive clones', () => {
    const result = validateGameBuffRecord(buff)
    expect(result.ok).toBe(true)
    const copy = cloneGameBuff(buff)
    copy.definition.name = 'Changed'
    expect(buff.definition.name).toBe('Sample buff')
  })

  it('rejects invalid timing and duplicate snapshot identities', () => {
    expect(validateGameBuffRecord({ ...buff, endsAtMs: 999 }).ok).toBe(false)
    const result = validateGameBuffSnapshot({ revision: 1, buffs: [buff, { ...buff }] })
    expect(result).toMatchObject({ ok: false })
    if (!result.ok)
      expect(result.issues).toContainEqual({ code: 'duplicate-buff-id', path: 'buffs[1].buffId' })
  })

  it('reports each record contract issue with a stable path', () => {
    const invalid = {
      ...buff,
      buffId: ' ',
      definition: {
        ...buff.definition,
        skillId: ' ',
        level: 0,
        name: '',
        facts: [
          { key: 'same', label: 'A', value: { kind: 'text', content: 'A' } },
          { key: 'same', label: 'B', value: { kind: 'text', content: 'B' } },
        ],
      },
      appliedAtMs: Number.NaN,
      endsAtMs: Number.POSITIVE_INFINITY,
      order: -1,
    } as GameBuffRecord
    const result = validateGameBuffRecord(invalid)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          { code: 'missing-buff-id', path: 'buffId' },
          { code: 'missing-skill-id', path: 'definition.skillId' },
          { code: 'invalid-level', path: 'definition.level' },
          { code: 'invalid-order', path: 'order' },
          { code: 'invalid-applied-time', path: 'appliedAtMs' },
          { code: 'invalid-end-time', path: 'endsAtMs' },
          { code: 'invalid-tooltip', path: 'definition.name' },
          { code: 'invalid-tooltip', path: 'definition.facts[1].key' },
        ]),
      )
    }
  })
})
