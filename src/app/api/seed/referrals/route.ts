import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReferralStatus } from '@prisma/client'

// Realistische Namen für Friseur-Branche
const salonOwnerNames = [
  { name: 'Maria Schneider', email: 'maria.schneider@hairsalon.de' },
  { name: 'Thomas Weber', email: 'thomas.weber@stylestudio.de' },
  { name: 'Anna Schmidt', email: 'anna.schmidt@beautyhair.de' },
  { name: 'Michael Müller', email: 'michael.mueller@hairconcept.de' },
  { name: 'Lisa Wagner', email: 'lisa.wagner@glamourhair.de' },
]

const stylistNames = [
  { name: 'Sophie Becker', email: 'sophie.becker@mail.de' },
  { name: 'Lena Fischer', email: 'lena.fischer@gmail.com' },
  { name: 'Tim Hoffmann', email: 'tim.hoffmann@outlook.de' },
  { name: 'Julia Klein', email: 'julia.klein@web.de' },
  { name: 'Max Richter', email: 'max.richter@gmx.de' },
  { name: 'Laura Braun', email: 'laura.braun@mail.de' },
  { name: 'Niklas Wolf', email: 'niklas.wolf@gmail.com' },
  { name: 'Emma Neumann', email: 'emma.neumann@outlook.de' },
  { name: 'Paul Schwarz', email: 'paul.schwarz@web.de' },
  { name: 'Mia Zimmermann', email: 'mia.zimmermann@gmx.de' },
]

