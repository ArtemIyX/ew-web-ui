import type { SkillActivationGateway, SkillActivationOrigin } from './skillActivationGateway'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'

export type SkillActivationError = 'missing' | 'blocked' | 'cooling-down'
export interface SkillActivationResult {
  ok: boolean
  error?: SkillActivationError
}
export function createSkillActivationController(
  resolve: (skillId: string) => GameSkillRecord | undefined,
  gateway: SkillActivationGateway,
) {
  return {
    activate(
      skillId: string,
      origin: SkillActivationOrigin,
      position?: number,
    ): SkillActivationResult {
      const record = resolve(skillId)
      if (!record) return { ok: false, error: 'missing' }
      if (
        record.definition.flags.passive ||
        (origin === 'shortcut' && (record.runtime.blocked || !record.runtime.usable))
      )
        return { ok: false, error: 'blocked' }
      if (record.runtime.cooldown && record.runtime.cooldown.endsAtMs > Date.now()) {
        return { ok: false, error: 'cooling-down' }
      }
      void gateway.activateSkill(skillId, origin, position)
      return { ok: true }
    },
  }
}
