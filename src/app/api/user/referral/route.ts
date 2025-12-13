import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generiert einen kurzen, einzigartigen Referral-Code
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// Generiert einen Code für eine einzelne Einladung
function generateInviteCode(): string {
  return `INV-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
}

// GET: Referral-Daten des aktuellen Benutzers abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email || ''
    const userRole = session.user.role || 'STYLIST'

    // UserReferralProfile abrufen oder erstellen
    let profile = await prisma.userReferralProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      // Neues Profil erstellen
      profile = await prisma.userReferralProfile.create({
        data: {
          userId,
          userRole,
          referralCode: generateReferralCode(),
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarnings: 0,
          pendingRewards: 0,
          totalReferredRevenue: 0,
          totalCommissionEarned: 0,
          totalClicks: 0,
          isActive: true,
          commissionRate: 10,
        },
      })
    }

    // Alle Referrals des Benutzers abrufen
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { invitedAt: 'desc' },
    })

    // Ausstehende Belohnungen abrufen
    const pendingRewards = await prisma.referralReward.findMany({
      where: {
        userId,
        isApplied: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Statistiken berechnen
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length
    const successfulReferrals = referrals.filter(r => ['CONVERTED', 'REWARDED'].includes(r.status)).length
    const totalEarnings = referrals
      .filter(r => r.rewardApplied && r.rewardValue)
      .reduce((sum, r) => sum + Number(r.rewardValue || 0), 0)
    const pendingRewardsValue = pendingRewards.reduce((sum, r) => sum + Number(r.rewardValue), 0)

    // Basis-URL für den Referral-Link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnoa.de'
    const referralLink = `${baseUrl}/register?ref=${profile.referralCode}`

    return NextResponse.json({
      profile: {
        referralCode: profile.referralCode,
        totalReferrals: profile.totalReferrals,
        successfulReferrals: profile.successfulReferrals,
        totalEarnings: Number(profile.totalEarnings),
        pendingRewardsCount: profile.pendingRewards,
        pendingRewardsValue: Number(profile.totalCommissionEarned),
      },
      referralCode: profile.referralCode,
      referralLink,
      referrals: referrals.map(r => ({
        id: r.id,
        referredEmail: r.referredEmail,
        referredName: r.referredName,
        code: r.code,
        status: r.status,
        invitedAt: r.invitedAt.toISOString(),
        registeredAt: r.registeredAt?.toISOString() || null,
        convertedAt: r.convertedAt?.toISOString() || null,
        rewardType: r.rewardType,
        rewardValue: r.rewardValue ? Number(r.rewardValue) : null,
        rewardApplied: r.rewardApplied,
      })),
      pendingRewards: pendingRewards.map(r => ({
        id: r.id,
        rewardType: r.rewardType,
        rewardValue: Number(r.rewardValue),
        description: r.description,
        expiresAt: r.expiresAt?.toISOString() || null,
      })),
      stats: {
        totalReferrals: referrals.length,
        pendingReferrals,
        successfulReferrals,
        totalEarnings,
        pendingRewardsCount: pendingRewards.length,
        pendingRewardsValue,
      },
    })
  } catch (error) {
    console.error('Fehler beim Laden der Referral-Daten:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Daten' },
      { status: 500 }
    )
  }
}

// POST: Neue Einladung erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email || ''
    const userRole = session.user.role || 'STYLIST'

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfen ob Email bereits eingeladen wurde
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: userId,
        referredEmail: email.toLowerCase(),
        status: { in: ['PENDING', 'REGISTERED', 'CONVERTED'] },
      },
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse wurde bereits eingeladen' },
        { status: 400 }
      )
    }

    // Prüfen ob Email bereits registriert ist
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      )
    }

    // UserReferralProfile sicherstellen
    let profile = await prisma.userReferralProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      profile = await prisma.userReferralProfile.create({
        data: {
          userId,
          userRole,
          referralCode: generateReferralCode(),
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarnings: 0,
          pendingRewards: 0,
          isActive: true,
        },
      })
    }

    // Ablaufdatum: 30 Tage
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Neuen Referral erstellen
    const referral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referrerEmail: userEmail,
        referrerRole: userRole,
        referredEmail: email.toLowerCase(),
        referredName: name || null,
        code: generateInviteCode(),
        status: 'PENDING',
        expiresAt,
        rewardType: 'FREE_MONTH',
        rewardValue: 29.99, // Standard-Wert eines Monats
      },
    })

    // Statistik aktualisieren
    await prisma.userReferralProfile.update({
      where: { userId },
      data: {
        totalReferrals: { increment: 1 },
      },
    })

    // Optional: E-Mail an eingeladene Person senden
    // TODO: Email-Service implementieren
    // await sendReferralInviteEmail({
    //   to: email,
    //   referrerName: session.user.name || 'Ein Freund',
    //   referralCode: profile.referralCode,
    // })

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        referredEmail: referral.referredEmail,
        referredName: referral.referredName,
        code: referral.code,
        status: referral.status,
        invitedAt: referral.invitedAt.toISOString(),
        expiresAt: referral.expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Fehler beim Erstellen der Einladung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Einladung' },
      { status: 500 }
    )
  }
}
