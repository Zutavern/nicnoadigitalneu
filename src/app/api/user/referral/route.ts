import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferralStatus } from '@prisma/client'
import crypto from 'crypto'
import { isDemoModeActive, getMockReferralData } from '@/lib/mock-data'

// Generiere einen einzigartigen Referral-Code
function generateReferralCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Ohne verwirrende Zeichen (0, O, 1, I)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generiere einen permanenten persönlichen Code basierend auf Rolle
function generatePersonalCode(name: string, role: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 6)
  const prefix = role === 'SALON_OWNER' ? 'SALON' : 'STYLE'
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `${prefix}-${cleanName}-${suffix}`
}

// GET /api/user/referral - Referral-Profil und Statistiken abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Nur SALON_OWNER und STYLIST können Referrals nutzen
    if (!['SALON_OWNER', 'STYLIST'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Referral-System nur für Salon-Besitzer und Stylisten verfügbar' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      // Personalisiere Demo-Daten mit User-Info
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.nicnoa.de'
      const mockData = getMockReferralData()
      return NextResponse.json({
        ...mockData,
        referralLink: `${baseUrl}/register?ref=${mockData.referralCode}`,
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Hole oder erstelle Referral-Profil
    let referralProfile = await prisma.userReferralProfile.findUnique({
      where: { userId }
    })

    if (!referralProfile) {
      // Erstelle Referral-Profil für den User
      const userName = session.user.name || 'user'
      let code = generatePersonalCode(userName, userRole)
      
      // Stelle sicher, dass der Code eindeutig ist
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.userReferralProfile.findUnique({
          where: { referralCode: code }
        })
        if (!existing) break
        code = generatePersonalCode(userName, userRole)
        attempts++
      }

      referralProfile = await prisma.userReferralProfile.create({
        data: {
          userId,
          referralCode: code,
          userRole,
          commissionRate: userRole === 'SALON_OWNER' ? 15 : 10 // Salon-Besitzer bekommen mehr
        }
      })
    }

    // Hole alle Referrals des Users
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Hole ausstehende Belohnungen
    const pendingRewards = await prisma.referralReward.findMany({
      where: {
        userId,
        isApplied: false
      }
    })

    // Berechne Statistiken
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'PENDING' || r.status === 'REGISTERED').length,
      successfulReferrals: referrals.filter(r => ['CONVERTED', 'REWARDED'].includes(r.status)).length,
      totalEarnings: referralProfile.totalEarnings,
      pendingRewardsCount: pendingRewards.length,
      pendingRewardsValue: pendingRewards.reduce((sum, r) => sum + Number(r.rewardValue), 0)
    }

    // Referral-Link
    const baseUrl = process.env.NEXTAUTH_URL || 'https://app.nicnoa.de'
    const referralLink = `${baseUrl}/register?ref=${referralProfile.referralCode}`

    return NextResponse.json({
      profile: referralProfile,
      referralCode: referralProfile.referralCode,
      referralLink,
      referrals,
      pendingRewards,
      stats
    })
  } catch (error) {
    console.error('Error fetching referral data:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Referral-Daten' },
      { status: 500 }
    )
  }
}

// POST /api/user/referral - Neue Einladung senden
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'E-Mail-Adresse erforderlich' }, { status: 400 })
    }

    // Validiere E-Mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 })
    }

    // Prüfe ob bereits eingeladen
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referredEmail: email.toLowerCase(),
        status: { in: ['PENDING', 'REGISTERED', 'CONVERTED', 'REWARDED'] }
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Diese Person wurde bereits eingeladen' },
        { status: 400 }
      )
    }

    // Prüfe ob bereits registriert
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Code für diese Einladung
    let code = generateReferralCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.referral.findUnique({
        where: { code }
      })
      if (!existing) break
      code = generateReferralCode()
      attempts++
    }

    // Bestimme die Belohnung basierend auf der Rolle
    const userRole = session.user.role
    const rewardType = 'FREE_MONTH'
    const commissionRate = userRole === 'SALON_OWNER' ? 15 : 10

    // Erstelle Referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referrerEmail: session.user.email || '',
        referrerRole: userRole,
        referredEmail: email.toLowerCase(),
        referredName: name || null,
        code,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
        rewardType,
        commissionRate
      }
    })

    // Update Statistiken im Referral-Profil
    await prisma.userReferralProfile.updateMany({
      where: { userId: session.user.id },
      data: {
        totalReferrals: { increment: 1 }
      }
    })

    // TODO: E-Mail senden (nicht implementiert)
    // await sendReferralEmail(email, code, session.user.name)

    const baseUrl = process.env.NEXTAUTH_URL || 'https://app.nicnoa.de'
    const inviteLink = `${baseUrl}/register?ref=${code}`

    return NextResponse.json({
      success: true,
      message: 'Einladung wurde erstellt',
      referral: {
        id: referral.id,
        email: referral.referredEmail,
        code: referral.code,
        inviteLink,
        expiresAt: referral.expiresAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Einladung' },
      { status: 500 }
    )
  }
}

