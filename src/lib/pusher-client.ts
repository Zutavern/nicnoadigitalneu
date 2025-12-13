'use client'

import Pusher, { Channel, PresenceChannel } from 'pusher-js'

// Pusher Client Instance
let pusherInstance: Pusher | null = null

export interface PusherConfig {
  key: string
  cluster: string
  enabled: boolean
}

// Get or create Pusher client instance
export function getPusherClient(config: PusherConfig): Pusher | null {
  if (!config.enabled || !config.key) {
    return null
  }

  if (pusherInstance) {
    return pusherInstance
  }

  pusherInstance = new Pusher(config.key, {
    cluster: config.cluster,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    pusherInstance.connection.bind('connected', () => {
      console.log('🟢 Pusher connected')
    })
    pusherInstance.connection.bind('disconnected', () => {
      console.log('🔴 Pusher disconnected')
    })
    pusherInstance.connection.bind('error', (err: Error) => {
      console.error('❌ Pusher error:', err)
    })
  }

  return pusherInstance
}

// Disconnect and cleanup
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}

// Subscribe to a channel
export function subscribeToChannel(
  pusher: Pusher,
  channelName: string
): Channel {
  return pusher.subscribe(channelName)
}

// Subscribe to a presence channel
export function subscribeToPresenceChannel(
  pusher: Pusher,
  channelName: string
): PresenceChannel {
  return pusher.subscribe(channelName) as PresenceChannel
}

// Unsubscribe from a channel
export function unsubscribeFromChannel(pusher: Pusher, channelName: string) {
  pusher.unsubscribe(channelName)
}

// Get channel name helpers
export function getConversationChannel(conversationId: string): string {
  return `presence-conversation-${conversationId}`
}

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}

export function getGlobalPresenceChannel(): string {
  return 'presence-global'
}

// Event Types (same as server)
export const PUSHER_EVENTS = {
  // Message Events
  NEW_MESSAGE: 'new-message',
  MESSAGE_UPDATED: 'message-updated',
  MESSAGE_DELETED: 'message-deleted',
  
  // Typing Events
  USER_TYPING: 'user-typing',
  USER_STOPPED_TYPING: 'user-stopped-typing',
  
  // Presence Events (handled by Pusher automatically)
  MEMBER_ADDED: 'pusher:member_added',
  MEMBER_REMOVED: 'pusher:member_removed',
  SUBSCRIPTION_SUCCEEDED: 'pusher:subscription_succeeded',
  
  // Notification Events
  NEW_NOTIFICATION: 'new-notification',
  
  // Read Status
  MESSAGES_READ: 'messages-read',
  
  // Video Call Events
  INCOMING_CALL: 'incoming-call',
  CALL_ACCEPTED: 'call-accepted',
  CALL_REJECTED: 'call-rejected',
  CALL_ENDED: 'call-ended',
  CALL_MISSED: 'call-missed',
} as const

// Member type for presence channels
export interface PresenceMember {
  id: string
  info: {
    name: string
    email: string
    image: string | null
    role: string
  }
}

// Presence channel members type
export interface PresenceMembers {
  count: number
  members: Record<string, PresenceMember['info']>
  me: PresenceMember
}

