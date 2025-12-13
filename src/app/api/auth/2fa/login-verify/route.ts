import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTOTPToken } from '@/lib/two-factor'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, code, backupCode } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token fehlt' },
        { status: 400 }
      )
    }

    if (!code && !backupCode) {
      return NextResponse.json(
        { error: 'Code oder Backup-Code ist erforderlich' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find pending 2FA auth
    const pending = await prisma.pendingTwoFactorAuth.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!pending) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 400 }
      )
    }

    // Check expiration
    if (pending.expiresAt < new Date()) {
      await prisma.pendingTwoFactorAuth.delete({ where: { id: pending.id } })
      return NextResponse.json(
        { error: 'Token abgelaufen. Bitte erneut anmelden.' },
        { status: 400 }
      )
    }

    // Check attempts (max 5)
    if (pending.attempts >= 5) {
      await prisma.pendingTwoFactorAuth.delete({ where: { id: pending.id } })
      
      await prisma.securityLog.create({
        data: {
          userId: pending.userId,
          userEmail: pending.user.email,
          event: 'TWO_FACTOR_FAILED',
          status: 'FAILED',
          message: 'Zu viele fehlgeschlagene 2FA-Versuche',
          ipAddress,
          userAgent,
        },
      })

      return NextResponse.json(
        { error: 'Zu viele fehlgeschlagene Versuche. Bitte erneut anmelden.' },
        { status: 400 }
      )
    }

    const user = pending.user

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA nicht konfiguriert' },
        { status: 400 }
      )
    }

    let isValid = false

    // Verify TOTP code
    if (code) {
      isValid = verifyTOTPToken(user.twoFactorSecret, code)
    }

    // Or verify backup code
    if (!isValid && backupCode) {
      const backupCodes = user.twoFactorBackupCodes || []
      const codeIndex = backupCodes.findIndex(
        (storedCode) => storedCode === backupCode.toUpperCase().replace(/-/g, '')
      )

      if (codeIndex !== -1) {
        isValid = true
        // Remove used backup code
        const updatedCodes = [...backupCodes]
        updatedCodes.splice(codeIndex, 1)
        
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: updatedCodes },
        })

        // Notify about backup code usage
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM_ALERT',
            title: 'Backup-Code verwendet',
            message: `Ein Backup-Code wurde verwendet. ${updatedCodes.length} Codes verbleiben.`,
          },
        })
      }
    }

    if (!isValid) {
      // Increment attempts
      await prisma.pendingTwoFactorAuth.update({
        where: { id: pending.id },
        data: { attempts: { increment: 1 } },
      })

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          event: 'TWO_FACTOR_FAILED',
          status: 'FAILED',
          message: `Ungültiger 2FA-Code (Versuch ${pending.attempts + 1}/5)`,
          ipAddress,
          userAgent,
        },
      })

      return NextResponse.json(
        { error: 'Ungültiger Code' },
        { status: 400 }
      )
    }

    // Success - Delete pending auth
    await prisma.pendingTwoFactorAuth.delete({ where: { id: pending.id } })

    // Log successful 2FA
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'TWO_FACTOR_SUCCESS',
        status: 'SUCCESS',
        message: '2FA-Verifizierung erfolgreich',
        ipAddress,
        userAgent,
      },
    })

    // Return success - client will now call signIn
    return NextResponse.json({
      success: true,
      verified: true,
      message: '2FA-Verifizierung erfolgreich',
    })
  } catch (error) {
    console.error('2FA login verify error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

