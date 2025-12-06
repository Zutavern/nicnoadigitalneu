import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Vercel Cron: Runs weekly on Monday at 8:00 AM UTC
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
    
    // Find active rentals where payment is due within next 7 days
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const activeRentals = await prisma.chairRental.findMany({
      where: {
        status: 'ACTIVE',
        // Assuming monthly rent, check if we're in the last week of the month
      },
      include: {
        stylist: {
          select: { id: true, name: true, email: true },
        },
        chair: {
          include: {
            salon: {
              select: { name: true },
            },
          },
        },
      },
    })

    let sentCount = 0
    const errors: string[] = []

    // Check if it's the last week of the month (rent reminder)
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const isLastWeek = dayOfMonth >= daysInMonth - 7

    if (isLastWeek) {
      for (const rental of activeRentals) {
        try {
          const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          const amount = rental.monthlyRate?.toString() || rental.chair.monthlyRate?.toString() || '0'

          await sendEmail({
            to: rental.stylist.email,
            templateSlug: 'rent-payment-due',
            data: {
              userName: rental.stylist.name || 'Stylist',
              salonName: rental.chair.salon.name,
              chairName: rental.chair.name,
              amount: `${amount} €`,
              dueDate: dueDate.toLocaleDateString('de-DE'),
            },
            userId: rental.stylist.id,
          })

          // Create notification
          await prisma.notification.create({
            data: {
              userId: rental.stylist.id,
              type: 'RENTAL_UPDATE',
              title: 'Mietzahlung fällig',
              message: `Deine Stuhlmiete für ${rental.chair.salon.name} wird am ${dueDate.toLocaleDateString('de-DE')} fällig.`,
              link: '/stylist/workspace',
            },
          })

          sentCount++
        } catch (err) {
          errors.push(`Rental ${rental.id}: ${err}`)
        }
      }
    }

    // Check for overdue rentals (past due date with isPaid = false)
    const overdueRentals = await prisma.chairRental.findMany({
      where: {
        status: 'ACTIVE',
        // Find rentals where we should have a payment but don't
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

    // Log the cron execution
    await prisma.securityLog.create({
      data: {
        event: 'CRON_EXECUTION',
        status: 'SUCCESS',
        message: `Rent reminders: ${sentCount} emails sent (${isLastWeek ? 'last week of month' : 'not due yet'})`,
        metadata: { 
          activeRentals: activeRentals.length, 
          emailsSent: sentCount,
          isLastWeek,
          errors: errors.length > 0 ? errors : undefined 
        },
      },
    })

    return NextResponse.json({
      success: true,
      activeRentals: activeRentals.length,
      emailsSent: sentCount,
      isLastWeek,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron rent-reminders error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

