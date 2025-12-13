import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'
import { handleLoginEvent, createActiveSession } from '@/lib/security-notifications'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Hash token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        magicLinkToken: hashedToken,
        magicLinkExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Generate pending 2FA token
      const twoFactorToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Clean up old pending tokens
      await prisma.pendingTwoFactorAuth.deleteMany({
        where: { userId: user.id },
      })

      // Create pending 2FA
      await prisma.pendingTwoFactorAuth.create({
        data: {
          userId: user.id,
          token: twoFactorToken,
          ipAddress,
          userAgent,
          expiresAt,
        },
      })

      // Clear magic link token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          magicLinkToken: null,
          magicLinkExpires: null,
        },
      })

      // Redirect to 2FA page with special flag for magic link
      const redirectUrl = new URL('/login/2fa', request.url)
      redirectUrl.searchParams.set('magicLink', 'true')
      redirectUrl.searchParams.set('userId', user.id)
      redirectUrl.searchParams.set('token', twoFactorToken)
      return NextResponse.redirect(redirectUrl)
    }

    // Clear magic link token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: null,
        magicLinkExpires: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        lastLoginDevice: userAgent.substring(0, 255),
      },
    })

    // Log successful login
    await handleLoginEvent({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    }, true).catch(console.error)

    // Create active session
    const sessionToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    await createActiveSession(user.id, sessionToken)

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'MAGIC_LINK_LOGIN',
        status: 'SUCCESS',
        message: 'Anmeldung via Magic Link',
        ipAddress,
        userAgent,
      },
    })

    // Create JWT session token
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('No AUTH_SECRET found')
      return NextResponse.redirect(new URL('/login?error=config', request.url))
    }

    const jwtToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        sessionCreatedAt: Date.now(),
      },
      secret,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Create response with redirect
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nicnoa.online'
    const redirectTo = user.onboardingCompleted 
      ? (user.role === 'ADMIN' ? '/admin' : user.role === 'SALON_OWNER' ? '/salon' : '/stylist')
      : '/onboarding'
    
    const response = NextResponse.redirect(new URL(redirectTo, baseUrl))

    // Set session cookie
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Auth.js (NextAuth v5) uses different cookie names based on environment
    const cookieName = isProduction 
      ? '__Secure-authjs.session-token' 
      : 'authjs.session-token'

    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error('Magic link verify error:', error)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}



