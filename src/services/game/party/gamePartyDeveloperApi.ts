import { useGamePartyStore } from '@/stores/gameParty'
import type { GameStatusEffectKind } from '@/views/game/types/gameStatusEffects'
import type { PartyMemberId, PartyMemberSnapshot } from '@/views/game/types/gameParty'
import { createPartyEffect, createPartyMember, debugIconForMember } from '@/views/game/types/gamePartyFixtures'
import type { ResourceKind } from '@/views/game/types/playerStatus'

export interface GamePartyDeveloperApi {
  list: () => readonly PartyMemberSnapshot[]
  populate: (count: 2 | 3 | 5) => boolean
  clear: () => boolean
  setLeader: (memberId: PartyMemberId) => boolean
  setDead: (memberId: PartyMemberId, dead: boolean) => boolean
  adjustResource: (memberId: PartyMemberId, kind: ResourceKind, delta: number) => boolean
  addEffect: (memberId: PartyMemberId, kind: Exclude<GameStatusEffectKind, 'toggle'>) => boolean
  clearEffects: (memberId: PartyMemberId, kind: Exclude<GameStatusEffectKind, 'toggle'>) => boolean
}

export function createGamePartyDeveloperApi(): GamePartyDeveloperApi {
  const store = useGamePartyStore()

  function nextRevision(): number {
    return store.revision + 1
  }

  function replaceMembers(members: readonly PartyMemberSnapshot[]): boolean {
    return store.replaceSnapshot({ revision: nextRevision(), members })
  }

  function list(): readonly PartyMemberSnapshot[] {
    return store.members.map((member) => store.memberById(member.memberId)!).filter(Boolean)
  }

  function populate(count: 2 | 3 | 5): boolean {
    const members = Array.from({ length: count }, (_, index) => {
      const memberId = `sample-member-${index + 1}`
      return createPartyMember({
        memberId,
        order: index,
        characterName: `Sample Member ${index + 1}`,
        classIcon: debugIconForMember(memberId),
        isLeader: index === 0,
      })
    })
    return replaceMembers(members)
  }

  function clear(): boolean {
    return replaceMembers([])
  }

  function updateMember(
    memberId: PartyMemberId,
    update: (member: PartyMemberSnapshot) => PartyMemberSnapshot,
  ): boolean {
    const member = store.memberById(memberId)
    if (!member) return false
    return replaceMembers(
      store.members.map((entry) =>
        entry.memberId === memberId ? update(member) : store.memberById(entry.memberId)!,
      ),
    )
  }

  function setLeader(memberId: PartyMemberId): boolean {
    return replaceMembers(store.members.map((member) => ({
      ...store.memberById(member.memberId)!,
      isLeader: member.memberId === memberId,
    })))
  }

  function setDead(memberId: PartyMemberId, dead: boolean): boolean {
    return updateMember(memberId, (member) => ({ ...member, lifeState: dead ? 'dead' : 'alive' }))
  }

  function adjustResource(memberId: PartyMemberId, kind: ResourceKind, delta: number): boolean {
    return updateMember(memberId, (member) => {
      const resource = member.resources[kind]
      return {
        ...member,
        resources: {
          ...member.resources,
          [kind]: {
            ...resource,
            current: Math.min(resource.maximum, Math.max(0, resource.current + delta)),
          },
        },
      }
    })
  }

  function addEffect(memberId: PartyMemberId, kind: Exclude<GameStatusEffectKind, 'toggle'>): boolean {
    return updateMember(memberId, (member) => {
      const effects = kind === 'buff' ? member.buffs : member.debuffs
      const next = createPartyEffect(kind, effects.length + 1, {
        id: `${memberId}-${kind}-${effects.length + 1}`,
      })
      return kind === 'buff'
        ? { ...member, buffs: [...effects, next] }
        : { ...member, debuffs: [...effects, next] }
    })
  }

  function clearEffects(memberId: PartyMemberId, kind: Exclude<GameStatusEffectKind, 'toggle'>): boolean {
    return updateMember(memberId, (member) =>
      kind === 'buff' ? { ...member, buffs: [] } : { ...member, debuffs: [] },
    )
  }

  return {
    list,
    populate,
    clear,
    setLeader,
    setDead,
    adjustResource,
    addEffect,
    clearEffects,
  }
}
