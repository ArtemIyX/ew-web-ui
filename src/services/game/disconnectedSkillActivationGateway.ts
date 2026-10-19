import type { SkillActivationGateway, SkillActivationOrigin } from './skillActivationGateway'
export class DisconnectedSkillActivationGateway implements SkillActivationGateway {
  activateSkill(_skillId: string, _origin: SkillActivationOrigin, _position?: number): void {}
}
