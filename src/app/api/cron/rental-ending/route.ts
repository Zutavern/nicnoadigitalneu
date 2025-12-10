import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Vercel Cron: Runs daily at 10:00 AM UTC
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
    
    // Find rentals ending in 30 days
    const thirtyDaysFromNow = new Date(now)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const thirtyOneDaysFromNow = new Date(now)
    thirtyOneDaysFromNow.setDate(thirtyOneDaysFromNow.getDate() + 31)

    const endingRentals = await prisma.chairRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: thirtyDaysFromNow,
          lt: thirtyOneDaysFromNow,
        },
      },
      include: {
        stylist: {
          select: { id: true, name: true, email: true },
        },
        chair: {
          include: {
            salon: {
              include: {
                owner: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
    })

    let sentCount = 0
    const errors: string[] = []

    for (const rental of endingRentals) {
      const endDate = rental.endDate?.toLocaleDateString('de-DE') || 'Unbekannt'
      
      // Notify stylist
      try {
        await sendEmail({
          to: rental.stylist.email,
          templateSlug: 'rental-ending-soon',
          data: {
            userName: rental.stylist.name || 'Stylist',
            salonName: rental.chair.salon.name,
            chairName: rental.chair.name,
            endDate,
            daysRemaining: 30,
          },
          userId: rental.stylist.id,
        })

        await prisma.notification.create({
          data: {
            userId: rental.stylist.id,
            type: 'RENTAL_UPDATE',
            title: 'Mietvertrag endet bald',
            message: `Dein Mietvertrag für ${rental.chair.name} bei ${rental.chair.salon.name} endet am ${endDate}.`,
            link: '/stylist/workspace',
          },
        })
        sentCount++
      } catch (err) {
        errors.push(`Stylist ${rental.stylist.email}: ${err}`)
      }

      // Notify salon owner
      try {
        await sendEmail({
          to: rental.chair.salon.owner.email,
          templateSlug: 'rental-ending-soon',
          data: {
            userName: rental.chair.salon.owner.name || 'Salon-Besitzer',
            salonName: rental.chair.salon.name,
            chairName: rental.chair.name,
            stylistName: rental.stylist.name,
            endDate,
            daysRemaining: 30,
          },
          userId: rental.chair.salon.owner.id,
        })

        await prisma.notification.create({
          data: {
            userId: rental.chair.salon.owner.id,
            type: 'RENTAL_UPDATE',
            title: 'Mietvertrag endet bald',
            message: `Der Mietvertrag von ${rental.stylist.name} für ${rental.chair.name} endet am ${endDate}.`,
            link: '/salon/stylists',
          },
        })
        sentCount++
      } catch (err) {
        errors.push(`Owner ${rental.chair.salon.owner.email}: ${err}`)
      }
    }

    // Log the cron execution
    await prisma.securityLog.create({
      data: {
        event: 'CRON_EXECUTION',
        status: 'SUCCESS',
        message: `Rental ending warnings: ${sentCount} emails sent for ${endingRentals.length} rentals`,
        metadata: { 
          rentalsFound: endingRentals.length, 
          emailsSent: sentCount,
          errors: errors.length > 0 ? errors : undefined 
        },
      },
    })

    return NextResponse.json({
      success: true,
      rentalsFound: endingRentals.length,
      emailsSent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron rental-ending error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}





