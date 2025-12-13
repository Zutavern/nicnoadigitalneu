import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hole Onboarding-Daten
    const onboarding = await prisma.stylistOnboarding.findUnique({
      where: { userId: session.user.id },
    })

    if (!onboarding) {
      return NextResponse.json({
        compliance: {
          ownPhone: null,
          ownAppointmentBook: null,
          ownCashRegister: null,
          ownPriceList: null,
          ownBranding: null,
        },
        documents: {
          masterCertificate: { uploaded: false, notAvailable: false },
          businessRegistration: { uploaded: false, notAvailable: false },
          liabilityInsurance: { uploaded: false, notAvailable: false },
          statusDetermination: { uploaded: false, notAvailable: false },
          craftsChamber: { uploaded: false, notAvailable: false },
        },
      })
    }

    // Formatiere die Antwort
    const response = {
      compliance: {
        ownPhone: onboarding.ownPhoneAnswer || (onboarding.ownPhone ? 'yes' : null),
        ownAppointmentBook: onboarding.ownAppointmentBookAnswer || (onboarding.ownAppointmentBook ? 'yes' : null),
        ownCashRegister: onboarding.ownCashRegisterAnswer || (onboarding.ownCashRegister ? 'yes' : null),
        ownPriceList: onboarding.ownPriceListAnswer || (onboarding.ownPriceList ? 'yes' : null),
        ownBranding: onboarding.ownBrandingAnswer || (onboarding.ownBranding ? 'yes' : null),
      },
      documents: {
        masterCertificate: {
          uploaded: !!onboarding.masterCertificateUrl || onboarding.masterCertificateStatus === 'UPLOADED',
          notAvailable: onboarding.masterCertificateNotAvailable || false,
        },
        businessRegistration: {
          uploaded: !!onboarding.businessRegistrationUrl || onboarding.businessRegistrationStatus === 'UPLOADED',
          notAvailable: onboarding.businessRegistrationNotAvailable || false,
        },
        liabilityInsurance: {
          uploaded: !!onboarding.liabilityInsuranceUrl || onboarding.liabilityInsuranceStatus === 'UPLOADED',
          notAvailable: onboarding.liabilityInsuranceNotAvailable || false,
        },
        statusDetermination: {
          uploaded: !!onboarding.statusDeterminationUrl || onboarding.statusDeterminationStatus === 'UPLOADED',
          notAvailable: onboarding.statusDeterminationNotAvailable || false,
        },
        craftsChamber: {
          uploaded: !!onboarding.craftsChamberUrl || onboarding.craftsChamberStatus === 'UPLOADED',
          notAvailable: onboarding.craftsChamberNotAvailable || false,
        },
      },
      businessData: {
        companyName: onboarding.companyName,
        street: onboarding.street,
        postalCode: onboarding.postalCode,
        city: onboarding.city,
      },
      step: onboarding.step,
      status: onboarding.status,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
