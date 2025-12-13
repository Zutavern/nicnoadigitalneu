import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { handleLoginEvent } from '@/lib/security-notifications'
import { checkRateLimit, logRateLimitedAction, rateLimits, rateLimitErrorResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // DEBUG: Log env vars (hypotheses F, A)
    console.log('[DEBUG-LOGIN] ENV check:', {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL?.substring(0, 50),
      AUTH_URL: process.env.AUTH_URL?.substring(0, 50),
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      hasAuthSecret: !!process.env.AUTH_SECRET,
    })

    // Rate limiting check
    const rateLimit = await checkRateLimit({
      ...rateLimits.login,
      identifier: ipAddress,
    })

    if (!rateLimit.allowed) {
      console.log('[DEBUG-LOGIN] Rate limited:', ipAddress)
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Log the attempt for rate limiting
    await logRateLimitedAction(ipAddress, rateLimits.login.action)

    const { email, password } = await request.json()

    console.log('[DEBUG-LOGIN] Login attempt:', { email, hasPassword: !!password })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    console.log('[DEBUG-LOGIN] User lookup:', { email, found: !!user, hasDbPassword: !!user?.password })

    if (!user || !user.password) {
      // Log failed attempt
      await handleLoginEvent({
        userId: '',
        userEmail: email,
      }, false).catch(console.error)

      console.log('[DEBUG-LOGIN] User not found or no password')
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Dieses Konto wurde gesperrt. Bitte kontaktieren Sie den Support.' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('[DEBUG-LOGIN] Password check:', { email, isValid: isPasswordValid })

    if (!isPasswordValid) {
      await handleLoginEvent({
        userId: user.id,
        userEmail: email,
        userName: user.name,
      }, false).catch(console.error)

      console.log('[DEBUG-LOGIN] Password invalid')
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    console.log('[DEBUG-LOGIN] Password valid, checking 2FA:', { twoFactorEnabled: user.twoFactorEnabled })

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Generate pending 2FA token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Clean up old pending tokens for this user
      await prisma.pendingTwoFactorAuth.deleteMany({
        where: { userId: user.id },
      })

      // Create new pending token
      await prisma.pendingTwoFactorAuth.create({
        data: {
          userId: user.id,
          token,
          ipAddress,
          userAgent,
          expiresAt,
        },
      })

      // Log 2FA challenge
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          event: 'TWO_FACTOR_CHALLENGE',
          status: 'PENDING',
          message: '2FA-Verifizierung erforderlich',
          ipAddress,
          userAgent,
        },
      })

      return NextResponse.json({
        requires2FA: true,
        token,
        message: '2FA-Verifizierung erforderlich',
      })
    }

    // No 2FA - return success signal for client-side signIn
    console.log('[DEBUG-LOGIN] Success - returning canLogin:true for', email)
    return NextResponse.json({
      requires2FA: false,
      canLogin: true,
      message: 'Anmeldung erfolgreich',
      userId: user.id, // Add for debugging
    })
  } catch (error) {
    console.error('[DEBUG-LOGIN] Exception:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}



