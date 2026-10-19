import { describe, expect, it } from 'vitest'
import {
  createStatusEffectsDeveloperApi,
  installStatusEffectsDeveloperApi,
} from './gameStatusEffectsDeveloperApi'

function api() {
  return {
    getSnapshot: () => ({ revision: 0, buffs: [] }),
    getWindowState: () => null,
    resetWindowLayout: () => ({ ok: true, revision: 0, value: undefined }),
    clearBuffs: () => ({ ok: true, revision: 0, value: undefined }),
    setDebugMetadataVisible: () => ({ ok: true, revision: 0, value: undefined }),
  } as never
}

describe('status-effects developer namespace', () => {
  it('installs all aliases and preserves replacements during cleanup', () => {
    const buffs = api()
    const debuffs = api()
    const toggles = api()
    const aggregate = createStatusEffectsDeveloperApi(buffs, debuffs, toggles)
    const target = { ew: { other: true } } as unknown as Window
    const cleanup = installStatusEffectsDeveloperApi(aggregate, target)
    expect(target.ew?.buffList).toBe(buffs)
    expect(target.ew?.debuffList).toBe(debuffs)
    expect(target.ew?.toggleList).toBe(toggles)
    expect(target.ew?.statusEffects).toBe(aggregate)
    const replacement = {} as never
    target.ew!.statusEffects = replacement
    cleanup()
    expect((target.ew as unknown as { other: boolean }).other).toBe(true)
    expect(target.ew?.statusEffects).toBe(replacement)
  })
})
