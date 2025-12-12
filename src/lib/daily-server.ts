/**
 * Daily.co Server-Side Integration
 * 
 * Handles video room creation, token generation, and API interactions
 */

import { prisma } from './prisma'

// ==================== TYPES ====================

interface DailyConfig {
  apiKey: string
  domain: string
  enabled: boolean
}

interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: {
    exp?: number
    nbf?: number
    max_participants?: number
    enable_chat?: boolean
    enable_screenshare?: boolean
    enable_recording?: string
    start_video_off?: boolean
    start_audio_off?: boolean
  }
}

interface DailyMeetingToken {
  token: string
}

interface CreateRoomOptions {
  /** Room name (auto-generated if not provided) */
  name?: string
  /** Expiration in seconds from now (default: 1 hour) */
  expiresInSeconds?: number
  /** Maximum number of participants (default: 2 for 1:1 calls) */
  maxParticipants?: number
  /** Enable chat in call */
  enableChat?: boolean
  /** Enable screen sharing */
  enableScreenshare?: boolean
  /** Start with video off */
  startVideoOff?: boolean
  /** Start with audio off */
  startAudioOff?: boolean
}

interface CreateTokenOptions {
  /** Room name to create token for */
  roomName: string
  /** User ID */
  userId: string
  /** User display name */
  userName: string
  /** Is room owner (can kick/mute others) */
  isOwner?: boolean
  /** Token expiration in seconds from now (default: 1 hour) */
  expiresInSeconds?: number
}

// ==================== CACHE ====================

let cachedConfig: DailyConfig | null = null

async function getDailyConfig(): Promise<DailyConfig | null> {
  if (cachedConfig) return cachedConfig

  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        dailyApiKey: true,
        dailyDomain: true,
        dailyEnabled: true,
      },
    })

    if (!settings?.dailyApiKey || !settings?.dailyEnabled) {
      return null
    }

    cachedConfig = {
      apiKey: settings.dailyApiKey,
      domain: settings.dailyDomain || '',
      enabled: settings.dailyEnabled,
    }

    return cachedConfig
  } catch (error) {
    console.error('Error loading Daily config:', error)
    return null
  }
}

/** Invalidate the cached config (call after settings update) */
export function invalidateDailyCache(): void {
  cachedConfig = null
}

// ==================== API HELPERS ====================

const DAILY_API_BASE = 'https://api.daily.co/v1'

async function dailyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = await getDailyConfig()
  if (!config) {
    throw new Error('Daily.co is not configured or disabled')
  }

  const response = await fetch(`${DAILY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Daily API error: ${response.status}`)
  }

  return response.json()
}

// ==================== PUBLIC FUNCTIONS ====================

/**
 * Check if Daily.co video calls are enabled
 */
export async function isDailyEnabled(): Promise<boolean> {
  const config = await getDailyConfig()
  return config?.enabled ?? false
}

/**
 * Get Daily.co configuration for client-side (without API key)
 */
export async function getDailyClientConfig(): Promise<{ domain: string; enabled: boolean } | null> {
  const config = await getDailyConfig()
  if (!config) return null
  return {
    domain: config.domain,
    enabled: config.enabled,
  }
}

/**
 * Create a new Daily room for a video call
 */
export async function createRoom(options: CreateRoomOptions = {}): Promise<DailyRoom> {
  const {
    name,
    expiresInSeconds = 3600, // 1 hour default
    maxParticipants = 2,
    enableChat = true,
    enableScreenshare = true,
    startVideoOff = false,
    startAudioOff = false,
  } = options

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  
  // Generate a unique room name if not provided
  const roomName = name || `call-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  const room = await dailyFetch<DailyRoom>('/rooms', {
    method: 'POST',
    body: JSON.stringify({
      name: roomName,
      privacy: 'private', // Requires token to join
      properties: {
        exp,
        max_participants: maxParticipants,
        enable_chat: enableChat,
        enable_screenshare: enableScreenshare,
        start_video_off: startVideoOff,
        start_audio_off: startAudioOff,
        enable_knocking: false, // No waiting room for 1:1
        enable_network_ui: true, // Show network quality indicator
        enable_prejoin_ui: true, // Show prejoin screen
      },
    }),
  })

  return room
}

/**
 * Delete a Daily room
 */
export async function deleteRoom(roomName: string): Promise<void> {
  await dailyFetch(`/rooms/${roomName}`, {
    method: 'DELETE',
  })
}

/**
 * Create a meeting token for a specific user
 */
export async function createMeetingToken(options: CreateTokenOptions): Promise<string> {
  const {
    roomName,
    userId,
    userName,
    isOwner = false,
    expiresInSeconds = 3600,
  } = options

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds

  const response = await dailyFetch<DailyMeetingToken>('/meeting-tokens', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        exp,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  return response.token
}

/**
 * Get room details
 */
export async function getRoom(roomName: string): Promise<DailyRoom | null> {
  try {
    return await dailyFetch<DailyRoom>(`/rooms/${roomName}`)
  } catch {
    return null
  }
}

/**
 * Create a complete video call setup (room + tokens for both participants)
 */
export async function createVideoCall(
  callerId: string,
  callerName: string,
  calleeId: string,
  calleeName: string
): Promise<{
  room: DailyRoom
  callerToken: string
  calleeToken: string
}> {
  // Create the room
  const room = await createRoom({
    name: `call-${callerId.slice(0, 8)}-${calleeId.slice(0, 8)}-${Date.now()}`,
    maxParticipants: 2,
  })

  // Create tokens for both participants
  const [callerToken, calleeToken] = await Promise.all([
    createMeetingToken({
      roomName: room.name,
      userId: callerId,
      userName: callerName,
      isOwner: true, // Caller is the owner
    }),
    createMeetingToken({
      roomName: room.name,
      userId: calleeId,
      userName: calleeName,
      isOwner: false,
    }),
  ])

  return {
    room,
    callerToken,
    calleeToken,
  }
}

/**
 * Test the Daily.co connection with current settings
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getDailyConfig()
    if (!config) {
      return { success: false, message: 'Daily.co ist nicht konfiguriert' }
    }

    // Try to list rooms (lightweight API call)
    await dailyFetch('/rooms?limit=1')
    
    return { success: true, message: 'Verbindung erfolgreich!' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}
