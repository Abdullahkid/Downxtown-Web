/**
 * Chat domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 15.4
 */

export type MessageType = 'TEXT' | 'IMAGE' | 'SHARED_PRODUCT' | 'SHARED_STORE'

export type ParticipantType = 'PERSONAL' | 'BUSINESS'

// ---------------------------------------------------------------------------
// Backend DTOs (Ktor)
// ---------------------------------------------------------------------------

export interface ParticipantInfo {
  id: string
  name: string
  username: string
  profileImage?: string | null
  type: ParticipantType
}

/** Chat room shape returned by `GET /chat/rooms` */
export interface ChatRoomDto {
  id: string
  participants: ParticipantInfo[]
  lastMessage?: string | null
  lastMessageType: MessageType
  lastMessageTime?: number | null
  lastMessageSenderId?: string | null
  unreadCount: number
  isActive?: boolean
}

/** Response returned by `GET /chat/rooms` */
export interface ChatListResponse {
  chatRooms: ChatRoomDto[]
  hasMore: boolean
  page: number
}

// ---------------------------------------------------------------------------
// Client/domain types (used for WebSocket message flow)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// WebSocket connection types
// ---------------------------------------------------------------------------

export type WsStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected'

export type WsEventType =
  | 'new_message'
  | 'message_ack'
  | 'user_typing'
  | 'typing_stopped'
  | 'messages_read'
  | 'room_presence'
  | 'user_online'
  | 'user_offline'
  | 'error'

// ---------------------------------------------------------------------------
// Outgoing WS event envelopes (client → server)
// ---------------------------------------------------------------------------

export interface WsJoinRoom {
  event: 'join_chat_room'
  roomId: string
}

export interface WsLeaveRoom {
  event: 'leave_chat_room'
  roomId: string
}

export interface WsSendMessage {
  event: 'send_message'
  roomId: string
  type: MessageType
  text?: string
  imageId?: string
  tempId: string
}

export interface WsTypingStarted {
  event: 'typing_started'
  roomId: string
}

export interface WsTypingStopped {
  event: 'typing_stopped'
  roomId: string
}

export interface WsGetPresence {
  event: 'get_room_presence'
  roomId: string
}

// ---------------------------------------------------------------------------
// Incoming WS event envelopes (server → client)
// ---------------------------------------------------------------------------

export interface WsNewMessage {
  event: 'new_message'
  message: ChatMessage
}

export interface WsMessageAck {
  event: 'message_ack'
  tempId: string
  message: ChatMessage
}

export interface WsUserTyping {
  event: 'user_typing'
  roomId: string
  userId: string
  displayName: string
}

/** Server-side typing_stopped carries userId (disambiguates from outgoing WsTypingStopped) */
export interface WsTypingStoppedIn {
  event: 'typing_stopped'
  roomId: string
  userId: string
}

export interface WsMessagesRead {
  event: 'messages_read'
  roomId: string
  unreadCount: number
}

export interface WsRoomPresence {
  event: 'room_presence'
  roomId: string
  onlineUserIds: string[]
}

export interface WsUserOnline {
  event: 'user_online'
  userId: string
}

export interface WsUserOffline {
  event: 'user_offline'
  userId: string
}

export interface WsError {
  event: 'error'
  code: string
  message: string
}

/** Discriminated union of all server-sent events */
export type IncomingWsEvent =
  | WsNewMessage
  | WsMessageAck
  | WsUserTyping
  | WsTypingStoppedIn
  | WsMessagesRead
  | WsRoomPresence
  | WsUserOnline
  | WsUserOffline
  | WsError

// ---------------------------------------------------------------------------
// WS_Manager internal types
// ---------------------------------------------------------------------------

/** An event that could not be sent immediately and was buffered in the outgoing queue. */
export interface QueuedEvent {
  event: string
  payload: unknown
  /** Date.now() at enqueue time — preserves FIFO ordering. */
  enqueuedAt: number
}

/** Per-room typing debounce state tracked inside WS_Manager. */
export interface TypingState {
  /** Handle for the auto typing_stopped timeout; null when no timer is active. */
  timer: ReturnType<typeof setTimeout> | null
  /** Timestamp (ms) of the last typing_started event sent for this room. */
  lastSentAt: number
}

// ---------------------------------------------------------------------------
// Start New Chat / Participant types
// ---------------------------------------------------------------------------

/** A chat participant as returned by the /chat/recent-interactions, /chat/network,
 *  and /chat/search-users endpoints and displayed in the Start_Chat_Page.
 *
 *  Note: `profileImage` is a full URL returned directly by the API (not an imageId). */
export interface ChatParticipant {
  id: string
  name: string
  username: string
  /** Full profile image URL — returned directly by the API, not an imageId. */
  profileImage?: string | null
  type: ParticipantType
  /** Optional contextual subtitle, e.g. store name for BUSINESS participants. */
  subtitle?: string
}

// ---------------------------------------------------------------------------
// FCM notification payload
// ---------------------------------------------------------------------------

/** Shape of the FCM data payload for CHAT-type push notifications. */
export interface ChatFcmData {
  type: 'CHAT'
  chatRoomId: string
  senderName: string
  /** Raw preview text; handler truncates to 50 chars before display. */
  messagePreview: string
}
