import type { PlayerStatusSnapshot } from './playerStatus'

export const disconnectedPlayerStatusSnapshot: PlayerStatusSnapshot = {
  characterName: 'Sample Player',
  level: 50,
  isPartyLeader: true,
  isRaidLeader: false,
  isInParty: true,
  isInRaid: false,
  partyLocked: false,
  raidVisible: false,
  readiness: 'ready',
  hp: { current: 100000, maximum: 100000 },
  mp: { current: 64000, maximum: 64000 },
  energy: { current: 82, maximum: 100 },
  lifeEnergy: { current: 72, maximum: 100 },
  manaEnergy: { current: 88, maximum: 100 },
}
