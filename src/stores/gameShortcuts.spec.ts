import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import { useGameShortcutsStore } from './gameShortcuts'
import type { SkillShortcut } from '@/views/game/types/shortcuts'

const skill: SkillShortcut = {
  kind: 'skill',
  skillId: 's-1',
  level: 1,
  name: 'Sample skill',
  icon: { kind: 'local', src: '/sample.svg' },
  flags: { toggleable: true, active: false, usable: true, passive: false },
  cooldown: null,
}
describe('game shortcuts store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('keeps UI locks independent from runtime updates', () => {
    const store = useGameShortcutsStore()
    expect(store.assignSkill(1, skill)).toBe(true)
    store.toggleSlotLocked(1)
    expect(store.moveOrSwap(1, 2, 'ui')).toBe(false)
    expect(store.moveOrSwap(1, 2, 'runtime')).toBe(true)
    expect(store.slots[1]!.entry?.kind).toBe('skill')
  })
  it('starts, changes, and expires absolute cooldowns', () => {
    const store = useGameShortcutsStore()
    store.assignSkill(1, skill)
    expect(store.startCooldown(1, 5000, 1000)).toBe(true)
    expect(store.changeCooldownEnd(1, 7000)).toBe(true)
    store.expireCooldowns(6999)
    expect(store.slots[0]!.entry?.kind === 'skill' && store.slots[0]!.entry.cooldown).toBeTruthy()
    store.expireCooldowns(7000)
    expect(store.slots[0]!.entry?.kind === 'skill' && store.slots[0]!.entry.cooldown).toBeNull()
  })

  it('rejects invalid presentation patches without changing runtime state', () => {
    const store = useGameShortcutsStore()
    const cooldown = { startedAtMs: 100, endsAtMs: 200 }
    expect(store.assignSkill(1, { ...skill, cooldown })).toBe(true)
    expect(
      store.patchSkill(1, {
        facts: [{ key: 'reuse', label: 'Reuse', value: { kind: 'duration', milliseconds: -1 } }],
      }),
    ).toBe(false)
    const entry = store.slots[0]!.entry
    expect(entry?.kind === 'skill' && entry.cooldown).toEqual(cooldown)
    expect(entry?.kind === 'skill' && entry.facts).toBeUndefined()
  })

  it('clones presentation arrays at assignment boundaries', () => {
    const store = useGameShortcutsStore()
    const facts = [
      { key: 'target', label: 'Target', value: { kind: 'text', content: 'Enemy' } },
    ] as const
    expect(store.assignSkill(1, { ...skill, facts })).toBe(true)
    const entry = store.slots[0]!.entry
    expect(entry?.kind === 'skill' && entry.facts).not.toBe(facts)
  })
})
