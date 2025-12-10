import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import emails from '@/lib/email'

// Vercel Cron: Runs daily at 9:00 AM UTC
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // 7 days from now
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    // 8 days from now (for range)
    const eightDaysFromNow = new Date(now)
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8)

    // Find users whose subscription expires in 7 days
    const expiringUsers = await prisma.user.findMany({
      where: {
        stripeCurrentPeriodEnd: {
          gte: sevenDaysFromNow,
          lt: eightDaysFromNow,
        },
        stripeSubscriptionStatus: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCurrentPeriodEnd: true,
      },
    })

    let sentCount = 0
    const errors: string[] = []

    for (const user of expiringUsers) {
      try {
        const expirationDate = user.stripeCurrentPeriodEnd?.toLocaleDateString('de-DE') || 'Unbekannt'
        
        await emails.sendSubscriptionExpiring(
          user.email,
          user.name || 'Nutzer',
          expirationDate,
          user.id
        )

        // Create notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SUBSCRIPTION_EXPIRING',
            title: 'Abo läuft bald ab',
            message: `Dein Abonnement läuft am ${expirationDate} ab. Verlängere jetzt, um weiterhin alle Funktionen zu nutzen.`,
            link: '/settings/billing',
          },
        })

        sentCount++
      } catch (err) {
        errors.push(`User ${user.email}: ${err}`)
      }
    }

    // Log the cron execution
    await prisma.securityLog.create({
      data: {
        event: 'CRON_EXECUTION',
        status: 'SUCCESS',
        message: `Subscription warnings: ${sentCount} emails sent for ${expiringUsers.length} users`,
        metadata: { 
          usersFound: expiringUsers.length, 
          emailsSent: sentCount,
          errors: errors.length > 0 ? errors : undefined 
        },
      },
    })

    return NextResponse.json({
      success: true,
      usersFound: expiringUsers.length,
      emailsSent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron subscription-warnings error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}





http://localhost:3000/produkt
