import type { ShortcutPosition } from '@/views/game/types/shortcuts'
import type { SkillActivationOrigin } from './skillActivationGateway'
export interface ShortcutActivationGateway {
  activateSkill(
    skillId: string,
    position: ShortcutPosition,
    origin?: SkillActivationOrigin,
  ): Promise<void> | void
}
