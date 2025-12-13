import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'
import { handleLoginEvent, createActiveSession } from '@/lib/security-notifications'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID fehlt' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
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
        event: 'MAGIC_LINK_LOGIN_2FA',
        status: 'SUCCESS',
        message: 'Anmeldung via Magic Link mit 2FA',
        ipAddress,
        userAgent,
      },
    })

    // Create JWT session token
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('No AUTH_SECRET found')
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      )
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

    // Set session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    // Auth.js (NextAuth v5) uses different cookie names based on environment
    const cookieName = isProduction 
      ? '__Secure-authjs.session-token' 
      : 'authjs.session-token'

    const response = NextResponse.json({ success: true })

    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error('Magic link complete 2FA error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}



