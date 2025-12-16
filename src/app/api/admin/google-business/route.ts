import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    // Get all connections with user info
    const connections = await prisma.googleBusinessConnection.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      total: connections.length,
      active: connections.filter(c => c.status === 'ACTIVE').length,
      expired: connections.filter(c => c.status === 'EXPIRED').length,
      revoked: connections.filter(c => c.status === 'REVOKED').length,
      error: connections.filter(c => c.status === 'ERROR').length,
    }

    // Get premium users count
    const premiumUsers = await prisma.user.count({
      where: { stripeSubscriptionStatus: 'active' }
    })

    // Get users by role with connections
    const usersByRole = await prisma.googleBusinessConnection.groupBy({
      by: ['userId'],
      _count: true,
    })

    return NextResponse.json({
      connections: connections.map(c => ({
        id: c.id,
        userId: c.userId,
        googleEmail: c.googleEmail,
        locationName: c.locationName,
        status: c.status,
        lastSyncedAt: c.lastSyncedAt,
        errorMessage: c.errorMessage,
        createdAt: c.createdAt,
        user: c.user,
      })),
      stats: {
        ...stats,
        premiumUsers,
        connectionRate: premiumUsers > 0 ? Math.round((stats.active / premiumUsers) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Error getting admin Google Business data:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Daten' },
      { status: 500 }
    )
  }
}

// Delete a connection (admin)
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
      return NextResponse.json(
        { error: 'connectionId erforderlich' },
        { status: 400 }
      )
    }

    // Delete the connection
    await prisma.googleBusinessConnection.delete({
      where: { id: connectionId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Verbindung gelöscht'
    })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Verbindung' },
      { status: 500 }
    )
  }
}

