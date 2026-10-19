import { describe, expect, it, vi } from 'vitest'
import { createSkillActivationController } from './skillActivationController'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'

const record: GameSkillRecord = {
  definition: {
    skillId: 'strike',
    subcategoryId: 'combat',
    name: 'Strike',
    level: 1,
    icon: { kind: 'local', src: '/strike.svg' },
    flags: { toggleable: false, active: false, usable: true, passive: false },
  },
  runtime: { skillId: 'strike', usable: true, active: false, cooldown: null },
}
describe('skill activation controller', () => {
  it('gates invalid requests and dispatches allowed requests once', () => {
    const gateway = {
      activateSkill:
        vi.fn<(skillId: string, origin: 'skill-list' | 'shortcut', position?: number) => void>(),
    }
    const controller = createSkillActivationController(
      (id) => (id === 'strike' ? record : undefined),
      gateway,
    )
    expect(controller.activate('missing', 'skill-list').error).toBe('missing')
    expect(controller.activate('strike', 'skill-list')).toEqual({ ok: true })
    expect(gateway.activateSkill).toHaveBeenCalledOnce()
  })
  it('does not dispatch blocked or cooling skills', () => {
    const gateway = {
      activateSkill:
        vi.fn<(skillId: string, origin: 'skill-list' | 'shortcut', position?: number) => void>(),
    }
    const blocked = { ...record, runtime: { ...record.runtime, usable: false } }
    const cooling = {
      ...record,
      runtime: { ...record.runtime, cooldown: { startedAtMs: 0, endsAtMs: Date.now() + 1000 } },
    }
    expect(
      createSkillActivationController(() => blocked, gateway).activate('strike', 'shortcut').error,
    ).toBe('blocked')
    expect(
      createSkillActivationController(() => cooling, gateway).activate('strike', 'shortcut').error,
    ).toBe('cooling-down')
    expect(gateway.activateSkill).not.toHaveBeenCalled()
  })
  it('allows blocked catalog skills while keeping shortcut gating', () => {
    const gateway = {
      activateSkill:
        vi.fn<(skillId: string, origin: 'skill-list' | 'shortcut', position?: number) => void>(),
    }
    const blocked = { ...record, runtime: { ...record.runtime, usable: false, blocked: true } }
    expect(
      createSkillActivationController(() => blocked, gateway).activate('strike', 'skill-list'),
    ).toEqual({ ok: true })
    expect(gateway.activateSkill).toHaveBeenCalledOnce()
  })
})
