import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hole Onboarding-Daten und User-Daten (für Anrede)
    const [onboarding, user] = await Promise.all([
      prisma.stylistOnboarding.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { salutation: true },
      }),
    ])

    if (!onboarding) {
      return NextResponse.json({
        exists: false,
        status: null,
        currentStep: 0,
        documentsUploaded: 0,
        documentsTotal: 5,
        documentsMissing: 5,
        documentsMarkedLater: 0,
        complianceTotal: 5,
        complianceYes: 0,
        complianceNo: 0,
        compliancePending: 0,
        complianceUnanswered: 5,
        complianceNeedsAttention: 0,
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
        businessData: {
          salutation: user?.salutation || '',
          companyName: '',
          taxId: '',
          vatId: '',
          businessStreet: '',
          businessZipCode: '',
          businessCity: '',
        },
      })
    }

    // Berechne Dokument-Statistiken
    // Wichtig: Explizit prüfen ob URL vorhanden ist (nicht nur truthy check)
    const documentsData = {
      masterCertificate: {
        uploaded: Boolean(onboarding.masterCertificateUrl && onboarding.masterCertificateUrl.length > 0),
        notAvailable: Boolean(onboarding.masterCertificateNotAvailable),
        url: onboarding.masterCertificateUrl || undefined,
      },
      businessRegistration: {
        uploaded: Boolean(onboarding.businessRegistrationUrl && onboarding.businessRegistrationUrl.length > 0),
        notAvailable: Boolean(onboarding.businessRegistrationNotAvailable),
        url: onboarding.businessRegistrationUrl || undefined,
      },
      liabilityInsurance: {
        uploaded: Boolean(onboarding.liabilityInsuranceUrl && onboarding.liabilityInsuranceUrl.length > 0),
        notAvailable: Boolean(onboarding.liabilityInsuranceNotAvailable),
        url: onboarding.liabilityInsuranceUrl || undefined,
      },
      statusDetermination: {
        uploaded: Boolean(onboarding.statusDeterminationUrl && onboarding.statusDeterminationUrl.length > 0),
        notAvailable: Boolean(onboarding.statusDeterminationNotAvailable),
        url: onboarding.statusDeterminationUrl || undefined,
      },
      craftsChamber: {
        uploaded: Boolean(onboarding.craftsChamberUrl && onboarding.craftsChamberUrl.length > 0),
        notAvailable: Boolean(onboarding.craftsChamberNotAvailable),
        url: onboarding.craftsChamberUrl || undefined,
      },
    }

    // Zähle hochgeladene und fehlende Dokumente
    const documentsTotal = 5
    let documentsUploaded = 0
    let documentsMissing = 0
    let documentsMarkedLater = 0 // Als "wird nachgereicht" markiert
    
    Object.values(documentsData).forEach(doc => {
      if (doc.uploaded) {
        documentsUploaded++
      } else if (doc.notAvailable) {
        // Als "wird nachgereicht" markiert - zählt nicht als fehlend
        documentsMarkedLater++
      } else {
        // Weder hochgeladen noch als "später" markiert = fehlt
        documentsMissing++
      }
    })

    // Compliance-Statistiken berechnen
    const complianceAnswers = {
      ownPhone: onboarding.ownPhoneAnswer || (onboarding.ownPhone ? 'yes' : null),
      ownAppointmentBook: onboarding.ownAppointmentBookAnswer || (onboarding.ownAppointmentBook ? 'yes' : null),
      ownCashRegister: onboarding.ownCashRegisterAnswer || (onboarding.ownCashRegister ? 'yes' : null),
      ownPriceList: onboarding.ownPriceListAnswer || (onboarding.ownPriceList ? 'yes' : null),
      ownBranding: onboarding.ownBrandingAnswer || (onboarding.ownBranding ? 'yes' : null),
    }
    
    const complianceTotal = 5
    let complianceYes = 0
    let complianceNo = 0
    let compliancePending = 0
    let complianceUnanswered = 0
    
    Object.values(complianceAnswers).forEach(answer => {
      if (answer === 'yes') {
        complianceYes++
      } else if (answer === 'no') {
        complianceNo++
      } else if (answer === 'pending') {
        compliancePending++
      } else {
        complianceUnanswered++
      }
    })
    
    // "Noch zu klären" = Nein + In Arbeit (nicht "Ja")
    const complianceNeedsAttention = complianceNo + compliancePending

    // Formatiere die Antwort
    const response = {
      exists: true,
      status: onboarding.onboardingStatus,
      currentStep: onboarding.currentStep,
      documentsUploaded,
      documentsTotal,
      documentsMissing,
      documentsMarkedLater,
      complianceTotal,
      complianceYes,
      complianceNo,
      compliancePending,
      complianceUnanswered,
      complianceNeedsAttention,
      adminNotes: onboarding.adminNotes,
      compliance: complianceAnswers,
      documents: documentsData,
      businessData: {
        salutation: user?.salutation || '',
        companyName: onboarding.companyName,
        taxId: onboarding.taxId,
        vatId: onboarding.vatId,
        businessStreet: onboarding.businessStreet,
        businessZipCode: onboarding.businessZipCode,
        businessCity: onboarding.businessCity,
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
