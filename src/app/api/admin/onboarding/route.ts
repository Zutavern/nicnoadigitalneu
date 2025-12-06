import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Alle Onboarding-Anträge abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Nur Admins dürfen diese Route nutzen
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const onboardings = await prisma.stylistOnboarding.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Daten für das Frontend aufbereiten
    const applications = onboardings.map(onboarding => ({
      id: onboarding.id,
      userId: onboarding.userId,
      user: {
        name: onboarding.user.name,
        email: onboarding.user.email,
      },
      companyName: onboarding.companyName,
      taxId: onboarding.taxId,
      businessStreet: onboarding.businessStreet,
      businessCity: onboarding.businessCity,
      businessZipCode: onboarding.businessZipCode,
      onboardingStatus: onboarding.onboardingStatus,
      currentStep: onboarding.currentStep,
      createdAt: onboarding.createdAt.toISOString(),
      updatedAt: onboarding.updatedAt.toISOString(),
      documents: {
        masterCertificate: { 
          url: onboarding.masterCertificateUrl, 
          status: onboarding.masterCertificateStatus 
        },
        businessRegistration: { 
          url: onboarding.businessRegistrationUrl, 
          status: onboarding.businessRegistrationStatus 
        },
        liabilityInsurance: { 
          url: onboarding.liabilityInsuranceUrl, 
          status: onboarding.liabilityInsuranceStatus 
        },
        statusDetermination: { 
          url: onboarding.statusDeterminationUrl, 
          status: onboarding.statusDeterminationStatus 
        },
        craftsChamber: { 
          url: onboarding.craftsChamberUrl, 
          status: onboarding.craftsChamberStatus 
        },
      },
      compliance: {
        ownPhone: onboarding.ownPhone,
        ownAppointmentBook: onboarding.ownAppointmentBook,
        ownCashRegister: onboarding.ownCashRegister,
        ownPriceList: onboarding.ownPriceList,
        ownBranding: onboarding.ownBranding,
      },
      selfEmploymentDeclaration: onboarding.selfEmploymentDeclaration,
      adminNotes: onboarding.adminNotes,
    }))

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching onboarding applications:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Anträge' },
      { status: 500 }
    )
  }
}

