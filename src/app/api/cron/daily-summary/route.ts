import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Vercel Cron: Runs daily at 6:00 AM UTC
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
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Get daily statistics
    const [
      newUsers,
      newBookings,
      completedBookings,
      totalRevenue,
      newReviews,
      newRentals,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: todayStart } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: yesterday, lt: todayStart } },
      }),
      prisma.booking.count({
        where: { 
          status: 'COMPLETED',
          updatedAt: { gte: yesterday, lt: todayStart } 
        },
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: yesterday, lt: todayStart } 
        },
        _sum: { amount: true },
      }),
      prisma.review.count({
        where: { createdAt: { gte: yesterday, lt: todayStart } },
      }),
      prisma.chairRental.count({
        where: { createdAt: { gte: yesterday, lt: todayStart } },
      }),
    ])

    // Send to all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true },
    })

    let sentCount = 0
    const errors: string[] = []

    for (const admin of admins) {
      try {
        await sendEmail({
          to: admin.email,
          templateSlug: 'daily-summary',
          data: {
            userName: admin.name || 'Admin',
            date: yesterday.toLocaleDateString('de-DE'),
            newUsers,
            newBookings,
            completedBookings,
            totalRevenue: `${(totalRevenue._sum.amount?.toNumber() || 0).toFixed(2)} €`,
            newReviews,
            newRentals,
            dashboardUrl: `${process.env.NEXTAUTH_URL}/admin`,
          },
          userId: admin.id,
        })
        sentCount++
      } catch (err) {
        errors.push(`Admin ${admin.email}: ${err}`)
      }
    }

    // Log the cron execution
    await prisma.securityLog.create({
      data: {
        event: 'CRON_EXECUTION',
        status: 'SUCCESS',
        message: `Daily summary: ${sentCount} emails sent to admins`,
        metadata: { 
          stats: { newUsers, newBookings, completedBookings, newReviews, newRentals },
          emailsSent: sentCount,
          errors: errors.length > 0 ? errors : undefined 
        },
      },
    })

    return NextResponse.json({
      success: true,
      stats: { newUsers, newBookings, completedBookings, newReviews, newRentals },
      emailsSent: sentCount,
    })
  } catch (error) {
    console.error('Cron daily-summary error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}




