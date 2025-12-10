import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { notifyPasswordChanged } from '@/lib/security-notifications'

// POST /api/user/change-password - Passwort ändern (für alle Rollen)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    // Validierung
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Die neuen Passwörter stimmen nicht überein' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Hole Passwort-Richtlinien
    const settings = await prisma.platformSettings.findFirst()
    const passwordPolicy = settings?.passwordPolicy as {
      minLength?: number
      requireUppercase?: boolean
      requireNumbers?: boolean
      requireSpecialChars?: boolean
    } | null

    if (passwordPolicy) {
      if (passwordPolicy.minLength && newPassword.length < passwordPolicy.minLength) {
        return NextResponse.json(
          { error: `Das Passwort muss mindestens ${passwordPolicy.minLength} Zeichen lang sein` },
          { status: 400 }
        )
      }
      if (passwordPolicy.requireUppercase && !/[A-Z]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Das Passwort muss mindestens einen Großbuchstaben enthalten' },
          { status: 400 }
        )
      }
      if (passwordPolicy.requireNumbers && !/[0-9]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Das Passwort muss mindestens eine Zahl enthalten' },
          { status: 400 }
        )
      }
      if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        return NextResponse.json(
          { error: 'Das Passwort muss mindestens ein Sonderzeichen enthalten' },
          { status: 400 }
        )
      }
    }

    // Hole User mit Passwort
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Prüfe ob User ein Passwort hat (OAuth-User haben keins)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Passwort-Änderung nicht möglich. Sie haben sich über einen externen Anbieter registriert.' },
        { status: 400 }
      )
    }

    // Verifiziere aktuelles Passwort
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      // Log fehlgeschlagenen Versuch
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          event: 'PASSWORD_CHANGE_FAILED',
          status: 'FAILED',
          message: 'Falsches aktuelles Passwort eingegeben',
        }
      })

      return NextResponse.json(
        { error: 'Das aktuelle Passwort ist falsch' },
        { status: 400 }
      )
    }

    // Hash neues Passwort
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update Passwort
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      }
    })

    // Log erfolgreiche Änderung
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        event: 'PASSWORD_CHANGED',
        status: 'SUCCESS',
        message: 'Passwort erfolgreich geändert',
      }
    })

    // Erstelle In-App Benachrichtigung
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Passwort geändert',
        message: 'Ihr Passwort wurde erfolgreich geändert. Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie uns sofort.',
      }
    })

    // Sende E-Mail-Benachrichtigung
    await notifyPasswordChanged(user.id, user.email).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Passwort erfolgreich geändert'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

