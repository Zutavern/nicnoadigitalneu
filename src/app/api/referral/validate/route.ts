import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/referral/validate?code=XXX - Prüfe ob Referral-Code gültig ist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code erforderlich' }, { status: 400 })
    }

    // Suche in Referrals (einmalige Codes)
    const referral = await prisma.referral.findUnique({
      where: { code }
    })

    if (referral) {
      // Prüfe ob gültig
      if (referral.status !== 'PENDING') {
        return NextResponse.json({
          valid: false,
          error: 'Dieser Code wurde bereits verwendet oder ist abgelaufen'
        })
      }

      if (new Date() > referral.expiresAt) {
        return NextResponse.json({
          valid: false,
          error: 'Dieser Code ist abgelaufen'
        })
      }

      // Hole Referrer-Infos
      const referrer = await prisma.user.findUnique({
        where: { id: referral.referrerId },
        select: { name: true }
      })

      return NextResponse.json({
        valid: true,
        type: 'invite',
        code: referral.code,
        referrerName: referrer?.name || 'Ein Freund',
        benefit: 'Erhalte 1 Monat gratis nach deinem ersten Abonnement!'
      })
    }

    // Suche in UserReferralProfiles (permanente Codes)
    const profile = await prisma.userReferralProfile.findUnique({
      where: { referralCode: code }
    })

    if (profile && profile.isActive) {
      const referrer = await prisma.user.findUnique({
        where: { id: profile.userId },
        select: { name: true }
      })

      return NextResponse.json({
        valid: true,
        type: 'permanent',
        code: profile.referralCode,
        referrerName: referrer?.name || 'Ein Freund',
        benefit: 'Erhalte 1 Monat gratis nach deinem ersten Abonnement!'
      })
    }

    return NextResponse.json({
      valid: false,
      error: 'Ungültiger Referral-Code'
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json(
      { valid: false, error: 'Fehler bei der Validierung' },
      { status: 500 }
    )
  }
}

// POST /api/referral/validate - Registrierung mit Referral-Code abschließen
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, userId, userEmail } = body

    if (!code || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Code, User-ID und E-Mail erforderlich' },
        { status: 400 }
      )
    }

    // Suche den Referral
    let referral = await prisma.referral.findFirst({
      where: {
        OR: [
          { code }, // Einmaliger Code
          { referredEmail: userEmail.toLowerCase() } // Wurde explizit eingeladen
        ],
        status: 'PENDING'
      }
    })

    // Falls kein direkter Referral, prüfe permanenten Code
    if (!referral) {
      const profile = await prisma.userReferralProfile.findUnique({
        where: { referralCode: code }
      })

      if (profile && profile.isActive) {
        // Erstelle einen neuen Referral-Eintrag für den permanenten Code
        referral = await prisma.referral.create({
          data: {
            referrerId: profile.userId,
            referrerEmail: '', // Wird später gefüllt
            referredEmail: userEmail.toLowerCase(),
            referredId: userId,
            code: `${code}-${Date.now()}`, // Eindeutiger Code
            status: 'REGISTERED',
            registeredAt: new Date(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Tage für Konvertierung
            rewardType: 'FREE_MONTH'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Referral-Code erfolgreich angewendet',
          referralId: referral.id
        })
      }

      return NextResponse.json({ error: 'Ungültiger Referral-Code' }, { status: 400 })
    }

    // Prüfe Gültigkeit
    if (new Date() > referral.expiresAt) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Dieser Code ist abgelaufen' }, { status: 400 })
    }

    // Aktualisiere den Referral
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId: userId,
        status: 'REGISTERED',
        registeredAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Referral-Code erfolgreich angewendet',
      referralId: referral.id
    })
  } catch (error) {
    console.error('Error applying referral code:', error)
    return NextResponse.json(
      { error: 'Fehler beim Anwenden des Referral-Codes' },
      { status: 500 }
    )
  }
}



