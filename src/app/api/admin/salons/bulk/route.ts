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

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ids, reason } = body

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({ 
        success: true, 
        message: `Demo-Modus: ${ids.length} Salons wurden ${getActionLabel(action)}`,
        affectedCount: ids.length 
      })
    }

    const adminId = session.user.id

    switch (action) {
      case 'delete': {
        const result = await prisma.salon.updateMany({
          where: {
            id: { in: ids },
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: adminId,
          },
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Salons wurden gelöscht`,
          affectedCount: result.count 
        })
      }

      case 'block': {
        const result = await prisma.salon.updateMany({
          where: {
            id: { in: ids },
            isBlocked: false,
          },
          data: {
            isBlocked: true,
            blockedAt: new Date(),
            blockedBy: adminId,
            blockReason: reason || 'Keine Angabe',
          },
        })

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Salons wurden gesperrt`,
          affectedCount: result.count 
        })
      }

      case 'unblock': {
        const result = await prisma.salon.updateMany({
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

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Salons wurden entsperrt`,
          affectedCount: result.count 
        })
      }

      case 'restore': {
        const result = await prisma.salon.updateMany({
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

        return NextResponse.json({ 
          success: true, 
          message: `${result.count} Salons wurden wiederhergestellt`,
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


