import { prisma } from '@/lib/prisma'
import { GoogleBusinessConnectionStatus } from '@prisma/client'

/**
 * Check if a user has an active premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionStatus: true }
    })
    return user?.stripeSubscriptionStatus === 'active'
  } catch (error) {
    console.error('Error checking premium status:', error)
    return false
  }
}

/**
 * Check if a user has Google Business access (premium + connected)
 */
export async function hasGoogleBusinessAccess(userId: string): Promise<boolean> {
  try {
    const isPremium = await isPremiumUser(userId)
    if (!isPremium) return false
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { 
        userId, 
        status: GoogleBusinessConnectionStatus.ACTIVE 
      }
    })
    return !!connection
  } catch (error) {
    console.error('Error checking Google Business access:', error)
    return false
  }
}

/**
 * Get detailed Google Business status for a user
 */
export async function getGoogleBusinessStatus(userId: string): Promise<{
  isPremium: boolean
  isConnected: boolean
  connectionStatus: GoogleBusinessConnectionStatus | null
  googleEmail: string | null
  locationName: string | null
}> {
  try {
    const [user, connection] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { stripeSubscriptionStatus: true }
      }),
      prisma.googleBusinessConnection.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    ])

    const isPremium = user?.stripeSubscriptionStatus === 'active'
    const isConnected = connection?.status === GoogleBusinessConnectionStatus.ACTIVE

    return {
      isPremium,
      isConnected,
      connectionStatus: connection?.status || null,
      googleEmail: connection?.googleEmail || null,
      locationName: connection?.locationName || null
    }
  } catch (error) {
    console.error('Error getting Google Business status:', error)
    return {
      isPremium: false,
      isConnected: false,
      connectionStatus: null,
      googleEmail: null,
      locationName: null
    }
  }
}

/**
 * Check if demo mode should be shown for Google Business
 * Demo mode is shown when:
 * - User is not premium, OR
 * - User is premium but not connected to Google Business
 */
export async function shouldShowDemoMode(userId: string): Promise<{
  showDemo: boolean
  reason: 'not_premium' | 'not_connected' | 'connected'
  isPremium: boolean
  isConnected: boolean
}> {
  const status = await getGoogleBusinessStatus(userId)

  if (!status.isPremium) {
    return {
      showDemo: true,
      reason: 'not_premium',
      isPremium: false,
      isConnected: false
    }
  }

  if (!status.isConnected) {
    return {
      showDemo: true,
      reason: 'not_connected',
      isPremium: true,
      isConnected: false
    }
  }

  return {
    showDemo: false,
    reason: 'connected',
    isPremium: true,
    isConnected: true
  }
}

