export const chatChannels = ['normal', 'race', 'party', 'guild', 'subguild'] as const
export type ChatChannel = (typeof chatChannels)[number]

export interface ChatMessage {
  id: number
  channel: ChatChannel
  body: string
  createdAt: number
}

export const CHAT_HISTORY_LIMIT = 200
