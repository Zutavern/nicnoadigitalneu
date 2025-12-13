import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'E-Mail bereits verifiziert' }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expiresAt,
      },
    })

    // Generate verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.nicnoa.online'
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    // Send email
    await sendEmail({
      to: user.email,
      templateSlug: 'email-verification',
      data: {
        userName: user.name || 'Nutzer',
        verifyUrl,
      },
      userId: user.id,
    })

    return NextResponse.json({ 
      success: true,
      message: 'Verifizierungs-E-Mail gesendet'
    })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}










