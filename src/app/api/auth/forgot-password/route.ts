import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import emails from '@/lib/email'
import crypto from 'crypto'
import { checkRateLimit, logRateLimitedAction, rateLimits, rateLimitErrorResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Rate limiting check
    const rateLimit = await checkRateLimit({
      ...rateLimits.passwordReset,
      identifier: ipAddress,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Log the attempt for rate limiting
    await logRateLimitedAction(ipAddress, rateLimits.passwordReset.action)

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
        message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    })

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://nicnoa.de'
    const resetUrl = `${baseUrl}/passwort-zuruecksetzen?token=${resetToken}`

    // Send email
    await emails.sendPasswordReset(
      user.email,
      user.name || 'Nutzer',
      resetUrl
    )

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'PASSWORD_RESET_REQUESTED',
        status: 'SUCCESS',
        message: 'Passwort-Reset angefordert',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}









