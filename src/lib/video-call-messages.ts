import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { ServerVideoCallEvents } from '@/lib/analytics-server'
import { 
  triggerPusherEvent, 
  getConversationChannel, 
  getUserChannel,
  PUSHER_EVENTS 
} from '@/lib/pusher-server'

// ==================== TYPES ====================

interface CallUser {
  id: string
  name: string | null
  email?: string
  image?: string | null
}

interface CallEndedData {
  callId: string
  caller: CallUser
  callee: CallUser
  duration: number // in seconds
  conversationId?: string
}

interface CallMissedData {
  callId: string
  caller: CallUser
  callee: CallUser
  reason: 'no_answer' | 'rejected' | 'cancelled'
  conversationId?: string
}

// ==================== CHAT MESSAGES ====================

/**
 * Create a system message in a conversation
 */
async function createSystemMessage(
  conversationId: string,
  senderId: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      isSystemMessage: true,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  // Trigger Pusher event for real-time update
  const conversationChannel = getConversationChannel(conversationId)
  await triggerPusherEvent(conversationChannel, PUSHER_EVENTS.NEW_MESSAGE, {
    message: {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      isRead: false,
      isSystemMessage: true,
      sender: message.sender,
      metadata,
    },
    conversationId,
  })

  return message
}

/**
 * Get or create a conversation between two users
 */
async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  // Find existing conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { participants: { some: { userId: userId1 } } },
        { participants: { some: { userId: userId2 } } },
      ],
    },
    select: { id: true },
  })

  if (existingConversation) {
    return existingConversation.id
  }

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
    select: { id: true },
  })

  return newConversation.id
}

/**
 * Format call duration as human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} Sekunden`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} Minuten`
}

// ==================== VIDEO CALL ENDED ====================

/**
 * Handle completed video call - create chat message and notification
 */
export async function handleCallEnded(data: CallEndedData) {
  const { caller, callee, duration, conversationId } = data

  // Get or create conversation
  const convId = conversationId || await getOrCreateConversation(caller.id, callee.id)

  // Create system message about ended call
  const durationText = formatDuration(duration)
  const messageContent = `📹 Videoanruf beendet • ${durationText}`

  await createSystemMessage(convId, caller.id, messageContent, {
    type: 'video_call_ended',
    duration,
    callId: data.callId,
  })

  // Track analytics (DB + PostHog)
  await ServerVideoCallEvents.callEnded(caller.id, callee.id, data.callId, duration)
}

// ==================== VIDEO CALL MISSED ====================

/**
 * Handle missed video call - create chat message with callback button
 */
export async function handleCallMissed(data: CallMissedData) {
  const { caller, callee, reason, conversationId } = data

  // Get or create conversation
  const convId = conversationId || await getOrCreateConversation(caller.id, callee.id)

  // Determine message based on reason
  let messageContent: string
  let notificationTitle: string
  let notificationMessage: string

  switch (reason) {
    case 'no_answer':
      messageContent = `📞 ${caller.name || 'Jemand'} hat versucht anzurufen`
      notificationTitle = 'Verpasster Anruf'
      notificationMessage = `${caller.name || 'Jemand'} hat versucht, dich per Video anzurufen`
      break
    case 'rejected':
      messageContent = `📞 Videoanruf von ${caller.name || 'Jemand'} abgelehnt`
      notificationTitle = 'Anruf abgelehnt'
      notificationMessage = `Du hast den Anruf von ${caller.name || 'Jemand'} abgelehnt`
      break
    case 'cancelled':
      messageContent = `📞 ${caller.name || 'Jemand'} hat den Anruf abgebrochen`
      notificationTitle = 'Anruf abgebrochen'
      notificationMessage = `${caller.name || 'Jemand'} hat den Anruf beendet, bevor du abnehmen konntest`
      break
    default:
      messageContent = `📞 Verpasster Videoanruf von ${caller.name || 'Jemand'}`
      notificationTitle = 'Verpasster Anruf'
      notificationMessage = `Du hast einen Videoanruf verpasst`
  }

  // Check if caller is still online (for callback button)
  const callerUser = await prisma.user.findUnique({
    where: { id: caller.id },
    select: { isOnline: true },
  })

  // Create system message with callback metadata
  await createSystemMessage(convId, caller.id, messageContent, {
    type: 'video_call_missed',
    reason,
    callerId: caller.id,
    callerName: caller.name,
    callerImage: caller.image,
    callerOnline: callerUser?.isOnline || false,
    callId: data.callId,
  })

  // Create notification for callee (the one who missed the call)
  await createNotification({
    userId: callee.id,
    type: 'VIDEO_CALL_MISSED',
    title: notificationTitle,
    message: notificationMessage,
    link: `/messages?conversation=${convId}`,
    metadata: {
      callerId: caller.id,
      callerName: caller.name,
      conversationId: convId,
    },
  })

  // Send Pusher notification
  const calleeChannel = getUserChannel(callee.id)
  await triggerPusherEvent(calleeChannel, PUSHER_EVENTS.NEW_NOTIFICATION, {
    type: 'VIDEO_CALL_MISSED',
    title: notificationTitle,
    message: notificationMessage,
    callerId: caller.id,
    callerName: caller.name,
    conversationId: convId,
  })

  // Track analytics (DB + PostHog)
  await ServerVideoCallEvents.callMissed(caller.id, callee.id, data.callId, reason)
}

// ==================== VIDEO CALL INCOMING (for notifications) ====================

/**
 * Create notification for incoming call
 */
export async function handleIncomingCall(data: {
  callId: string
  caller: CallUser
  callee: CallUser
}) {
  const { caller, callee } = data

  // Create notification
  await createNotification({
    userId: callee.id,
    type: 'VIDEO_CALL_INCOMING',
    title: 'Eingehender Anruf',
    message: `${caller.name || 'Jemand'} ruft dich an`,
    metadata: {
      callerId: caller.id,
      callerName: caller.name,
      callId: data.callId,
    },
  })

  // Track analytics (DB + PostHog)
  await ServerVideoCallEvents.callInitiated(caller.id, callee.id, data.callId)
}

/**
 * Handle call answered
 */
export async function handleCallAnswered(data: {
  callId: string
  callerId: string
  calleeId: string
}) {
  // Track analytics (DB + PostHog)
  await ServerVideoCallEvents.callAnswered(data.callerId, data.calleeId, data.callId)
}

/**
 * Handle call rejected by callee
 */
export async function handleCallRejected(data: {
  callId: string
  caller: CallUser
  callee: CallUser
  conversationId?: string
}) {
  // Track rejection event (DB + PostHog)
  await ServerVideoCallEvents.callRejected(data.caller.id, data.callee.id, data.callId)
  
  // Also handle as missed call for chat message
  await handleCallMissed({
    ...data,
    reason: 'rejected',
  })
}
