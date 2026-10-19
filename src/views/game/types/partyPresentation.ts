import type { PartyMemberId } from './gameParty'
import type { PartyMemberWindowSlot } from './partyWindows'

export type PartyWindowMode = 'pinned' | 'unpinned'

export interface PartyWindowPreferences {
  mode: PartyWindowMode
  visible: boolean
}

export interface PartyWindowSlotAssignment {
  windowSlot: PartyMemberWindowSlot
  memberId: PartyMemberId | null
}
