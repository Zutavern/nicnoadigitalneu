import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockSalonSettings } from '@/lib/mock-data'

export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockSalonSettings())
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Find the salon owned by this user
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    // Get the user's notification settings from SalonProfile and salutation
    const [salonProfile, user] = await Promise.all([
      prisma.salonProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { salutation: true },
      }),
    ])

    return NextResponse.json({
      salutation: user?.salutation || '',
      salonName: salon.name,
      description: salon.description || '',
      address: salon.address,
      city: salon.city,
      zipCode: salon.zipCode,
      phone: salon.phone || '',
      email: salon.email || '',
      website: salon.website || '',
      emailNotifications: salonProfile?.emailNotifications ?? true,
      smsNotifications: salonProfile?.smsNotifications ?? false,
      bookingReminders: salonProfile?.bookingReminders ?? true,
      marketingEmails: salonProfile?.marketingEmails ?? false,
    })
  } catch (error) {
    console.error('Error fetching salon settings:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const {
      salutation,
      salonName,
      description,
      address,
      city,
      zipCode,
      phone,
      email,
      website,
      emailNotifications,
      smsNotifications,
      bookingReminders,
      marketingEmails,
    } = body

    // Update user salutation if provided
    if (salutation) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { salutation },
      })
    }

    // Find the salon owned by this user
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    // Update salon
    await prisma.salon.update({
      where: { id: salon.id },
      data: {
        name: salonName,
        description,
        address,
        city,
        zipCode,
        phone,
        email,
        website,
      },
    })

    // Update or create SalonProfile for notification settings
    await prisma.salonProfile.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        smsNotifications,
        bookingReminders,
        marketingEmails,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        smsNotifications,
        bookingReminders,
        marketingEmails,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating salon settings:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
