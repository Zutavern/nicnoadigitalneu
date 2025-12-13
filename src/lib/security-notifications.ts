import { prisma } from '@/lib/prisma'

interface LoginEventParams {
  userId: string
  userEmail: string
  success: boolean
  reason?: string
}

/**
 * Log a login event for security tracking
 */
export async function handleLoginEvent(params: LoginEventParams) {
  const { userId, userEmail, success, reason } = params
  
  try {
    await prisma.securityLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail,
        event: success ? 'LOGIN' : 'LOGIN_FAILED',
        status: success ? 'SUCCESS' : 'FAILED',
        message: reason || (success ? 'Successful login' : 'Failed login attempt'),
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('Error logging login event:', error)
    // Don't throw - logging shouldn't break the auth flow
  }
}

/**
 * Create an active session record for tracking
 */
export async function createActiveSession(userId: string, sessionToken: string) {
  try {
    // First, clean up any expired sessions for this user
    await prisma.activeSession.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
    })

    // Create new active session
    await prisma.activeSession.create({
      data: {
        userId,
        sessionToken,
        isActive: true,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
  } catch (error) {
    console.error('Error creating active session:', error)
    // Don't throw - session tracking shouldn't break the auth flow
  }
}

/**
 * Invalidate an active session
 */
export async function invalidateActiveSession(sessionToken: string) {
  try {
    await prisma.activeSession.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    })
  } catch (error) {
    console.error('Error invalidating session:', error)
  }
}

/**
 * Update last active time for a session
 */
export async function updateSessionActivity(sessionToken: string) {
  try {
    await prisma.activeSession.updateMany({
      where: { sessionToken, isActive: true },
      data: { lastActiveAt: new Date() },
    })
  } catch (error) {
    console.error('Error updating session activity:', error)
  }
}
