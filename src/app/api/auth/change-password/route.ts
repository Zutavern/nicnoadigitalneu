import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SecurityLogEvent, SecurityLogStatus } from '@prisma/client'
import { emails } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Aktuelles und neues Passwort sind erforderlich' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Das neue Passwort muss mindestens 8 Zeichen lang sein' }, { status: 400 })
    }

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden oder kein Passwort gesetzt' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      // Log failed attempt
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          event: SecurityLogEvent.PASSWORD_CHANGED,
          status: SecurityLogStatus.FAILED,
          message: 'Passwortänderung fehlgeschlagen - falsches aktuelles Passwort',
        },
      })

      return NextResponse.json({ error: 'Das aktuelle Passwort ist falsch' }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Log success
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: SecurityLogEvent.PASSWORD_CHANGED,
        status: SecurityLogStatus.SUCCESS,
        message: 'Passwort erfolgreich geändert',
      },
    })

    // Send notification email
    try {
      await emails.sendPasswordChanged(user.email, user.name || 'Nutzer')
    } catch (emailError) {
      console.error('Error sending password changed email:', emailError)
    }

    return NextResponse.json({ success: true, message: 'Passwort erfolgreich geändert' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}