const referredNames = [
  { name: 'Stefan Koch', email: 'stefan.koch@salon-neu.de' },
  { name: 'Claudia Berger', email: 'claudia.berger@haarwerk.de' },
  { name: 'Andreas Krüger', email: 'andreas.krueger@stylist.de' },
  { name: 'Sandra Lange', email: 'sandra.lange@beautycut.de' },
  { name: 'Markus Schmitt', email: 'markus.schmitt@haarpflege.de' },
  { name: 'Nicole Werner', email: 'nicole.werner@friseur.de' },
  { name: 'Christian Hartmann', email: 'christian.hartmann@cutstyle.de' },
  { name: 'Petra Meier', email: 'petra.meier@hairdesign.de' },
  { name: 'Florian Jung', email: 'florian.jung@salonmaster.de' },
  { name: 'Sabine Lehmann', email: 'sabine.lehmann@stylecuts.de' },
  { name: 'Tobias Huber', email: 'tobias.huber@hairpro.de' },
  { name: 'Kathrin Walter', email: 'kathrin.walter@beautybar.de' },
  { name: 'Daniel König', email: 'daniel.koenig@hairstudio.de' },
  { name: 'Martina Schulz', email: 'martina.schulz@cutmaster.de' },
  { name: 'Patrick Frank', email: 'patrick.frank@stylesalon.de' },
  { name: 'Bianca Weber', email: 'bianca.weber@hairart.de' },
  { name: 'Sebastian Lang', email: 'sebastian.lang@friseurprofi.de' },
  { name: 'Christina Beck', email: 'christina.beck@beautycuts.de' },
  { name: 'Oliver Baumann', email: 'oliver.baumann@hairstyle.de' },
  { name: 'Melanie Krause', email: 'melanie.krause@salonexpert.de' },
]

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// POST /api/seed/referrals - Erstelle realistische Referral Demo-Daten
export async function POST() {
  try {
    // Lösche alte Demo-Daten (basierend auf bestimmten E-Mail-Mustern)
    const existingReferrals = await prisma.referral.findMany({
      where: {
        OR: [
          { referrerEmail: { contains: '@hairsalon.de' } },
          { referrerEmail: { contains: '@stylestudio.de' } },
          { referrerEmail: { contains: '@beautyhair.de' } },
          { referrerEmail: { contains: '@hairconcept.de' } },
          { referrerEmail: { contains: '@glamourhair.de' } },
          { referrerEmail: { contains: '@mail.de' } },
          { referrerEmail: { contains: '@gmail.com' } },
          { referrerEmail: { contains: '@outlook.de' } },
          { referrerEmail: { contains: '@web.de' } },
          { referrerEmail: { contains: '@gmx.de' } },
        ]
      }
    })

    if (existingReferrals.length > 0) {
      // Lösche zugehörige Rewards
      await prisma.referralReward.deleteMany({
        where: { referralId: { in: existingReferrals.map(r => r.id) } }
      })
      
      // Lösche Referrals
      await prisma.referral.deleteMany({
        where: { id: { in: existingReferrals.map(r => r.id) } }
      })
    }

    // Lösche alte UserReferralProfiles
    await prisma.userReferralProfile.deleteMany({
      where: {
        referralCode: { startsWith: 'DEMO' }
      }
    })

    // Hole existierende Admin-User für die Demo
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Kein Admin-User gefunden' }, { status: 400 })
    }

    // Erstelle Demo-User für Referrer (wenn nicht vorhanden)
    const allReferrers = [...salonOwnerNames, ...stylistNames]
    const createdReferrers: { id: string; email: string; role: string; name: string }[] = []

    for (let i = 0; i < allReferrers.length; i++) {
      const referrer = allReferrers[i]
      const isSalonOwner = i < salonOwnerNames.length
      
      let user = await prisma.user.findUnique({
        where: { email: referrer.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: referrer.email,
            name: referrer.name,
            role: isSalonOwner ? 'SALON_OWNER' : 'STYLIST',
            emailVerified: new Date(),
          }
        })
      }

      createdReferrers.push({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || referrer.name
      })
    }

    // Erstelle UserReferralProfiles für Referrer
    const referralProfiles: { userId: string; referralCode: string; userRole: string }[] = []
    
    for (const referrer of createdReferrers) {
      const existingProfile = await prisma.userReferralProfile.findUnique({
        where: { userId: referrer.id }
      })

      if (!existingProfile) {
        const profile = await prisma.userReferralProfile.create({
          data: {
            userId: referrer.id,
            userRole: referrer.role,
            referralCode: `DEMO${generateCode()}`,
            totalReferrals: 0,
            successfulReferrals: 0,
            totalEarnings: 0,
            totalReferredRevenue: 0,
            totalClicks: Math.floor(Math.random() * 200) + 50,
          }
        })
        referralProfiles.push(profile)
      } else {
        referralProfiles.push(existingProfile)
      }
    }

    // Erstelle Referrals mit verschiedenen Status
    const referrals: {
      referrerId: string
      referrerEmail: string
      referrerRole: string
      referredEmail: string
      referredId: string | null
      referredName: string | null
      referredRole: string | null
      code: string
      status: ReferralStatus
      invitedAt: Date
      registeredAt: Date | null
      convertedAt: Date | null
      rewardedAt: Date | null
      totalRevenue: number
      totalCommission: number
      rewardType: string | null
      rewardValue: number
      rewardApplied: boolean
    }[] = []

    // Verteilung: 15% PENDING, 20% REGISTERED, 35% CONVERTED, 25% REWARDED, 5% EXPIRED
    const statusDistribution = [
      { status: 'PENDING' as ReferralStatus, count: 6 },
      { status: 'REGISTERED' as ReferralStatus, count: 8 },
      { status: 'CONVERTED' as ReferralStatus, count: 14 },
      { status: 'REWARDED' as ReferralStatus, count: 10 },
      { status: 'EXPIRED' as ReferralStatus, count: 2 },
    ]

    let referredIndex = 0
    
    for (const dist of statusDistribution) {
      for (let i = 0; i < dist.count; i++) {
        const referrer = createdReferrers[Math.floor(Math.random() * createdReferrers.length)]
        const referred = referredNames[referredIndex % referredNames.length]
        referredIndex++

        const invitedAt = randomDate(90) // Letzte 90 Tage
        
        // Realistische Umsätze basierend auf Status
        let totalRevenue = 0
        let totalCommission = 0
        let registeredAt: Date | null = null
        let convertedAt: Date | null = null
        let rewardedAt: Date | null = null
        let referredId: string | null = null
        let referredRole: string | null = null
        let rewardType: string | null = null
        let rewardValue = 0
        let rewardApplied = false

        if (dist.status !== 'PENDING' && dist.status !== 'EXPIRED') {
          registeredAt = addDays(invitedAt, Math.floor(Math.random() * 7) + 1)
          referredRole = Math.random() > 0.6 ? 'STYLIST' : 'SALON_OWNER'
          
          // Erstelle referred User
          let referredUser = await prisma.user.findUnique({
            where: { email: referred.email }
          })

          if (!referredUser) {
            referredUser = await prisma.user.create({
              data: {
                email: referred.email,
                name: referred.name,
                role: referredRole,
                emailVerified: registeredAt,
              }
            })
          }
          referredId = referredUser.id
        }

        if (dist.status === 'CONVERTED' || dist.status === 'REWARDED') {
          convertedAt = registeredAt ? addDays(registeredAt, Math.floor(Math.random() * 14) + 1) : null
          
          // Realistische monatliche Umsätze (3-12 Monate Laufzeit)
          const monthsActive = Math.floor(Math.random() * 10) + 3
          const monthlyRevenue = referredRole === 'SALON_OWNER' 
            ? Math.floor(Math.random() * 300) + 200  // Salon: 200-500€/Monat
            : Math.floor(Math.random() * 150) + 100  // Stylist: 100-250€/Monat
          
          totalRevenue = monthlyRevenue * monthsActive
          totalCommission = Math.round(totalRevenue * 0.1) // 10% Provision
          
          // Belohnungstyp
          rewardType = Math.random() > 0.5 ? 'FREE_MONTH' : 'CREDIT'
          rewardValue = rewardType === 'FREE_MONTH' ? 49 : Math.round(totalCommission * 0.5)
        }

        if (dist.status === 'REWARDED') {
          rewardedAt = convertedAt ? addDays(convertedAt, Math.floor(Math.random() * 30) + 1) : null
          rewardApplied = true
        }

        referrals.push({
          referrerId: referrer.id,
          referrerEmail: referrer.email,
          referrerRole: referrer.role,
          referredEmail: referred.email,
          referredId,
          referredName: referred.name,
          referredRole,
          code: generateCode(),
          status: dist.status,
          invitedAt,
          registeredAt,
          convertedAt,
          rewardedAt,
          totalRevenue,
          totalCommission,
          rewardType,
          rewardValue,
          rewardApplied,
        })
      }
    }

    // Speichere alle Referrals
    const createdReferrals = []
    for (const ref of referrals) {
      const created = await prisma.referral.create({
        data: {
          referrerId: ref.referrerId,
          referrerEmail: ref.referrerEmail,
          referrerRole: ref.referrerRole,
          referredEmail: ref.referredEmail,
          referredId: ref.referredId,
          referredName: ref.referredName,
          referredRole: ref.referredRole,
          code: ref.code,
          status: ref.status,
          invitedAt: ref.invitedAt,
          registeredAt: ref.registeredAt,
          convertedAt: ref.convertedAt,
          rewardedAt: ref.rewardedAt,
          totalRevenue: ref.totalRevenue,
          totalCommission: ref.totalCommission,
          rewardType: ref.rewardType,
          rewardValue: ref.rewardValue,
          rewardApplied: ref.rewardApplied,
        }
      })
      createdReferrals.push(created)

      // Erstelle Rewards für CONVERTED und REWARDED
      if (ref.status === 'CONVERTED' || ref.status === 'REWARDED') {
        await prisma.referralReward.create({
          data: {
            userId: ref.referrerId,
            referralId: created.id,
            rewardType: ref.rewardType || 'CREDIT',
            rewardValue: ref.rewardValue,
            description: ref.rewardType === 'FREE_MONTH' 
              ? `1 Gratis-Monat für Empfehlung von ${ref.referredName}`
              : `${ref.rewardValue}€ Guthaben für Empfehlung von ${ref.referredName}`,
            isApplied: ref.rewardApplied,
            appliedAt: ref.rewardApplied ? ref.rewardedAt : null,
            expiresAt: addDays(ref.convertedAt || new Date(), 365),
          }
        })
      }
    }

    // Update Referral-Profile Statistiken
    for (const referrer of createdReferrers) {
      const referrerReferrals = createdReferrals.filter(r => r.referrerId === referrer.id)
      const successfulReferrals = referrerReferrals.filter(r => 
        r.status === 'CONVERTED' || r.status === 'REWARDED'
      ).length
      const totalRevenue = referrerReferrals.reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0)
      const totalEarnings = referrerReferrals.reduce((sum, r) => sum + Number(r.totalCommission || 0), 0)
      const pendingRewards = referrerReferrals.filter(r => r.status === 'CONVERTED').length

      await prisma.userReferralProfile.updateMany({
        where: { userId: referrer.id },
        data: {
          totalReferrals: referrerReferrals.length,
          successfulReferrals,
          totalReferredRevenue: totalRevenue,
          totalEarnings,
          pendingRewards,
        }
      })
    }

    // Statistiken berechnen
    const stats = {
      totalReferrals: createdReferrals.length,
      byStatus: {
        pending: createdReferrals.filter(r => r.status === 'PENDING').length,
        registered: createdReferrals.filter(r => r.status === 'REGISTERED').length,
        converted: createdReferrals.filter(r => r.status === 'CONVERTED').length,
        rewarded: createdReferrals.filter(r => r.status === 'REWARDED').length,
        expired: createdReferrals.filter(r => r.status === 'EXPIRED').length,
      },
      totalRevenue: createdReferrals.reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0),
      totalCommissions: createdReferrals.reduce((sum, r) => sum + Number(r.totalCommission || 0), 0),
      referrersCreated: createdReferrers.length,
    }

    return NextResponse.json({
      success: true,
      message: `${createdReferrals.length} Referrals erfolgreich erstellt!`,
      stats,
    })
  } catch (error) {
    console.error('Error seeding referrals:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Referral-Daten', details: String(error) },
      { status: 500 }
    )
  }
}

// GET - Zeige aktuelle Referral-Statistiken
export async function GET() {
  try {
    const totalReferrals = await prisma.referral.count()
    const statusStats = await prisma.referral.groupBy({
      by: ['status'],
      _count: true,
    })
    const revenueStats = await prisma.referral.aggregate({
      _sum: {
        totalRevenue: true,
        totalCommission: true,
      }
    })

    return NextResponse.json({
      totalReferrals,
      byStatus: statusStats,
      totalRevenue: Number(revenueStats._sum?.totalRevenue || 0),
      totalCommission: Number(revenueStats._sum?.totalCommission || 0),
    })
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    )
  }
}

