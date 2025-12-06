import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTOTPSecret, generateQRCodeDataURL, generateBackupCodes } from '@/lib/two-factor'

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

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA ist bereits aktiviert' }, { status: 400 })
    }

    // Generate secret
    const { secret, uri } = generateTOTPSecret(user.email)
    
    // Generate QR code
    const qrCode = await generateQRCodeDataURL(uri)
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(8)

    // Store secret temporarily (will be confirmed when user verifies)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
      },
    })

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes,
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}


