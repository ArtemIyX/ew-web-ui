export type { ResourceDisplayMode, ResourceKind, ResourceValue } from './gameResources'
import type { ResourceDisplayMode, ResourceKind, ResourceValue } from './gameResources'
export type ReadinessState = 'ready' | 'not-ready'

export interface PlayerStatusSnapshot {
  characterName: string
  level: number
  isPartyLeader: boolean
  isRaidLeader: boolean
  isInParty: boolean
  isInRaid: boolean
  partyLocked: boolean
  raidVisible: boolean
  readiness: ReadinessState
  hp: ResourceValue
  mp: ResourceValue
  energy: ResourceValue
  lifeEnergy: ResourceValue
  manaEnergy: ResourceValue
}

export interface PlayerStatusPreferences {
  resourceModes: Record<ResourceKind, ResourceDisplayMode>
}
