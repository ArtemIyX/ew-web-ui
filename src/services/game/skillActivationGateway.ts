export type SkillActivationOrigin = 'skill-list' | 'shortcut'
export interface SkillActivationGateway {
  activateSkill(
    skillId: string,
    origin: SkillActivationOrigin,
    position?: number,
  ): Promise<void> | void
}
