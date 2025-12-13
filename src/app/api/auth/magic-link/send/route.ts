import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'
import { checkRateLimit, logRateLimitedAction, rateLimits, rateLimitErrorResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting check
    const rateLimit = await checkRateLimit({
      ...rateLimits.magicLink,
      identifier: ipAddress,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Log the attempt for rate limiting
    await logRateLimitedAction(ipAddress, rateLimits.magicLink.action)

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Magic Link gesendet.',
      })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json({
        success: true,
        message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Magic Link gesendet.',
      })
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: hashedToken,
        magicLinkExpires: expiresAt,
      },
    })

    // Generate login URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://nicnoa.de'
    const loginUrl = `${baseUrl}/api/auth/magic-link/verify?token=${token}`

    // Send email
    await sendEmail({
      to: user.email,
      templateSlug: 'magic-link',
      data: {
        userName: user.name || 'Nutzer',
        loginUrl,
      },
      userId: user.id,
    })

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'MAGIC_LINK_REQUESTED',
        status: 'SUCCESS',
        message: 'Magic Link angefordert',
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Magic Link gesendet.',
    })
  } catch (error) {
    console.error('Magic link send error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

