/**
 * Chat domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 15.4
 */

export type MessageType = 'TEXT' | 'IMAGE' | 'SHARED_PRODUCT' | 'SHARED_STORE'

export type ParticipantType = 'PERSONAL' | 'BUSINESS'

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderType: ParticipantType
  type: MessageType
  text?: string
  /** imageId (not a full URL) */
  imageId?: string
  sharedProductId?: string
  sharedStoreId?: string
  /** Unix timestamp in milliseconds */
  timestamp: number
  isRead: boolean
}

export interface ChatRoom {
  id: string
  buyerId: string
  sellerId: string
  sellerName: string
  /** imageId for the seller's logo */
  sellerLogoId: string
  lastMessage?: ChatMessage
  unreadCount: number
}

export interface OutgoingMessage {
  roomId: string
  type: MessageType
  text?: string
  imageId?: string
  sharedProductId?: string
  sharedStoreId?: string
}

export interface WebSocketMessage {
  type: 'message' | 'ack' | 'read' | 'typing' | 'error'
  payload: unknown
}
