import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Get the user and their stylist profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stylistProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    const profile = user.stylistProfile

    return NextResponse.json({
      name: user.name || '',
      email: user.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      address: profile?.street || '',
      city: profile?.city || '',
      zipCode: profile?.zipCode || '',
      instagramUrl: profile?.instagramUrl || '',
      tiktokUrl: profile?.tiktokUrl || '',
      websiteUrl: profile?.websiteUrl || '',
      emailNotifications: profile?.emailNotifications ?? true,
      smsNotifications: profile?.smsNotifications ?? false,
      bookingReminders: profile?.bookingReminders ?? true,
      marketingEmails: profile?.marketingEmails ?? false,
      newBookingAlert: profile?.newBookingAlert ?? true,
      cancellationAlert: profile?.cancellationAlert ?? true,
      reviewAlert: profile?.reviewAlert ?? true,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    })
  } catch (error) {
    console.error('Error fetching stylist settings:', error)
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
      name,
      email,
      phone,
      bio,
      address,
      city,
      zipCode,
      instagramUrl,
      tiktokUrl,
      websiteUrl,
      emailNotifications,
      smsNotifications,
      bookingReminders,
      marketingEmails,
      newBookingAlert,
      cancellationAlert,
      reviewAlert,
      twoFactorEnabled,
    } = body

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        twoFactorEnabled,
      },
    })

    // Update or create StylistProfile
    await prisma.stylistProfile.upsert({
      where: { userId: session.user.id },
      update: {
        phone,
        bio,
        street: address,
        city,
        zipCode,
        instagramUrl,
        tiktokUrl,
        websiteUrl,
        emailNotifications,
        smsNotifications,
        bookingReminders,
        marketingEmails,
        newBookingAlert,
        cancellationAlert,
        reviewAlert,
      },
      create: {
        userId: session.user.id,
        phone,
        bio,
        street: address,
        city,
        zipCode,
        instagramUrl,
        tiktokUrl,
        websiteUrl,
        emailNotifications,
        smsNotifications,
        bookingReminders,
        marketingEmails,
        newBookingAlert,
        cancellationAlert,
        reviewAlert,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stylist settings:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
