import { prisma } from './prisma'

interface RateLimitConfig {
  // Window in seconds
  windowMs: number
  // Max attempts in window
  maxAttempts: number
  // Identifier (ip, email, etc.)
  identifier: string
  // Action type for logging
  action: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfterSeconds?: number
}

/**
 * Simple rate limiter using the database
 * For production, consider using Redis or Upstash Rate Limit
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { windowMs, maxAttempts, identifier, action } = config
  
  const windowStart = new Date(Date.now() - windowMs)
  
  try {
    // Count attempts in the window
    const attemptCount = await prisma.securityLog.count({
      where: {
        ipAddress: identifier,
        event: action,
        createdAt: {
          gte: windowStart,
        },
      },
    })

    const remaining = Math.max(0, maxAttempts - attemptCount)
    const resetAt = new Date(Date.now() + windowMs)

    if (attemptCount >= maxAttempts) {
      // Find the oldest attempt in the window to calculate retry time
      const oldestAttempt = await prisma.securityLog.findFirst({
        where: {
          ipAddress: identifier,
          event: action,
          createdAt: {
            gte: windowStart,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
        },
      })

      const retryAfterSeconds = oldestAttempt
        ? Math.ceil((oldestAttempt.createdAt.getTime() + windowMs - Date.now()) / 1000)
        : Math.ceil(windowMs / 1000)

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(0, retryAfterSeconds),
      }
    }

    return {
      allowed: true,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request to proceed
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: new Date(Date.now() + windowMs),
    }
  }
}

/**
 * Log a rate-limited action for tracking
 */
export async function logRateLimitedAction(
  identifier: string,
  action: string,
  userEmail?: string,
  userId?: string
): Promise<void> {
  try {
    await prisma.securityLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || 'unknown',
        event: action,
        status: 'ATTEMPT',
        message: `Rate limited action: ${action}`,
        ipAddress: identifier,
      },
    })
  } catch (error) {
    console.error('Failed to log rate limited action:', error)
  }
}

// Predefined rate limit configurations
export const rateLimits = {
  // Login: 5 attempts per 15 minutes per IP
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 10,
    action: 'LOGIN_ATTEMPT',
  },
  
  // Password reset: 3 requests per hour per IP
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    action: 'PASSWORD_RESET_ATTEMPT',
  },
  
  // Magic link: 5 requests per 15 minutes per IP
  magicLink: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    action: 'MAGIC_LINK_ATTEMPT',
  },
  
  // 2FA verify: 5 attempts per 5 minutes per IP
  twoFactorVerify: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 10,
    action: 'TWO_FACTOR_ATTEMPT',
  },
  
  // Registration: 3 per hour per IP
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 5,
    action: 'REGISTER_ATTEMPT',
  },
}

/**
 * Helper to create rate limit error response
 */
export function rateLimitErrorResponse(result: RateLimitResult) {
  return {
    error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
    retryAfterSeconds: result.retryAfterSeconds,
    resetAt: result.resetAt.toISOString(),
  }
}


