import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import EmailVerificationEmail from '@/emails/templates/EmailVerificationEmail'

const changeEmailSchema = z.object({
  newEmail: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort erforderlich').optional(),
})

// POST /api/user/change-email - E-Mail ändern (sendet Verifizierung)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = changeEmailSchema.parse(body)

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        email: true, 
        password: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // If same email, return error
    if (user.email.toLowerCase() === validatedData.newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Die neue E-Mail-Adresse ist identisch mit der aktuellen.' },
        { status: 400 }
      )
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.newEmail.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse wird bereits verwendet.' },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store pending email change
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        // Store the new email temporarily in a metadata field or create a separate table
      },
    })

    // Also store the new email in a separate record for verification
    await prisma.$executeRaw`
      UPDATE users 
      SET email_verification_token = ${token},
          email_verification_expires = ${expires}
      WHERE id = ${session.user.id}::uuid
    `

    // Send verification email to NEW email address
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/verify-email-change?token=${token}&email=${encodeURIComponent(validatedData.newEmail)}`
    
    try {
      const emailHtml = await render(
        EmailVerificationEmail({
          userName: user.name || 'Benutzer',
          verificationUrl,
        })
      )

      await sendEmail({
        to: validatedData.newEmail,
        subject: 'E-Mail-Adresse bestätigen - nicnoa',
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      return NextResponse.json(
        { error: 'Fehler beim Senden der Verifizierungs-E-Mail' },
        { status: 500 }
      )
    }

    // Log this action
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: user.email,
        event: 'EMAIL_CHANGE_REQUESTED',
        status: 'SUCCESS',
        message: `E-Mail-Änderung angefordert zu: ${validatedData.newEmail}`,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: `Eine Bestätigungs-E-Mail wurde an ${validatedData.newEmail} gesendet. Bitte klicke auf den Link um die Änderung zu bestätigen.` 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error changing email:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}


