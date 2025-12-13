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
        exists: false,
        status: null,
        currentStep: 0,
        documentsUploaded: 0,
        documentsTotal: 5,
        documentsMissing: 5,
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

    // Berechne Dokument-Statistiken
    const documentsData = {
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
    }

    // Zähle hochgeladene und fehlende Dokumente
    const documentsTotal = 5
    let documentsUploaded = 0
    let documentsMissing = 0
    
    Object.values(documentsData).forEach(doc => {
      if (doc.uploaded) {
        documentsUploaded++
      } else if (!doc.notAvailable) {
        // Nur als fehlend zählen wenn nicht als "nicht verfügbar" markiert
        documentsMissing++
      }
    })

    // Formatiere die Antwort
    const response = {
      exists: true,
      status: onboarding.onboardingStatus,
      currentStep: onboarding.currentStep,
      documentsUploaded,
      documentsTotal,
      documentsMissing,
      adminNotes: onboarding.adminNotes,
      compliance: {
        ownPhone: onboarding.ownPhoneAnswer || (onboarding.ownPhone ? 'yes' : null),
        ownAppointmentBook: onboarding.ownAppointmentBookAnswer || (onboarding.ownAppointmentBook ? 'yes' : null),
        ownCashRegister: onboarding.ownCashRegisterAnswer || (onboarding.ownCashRegister ? 'yes' : null),
        ownPriceList: onboarding.ownPriceListAnswer || (onboarding.ownPriceList ? 'yes' : null),
        ownBranding: onboarding.ownBrandingAnswer || (onboarding.ownBranding ? 'yes' : null),
      },
      documents: documentsData,
      businessData: {
        companyName: onboarding.companyName,
        street: onboarding.businessStreet,
        postalCode: onboarding.businessZipCode,
        city: onboarding.businessCity,
      },
      step: onboarding.currentStep,
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
