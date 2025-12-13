import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/verify-email-change - E-Mail-Änderung bestätigen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const newEmail = searchParams.get('email')

    if (!token || !newEmail) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_token`
      )
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gte: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_expired`
      )
    }

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    })

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=email_taken`
      )
    }

    const oldEmail = user.email

    // Update email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail.toLowerCase(),
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    })

    // Log this action
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: newEmail.toLowerCase(),
        event: 'EMAIL_CHANGED',
        status: 'SUCCESS',
        message: `E-Mail geändert von ${oldEmail} zu ${newEmail}`,
      },
    })

    // Redirect to profile with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?message=email_changed`
    )
  } catch (error) {
    console.error('Error verifying email change:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`
    )
  }
}



