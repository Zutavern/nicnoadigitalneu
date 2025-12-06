import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const REFERRAL_COOKIE_NAME = 'nicnoa_referral'
const REFERRAL_COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 Tage in Sekunden

// GET /api/referral/track?code=XXX - Tracke Link-Klick und setze Cookie
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const landingPage = searchParams.get('landing') || request.headers.get('referer')
    const redirectTo = searchParams.get('redirect') || '/register'

    if (!code) {
      // Redirect zur Registrierung ohne Referral
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Suche den Referral-Code
    let referral = await prisma.referral.findUnique({
      where: { code }
    })

    let referralProfileCode: string | null = null

    // Wenn kein direkter Referral gefunden, prüfe permanenten Code
    if (!referral) {
      const profile = await prisma.userReferralProfile.findUnique({
        where: { referralCode: code }
      })

      if (profile && profile.isActive) {
        referralProfileCode = code
        
        // Update Klick-Statistiken
        await prisma.userReferralProfile.update({
          where: { id: profile.id },
          data: {
            totalClicks: { increment: 1 },
            lastClickAt: new Date()
          }
        })
      }
    } else if (referral.status === 'PENDING') {
      // Update Tracking-Daten für den Referral
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          firstVisitAt: referral.firstVisitAt || new Date(),
          utmSource: utmSource || referral.utmSource,
          utmMedium: utmMedium || referral.utmMedium,
          utmCampaign: utmCampaign || referral.utmCampaign,
          landingPage: landingPage || referral.landingPage
        }
      })
    }

    // Setze Cookie für Attribution
    const cookieStore = await cookies()
    const cookieValue = JSON.stringify({
      code,
      visitedAt: new Date().toISOString(),
      utmSource,
      utmMedium,
      utmCampaign
    })

    cookieStore.set(REFERRAL_COOKIE_NAME, cookieValue, {
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    // Redirect zur Registrierung mit dem Code als Parameter
    const redirectUrl = new URL(redirectTo, request.url)
    redirectUrl.searchParams.set('ref', code)
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Error tracking referral:', error)
    return NextResponse.redirect(new URL('/register', request.url))
  }
}

// POST /api/referral/track - Tracking-Daten bei Aktionen aktualisieren
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, referralCode, userId, amount } = body

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral-Code erforderlich' }, { status: 400 })
    }

    // Finde den Referral
    const referral = await prisma.referral.findFirst({
      where: {
        OR: [
          { code: referralCode },
          { referredId: userId }
        ]
      }
    })

    if (!referral) {
      return NextResponse.json({ error: 'Referral nicht gefunden' }, { status: 404 })
    }

    switch (event) {
      case 'registration':
        // Bereits in /api/referral/validate behandelt
        break

      case 'conversion':
        // Wenn ein Abo abgeschlossen wurde
        if (referral.status === 'REGISTERED') {
          await prisma.referral.update({
            where: { id: referral.id },
            data: {
              status: 'CONVERTED',
              convertedAt: new Date()
            }
          })

          // Erstelle Belohnung für den Referrer
          const rewardValue = referral.rewardValue || 29.99 // Standard: 1 Monat gratis
          await prisma.referralReward.create({
            data: {
              userId: referral.referrerId,
              referralId: referral.id,
              rewardType: 'FREE_MONTH',
              rewardValue,
              description: `1 Monat gratis für erfolgreiche Empfehlung von ${referral.referredName || referral.referredEmail}`
            }
          })

          // Update Referral-Profil
          await prisma.userReferralProfile.updateMany({
            where: { userId: referral.referrerId },
            data: {
              successfulReferrals: { increment: 1 },
              pendingRewards: { increment: 1 }
            }
          })
        }
        break

      case 'purchase':
        // Bei jedem Kauf den Umsatz tracken
        if (amount && amount > 0 && referral.referredId) {
          const commission = (amount * Number(referral.commissionRate)) / 100

          await prisma.referral.update({
            where: { id: referral.id },
            data: {
              totalRevenue: { increment: amount },
              totalCommission: { increment: commission },
              lastPurchaseAt: new Date()
            }
          })

          // Update Referral-Profil des Referrers
          await prisma.userReferralProfile.updateMany({
            where: { userId: referral.referrerId },
            data: {
              totalReferredRevenue: { increment: amount },
              totalCommissionEarned: { increment: commission },
              totalEarnings: { increment: commission }
            }
          })
        }
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking referral event:', error)
    return NextResponse.json(
      { error: 'Fehler beim Tracking' },
      { status: 500 }
    )
  }
}


