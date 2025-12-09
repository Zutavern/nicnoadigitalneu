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

    const { token } = await request.json()

    if (!token || token.length !== 6) {
      return NextResponse.json({ error: 'Ungültiger Token' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA nicht eingerichtet' }, { status: 400 })
    }

    // Verify token
    const isValid = verifyTOTPToken(user.twoFactorSecret, token)

    if (!isValid) {
      return NextResponse.json({ error: 'Ungültiger Code' }, { status: 400 })
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
      },
    })

    // Log security event
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'TWO_FACTOR_ENABLED',
        status: 'SUCCESS',
        message: '2FA erfolgreich aktiviert',
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: '2FA aktiviert',
        message: 'Die Zwei-Faktor-Authentifizierung wurde für dein Konto aktiviert.',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: '2FA erfolgreich aktiviert'
    })
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}




