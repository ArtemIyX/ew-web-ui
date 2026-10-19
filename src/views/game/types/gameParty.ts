import type { IconSource } from '@/shared/types/components'
import type { GameStatusEffectRecord } from './gameStatusEffects'
import type { ResourceValue } from './gameResources'

export const PARTY_MEMBER_LIMIT = 5 as const

export type PartyMemberId = string
export type PartyMemberLifeState = 'alive' | 'dead'

export interface PartyMemberResources {
  hp: ResourceValue
  mp: ResourceValue
  energy: ResourceValue
}

export interface PartyMemberSnapshot {
  memberId: PartyMemberId
  order: number
  characterName: string
  level: number
  classId: string
  classIcon: IconSource
  isLeader: boolean
  lifeState: PartyMemberLifeState
  resources: PartyMemberResources
  buffs: readonly GameStatusEffectRecord[]
  debuffs: readonly GameStatusEffectRecord[]
}

export interface GamePartySnapshot {
  revision: number
  members: readonly PartyMemberSnapshot[]
}

export type GamePartyRuntimeEvent =
  | { kind: 'snapshot'; snapshot: GamePartySnapshot }
  | { kind: 'upsert-member'; revision: number; member: PartyMemberSnapshot }
  | { kind: 'remove-member'; revision: number; memberId: PartyMemberId }
  | { kind: 'clear'; revision: number }
