import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive } from '@/lib/demo-mode'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Nur Admins dürfen Bulk-Aktionen ausführen
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ids, reason } = body

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    // Demo-Modus Check
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      // Im Demo-Modus simulieren wir nur die Aktion
      return NextResponse.json({ 
        success: true, 
        message: `Demo-Modus: ${ids.length} Benutzer wurden ${getActionLabel(action)}`,
        affectedCount: ids.length 
      })
    }

    const adminId = session.user.id

    switch (action) {
      case 'delete': {
        // Soft Delete: isDeleted auf true setzen
        const result = await prisma.user.updateMany({
          where: {
            id: { in: ids },
            role: { not: UserRole.ADMIN }, // Admins können nicht gelöscht werden
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: adminId,
          },
        })

        // Security Log erstellen
        await prisma.securityLog.createMany({
          data: ids.map((userId: string) => ({
            userId,
            userEmail: 'bulk-action',
            event: 'USER_DELETED',
            status: 'SUCCESS',
            message: `Benutzer wurde von Admin (${session.user.email}) gelöscht. Grund: ${reason || 'Kein Grund angegeben'}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          })),
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Benutzer wurden gelöscht`,
          affectedCount: result.count 
        })
      }

      case 'block': {
        const result = await prisma.user.updateMany({
          where: {
            id: { in: ids },
            role: { not: UserRole.ADMIN },
            isBlocked: false,
          },
          data: {
            isBlocked: true,
            blockedAt: new Date(),
            blockedBy: adminId,
            blockReason: reason || 'Keine Angabe',
          },
        })

        // Alle aktiven Sessions dieser Benutzer beenden
        await prisma.session.deleteMany({
          where: {
            userId: { in: ids },
          },
        })

        await prisma.securityLog.createMany({
          data: ids.map((userId: string) => ({
            userId,
            userEmail: 'bulk-action',
            event: 'PERMISSION_CHANGED',
            status: 'WARNING',
            message: `Benutzer wurde von Admin (${session.user.email}) gesperrt. Grund: ${reason || 'Kein Grund angegeben'}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          })),
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Benutzer wurden gesperrt`,
          affectedCount: result.count 
        })
      }

      case 'unblock': {
        const result = await prisma.user.updateMany({
          where: {
            id: { in: ids },
            isBlocked: true,
          },
          data: {
            isBlocked: false,
            blockedAt: null,
            blockedBy: null,
            blockReason: null,
          },
        })

        await prisma.securityLog.createMany({
          data: ids.map((userId: string) => ({
            userId,
            userEmail: 'bulk-action',
            event: 'PERMISSION_CHANGED',
            status: 'SUCCESS',
            message: `Benutzer wurde von Admin (${session.user.email}) entsperrt`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          })),
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Benutzer wurden entsperrt`,
          affectedCount: result.count 
        })
      }

      case 'restore': {
        const result = await prisma.user.updateMany({
          where: {
            id: { in: ids },
            isDeleted: true,
          },
          data: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
          },
        })

        await prisma.securityLog.createMany({
          data: ids.map((userId: string) => ({
            userId,
            userEmail: 'bulk-action',
            event: 'USER_CREATED', // Wiederherstellung als Erstellung loggen
            status: 'SUCCESS',
            message: `Benutzer wurde von Admin (${session.user.email}) wiederhergestellt`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          })),
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Benutzer wurden wiederhergestellt`,
          affectedCount: result.count 
        })
      }

      default:
        return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'delete': return 'gelöscht'
    case 'block': return 'gesperrt'
    case 'unblock': return 'entsperrt'
    case 'restore': return 'wiederhergestellt'
    default: return 'bearbeitet'
  }
}


