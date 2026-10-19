export const PARTY_CONTROLS_WINDOW_ID = 'party-controls' as const

export const partyControlActionIds = [
  'leave-party',
  'toggle-party-pin',
  'toggle-party-visibility',
  'change-party-drop',
  'check-party-readiness',
] as const

export type PartyControlActionId = (typeof partyControlActionIds)[number]

export interface PartyControlActionIntent {
  action: PartyControlActionId
  source: 'party-controls-window'
}
