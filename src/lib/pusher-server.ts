import Pusher from 'pusher'
import { prisma } from '@/lib/prisma'

// Pusher Server Instance (für Server-Side Events)
let pusherInstance: Pusher | null = null

export async function getPusherServer(): Promise<Pusher | null> {
  // Prüfe ob bereits initialisiert
  if (pusherInstance) {
    return pusherInstance
  }

  // Lade Konfiguration aus der Datenbank
  const settings = await prisma.platformSettings.findFirst()

  if (!settings?.pusherEnabled || !settings.pusherAppId || !settings.pusherKey || !settings.pusherSecret) {
    return null
  }

  pusherInstance = new Pusher({
    appId: settings.pusherAppId,
    key: settings.pusherKey,
    secret: settings.pusherSecret,
    cluster: settings.pusherCluster || 'eu',
    useTLS: true,
  })

  return pusherInstance
}

// Invalidate cached instance (z.B. nach Config-Änderung)
export function invalidatePusherCache() {
  pusherInstance = null
}

// Helper: Sende Event an einen Channel
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    const pusher = await getPusherServer()
    if (!pusher) {
      console.log('Pusher not configured, skipping event:', event)
      return false
    }

    await pusher.trigger(channel, event, data)
    return true
  } catch (error) {
    console.error('Pusher trigger error:', error)
    return false
  }
}

// Helper: Sende Event an mehrere Channels
export async function triggerPusherEventBatch(
  events: Array<{
    channel: string
    name: string
    data: Record<string, unknown>
  }>
): Promise<boolean> {
  try {
    const pusher = await getPusherServer()
    if (!pusher) {
      console.log('Pusher not configured, skipping batch events')
      return false
    }

    await pusher.triggerBatch(events)
    return true
  } catch (error) {
    console.error('Pusher batch trigger error:', error)
    return false
  }
}

// Helper: Presence Channel Name für eine Conversation
export function getConversationChannel(conversationId: string): string {
  return `presence-conversation-${conversationId}`
}

// Helper: Private Channel Name für einen User
export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}

// Helper: Global Presence Channel (für alle Online-User)
export function getGlobalPresenceChannel(): string {
  return 'presence-global'
}

// Event Types
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


