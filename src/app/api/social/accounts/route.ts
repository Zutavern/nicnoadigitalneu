import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/social/accounts - Alle verbundenen Accounts abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    
    const where: Record<string, unknown> = {
      userId: session.user.id,
      isActive: true,
    }
    
    if (platform) {
      where.platform = platform
    }
    
    const accounts = await prisma.socialMediaAccount.findMany({
      where,
      orderBy: [
        { platform: 'asc' },
        { accountName: 'asc' },
      ],
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        accountName: true,
        accountHandle: true,
        profileImageUrl: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        metricsUpdatedAt: true,
        isActive: true,
        lastSyncAt: true,
        lastError: true,
        createdAt: true,
      },
    })
    
    // Gruppiert nach Plattform zurückgeben
    const grouped = accounts.reduce((acc, account) => {
      const platform = account.platform
      if (!acc[platform]) {
        acc[platform] = []
      }
      acc[platform].push(account)
      return acc
    }, {} as Record<string, typeof accounts>)
    
    return NextResponse.json({
      accounts,
      grouped,
      total: accounts.length,
    })
  } catch (error) {
    console.error('[Social Accounts GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Accounts' },
      { status: 500 }
    )
  }
}

// POST /api/social/accounts - Neuen Account verbinden (nach OAuth)
// Diese Route wird nach erfolgreichem OAuth-Callback aufgerufen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    
    const {
      platform,
      platformAccountId,
      accountName,
      accountHandle,
      profileImageUrl,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      tokenScope,
    } = body
    
    // Validierung
    if (!platform || !platformAccountId || !accountName || !accessToken) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      )
    }
    
    // Prüfen ob Account bereits existiert
    const existingAccount = await prisma.socialMediaAccount.findUnique({
      where: {
        userId_platform_platformAccountId: {
          userId: session.user.id,
          platform,
          platformAccountId,
        },
      },
    })
    
    if (existingAccount) {
      // Account aktualisieren
      const updatedAccount = await prisma.socialMediaAccount.update({
        where: { id: existingAccount.id },
        data: {
          accountName,
          accountHandle,
          profileImageUrl,
          accessToken,
          refreshToken,
          tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
          tokenScope,
          isActive: true,
          lastError: null,
        },
      })
      
      return NextResponse.json(updatedAccount)
    }
    
    // Neuen Account erstellen
    const account = await prisma.socialMediaAccount.create({
      data: {
        userId: session.user.id,
        platform,
        platformAccountId,
        accountName,
        accountHandle,
        profileImageUrl,
        accessToken,
        refreshToken,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        tokenScope,
      },
    })
    
    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('[Social Accounts POST] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Verbinden des Accounts' },
      { status: 500 }
    )
  }
}

