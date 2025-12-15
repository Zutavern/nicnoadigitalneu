import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/social/accounts/[id] - Einzelnen Account abrufen
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            postAccounts: true,
          },
        },
      },
    })
    
    if (!account) {
      return NextResponse.json({ error: 'Account nicht gefunden' }, { status: 404 })
    }
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('[Social Account GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Accounts' },
      { status: 500 }
    )
  }
}

// DELETE /api/social/accounts/[id] - Account trennen
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Prüfen ob Account existiert und dem User gehört
    const existingAccount = await prisma.socialMediaAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existingAccount) {
      return NextResponse.json({ error: 'Account nicht gefunden' }, { status: 404 })
    }
    
    // Account deaktivieren statt löschen (für Historie)
    await prisma.socialMediaAccount.update({
      where: { id },
      data: {
        isActive: false,
        accessToken: '', // Token löschen aus Sicherheitsgründen
        refreshToken: null,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Social Account DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Trennen des Accounts' },
      { status: 500 }
    )
  }
}

