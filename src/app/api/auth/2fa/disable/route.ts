import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyTOTPToken } from '@/lib/two-factor'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { token, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA nicht aktiviert' }, { status: 400 })
    }

    // Verify current 2FA token
    const isValid = verifyTOTPToken(user.twoFactorSecret, token)

    if (!isValid) {
      return NextResponse.json({ error: 'Ungültiger Code' }, { status: 400 })
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'TWO_FACTOR_DISABLED',
        status: 'SUCCESS',
        message: '2FA deaktiviert',
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: '2FA deaktiviert',
        message: 'Die Zwei-Faktor-Authentifizierung wurde für dein Konto deaktiviert.',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: '2FA erfolgreich deaktiviert'
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}







