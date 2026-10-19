import debug02 from '@/assets/debug-icons/debug-orb-02.svg'
import debug03 from '@/assets/debug-icons/debug-orb-03.svg'
import debug04 from '@/assets/debug-icons/debug-orb-04.svg'
import debug05 from '@/assets/debug-icons/debug-orb-05.svg'
import debug06 from '@/assets/debug-icons/debug-orb-06.svg'
import type { IconSource } from '@/shared/types/components'
import type { GameStatusEffectKind, GameStatusEffectRecord } from './gameStatusEffects'
import type { GamePartySnapshot, PartyMemberSnapshot } from './gameParty'

const debugIcons = [debug02, debug03, debug04, debug05, debug06] as const

export function debugIconForMember(memberId: string): IconSource {
  const hash = [...memberId].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return { kind: 'local' as const, src: debugIcons[hash % debugIcons.length] ?? debug02 }
}

export function createPartyEffect(
  kind: GameStatusEffectKind,
  index: number,
  overrides: Partial<GameStatusEffectRecord> = {},
): GameStatusEffectRecord {
  const effectId = `${kind}-sample-${index}`
  return {
    id: effectId,
    definition: {
      skillId: `${effectId}-skill`,
      level: (index % 5) + 1,
      name: `Sample ${kind} ${index}`,
      icon: debugIconForMember(effectId),
      description: `Development-only ${kind} data.`,
    },
    appliedAtMs: 0,
    endsAtMs: null,
    order: index,
    ...overrides,
  }
}

export function createPartyMember(
  overrides: Partial<PartyMemberSnapshot> = {},
): PartyMemberSnapshot {
  const memberId = overrides.memberId ?? 'sample-member-1'
  return {
    memberId,
    order: overrides.order ?? 0,
    characterName: overrides.characterName ?? 'Sample Member 1',
    level: overrides.level ?? 42,
    classId: overrides.classId ?? 'sample-class',
    classIcon: overrides.classIcon ?? debugIconForMember(memberId),
    isLeader: overrides.isLeader ?? false,
    lifeState: overrides.lifeState ?? 'alive',
    resources: {
      hp: { current: 8400, maximum: 10000 },
      mp: { current: 4200, maximum: 6000 },
      energy: { current: 65, maximum: 100 },
      ...overrides.resources,
    },
    buffs: overrides.buffs ?? [],
    debuffs: overrides.debuffs ?? [],
  }
}

export function createGamePartySnapshot(
  overrides: Partial<GamePartySnapshot> = {},
): GamePartySnapshot {
  const members = overrides.members ?? [
    createPartyMember({ memberId: 'sample-member-1', characterName: 'Sample Member 1', isLeader: true }),
    createPartyMember({ memberId: 'sample-member-2', characterName: 'Sample Member 2', order: 1 }),
  ]
  return { revision: overrides.revision ?? 1, members }
}
