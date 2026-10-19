export const PARTY_GROUP_WINDOW_ID = 'party-group' as const

export const PARTY_MEMBER_WINDOW_IDS = [
  'party-member-1',
  'party-member-2',
  'party-member-3',
  'party-member-4',
  'party-member-5',
] as const

export type PartyMemberWindowId = (typeof PARTY_MEMBER_WINDOW_IDS)[number]
export type PartyMemberWindowSlot = 0 | 1 | 2 | 3 | 4

export interface PartyMemberWindowProps {
  memberId: string
  windowSlot: PartyMemberWindowSlot
}

export function partyMemberWindowId(slot: PartyMemberWindowSlot): PartyMemberWindowId {
  return PARTY_MEMBER_WINDOW_IDS[slot]
}
