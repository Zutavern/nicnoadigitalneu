import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// DELETE /api/user/account - Benutzer kann eigenes Konto löschen (Soft Delete)
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { password, confirmText } = body

    // Sicherheits-Check: Bestätigungstext muss korrekt sein
    if (confirmText?.toLowerCase() !== 'löschen') {
      return NextResponse.json(
        { error: "Bitte geben Sie 'LÖSCHEN' ein, um fortzufahren" },
        { status: 400 }
      )
    }

    // User aus DB holen für Passwort-Verifikation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, role: true, isDeleted: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { error: "Konto ist bereits zur Löschung vorgemerkt" },
        { status: 400 }
      )
    }

    // Admins können ihr Konto nicht selbst löschen (Schutzmaßnahme)
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Admin-Konten können nicht selbst gelöscht werden. Bitte kontaktieren Sie einen anderen Administrator." },
        { status: 403 }
      )
    }

    // Passwort-Verifikation (nur wenn User ein Passwort hat - OAuth User haben keins)
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Bitte geben Sie Ihr Passwort ein" },
          { status: 400 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Das Passwort ist nicht korrekt" },
          { status: 400 }
        )
      }
    }

    // Soft Delete: Konto wird zur Löschung vorgemerkt
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id, // Self-deletion
      },
    })

    // Alle Sessions des Users beenden (außer der aktuellen, die wird vom Logout behandelt)
    await prisma.session.deleteMany({
      where: { userId: session.user.id },
    })

    // Security Log erstellen
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event: 'USER_DELETED',
        status: 'SUCCESS',
        message: 'Benutzer hat sein eigenes Konto gelöscht',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Ihr Konto wurde zur Löschung vorgemerkt. Sie haben 30 Tage Zeit, die Löschung rückgängig zu machen, indem Sie sich erneut anmelden.'
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// POST /api/user/account/restore - Konto wiederherstellen (innerhalb 30 Tage)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      )
    }

    // User finden (auch gelöschte)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        password: true, 
        isDeleted: true, 
        deletedAt: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Konto nicht gefunden" }, { status: 404 })
    }

    if (!user.isDeleted) {
      return NextResponse.json(
        { error: "Dieses Konto ist nicht gelöscht. Bitte melden Sie sich normal an." },
        { status: 400 }
      )
    }

    // Prüfe ob innerhalb der 30-Tage-Frist
    if (user.deletedAt) {
      const daysSinceDeletion = Math.floor(
        (Date.now() - new Date(user.deletedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceDeletion > 30) {
        return NextResponse.json(
          { error: "Die Wiederherstellungsfrist von 30 Tagen ist abgelaufen" },
          { status: 400 }
        )
      }
    }

    // Passwort prüfen
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Das Passwort ist nicht korrekt" },
          { status: 400 }
        )
      }
    }

    // Konto wiederherstellen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    })

    // Security Log erstellen
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        userEmail: email,
        event: 'USER_CREATED', // Wiederherstellung als "Erstellung" loggen
        status: 'SUCCESS',
        message: 'Benutzer hat sein gelöschtes Konto wiederhergestellt',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Ihr Konto wurde erfolgreich wiederhergestellt. Sie können sich jetzt anmelden.'
    })
  } catch (error) {
    console.error("Error restoring account:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}






