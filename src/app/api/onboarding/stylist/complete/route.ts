import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyAllAdmins } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessData, compliance, documentUrls, documentNotAvailable, declaration } = body

    // Validierung der erforderlichen Daten
    if (!businessData?.companyName || !businessData?.businessStreet || !businessData?.businessCity || !businessData?.businessZipCode) {
      return NextResponse.json(
        { error: 'Geschäftsdaten unvollständig' },
        { status: 400 }
      )
    }

    // Prüfe ob alle Compliance-Punkte mit "yes" beantwortet wurden
    const requiredComplianceKeys = ['ownPhone', 'ownAppointmentBook', 'ownCashRegister', 'ownPriceList', 'ownBranding']
    const allComplianceChecked = requiredComplianceKeys.every(key => compliance?.[key] === 'yes')
    
    if (!allComplianceChecked) {
      return NextResponse.json(
        { error: 'Alle Compliance-Punkte müssen mit "Ja" beantwortet sein' },
        { status: 400 }
      )
    }

    if (!declaration) {
      return NextResponse.json(
        { error: 'Rechtliche Erklärung muss akzeptiert werden' },
        { status: 400 }
      )
    }

    // Erstelle oder aktualisiere den Onboarding-Datensatz
    await prisma.stylistOnboarding.upsert({
      where: { userId: session.user.id },
      update: {
        // Geschäftsdaten
        companyName: businessData.companyName,
        taxId: businessData.taxId || null,
        vatId: businessData.vatId || null,
        businessStreet: businessData.businessStreet,
        businessCity: businessData.businessCity,
        businessZipCode: businessData.businessZipCode,
        
        // Compliance - Boolean für Kompatibilität + Antwort-String
        ownPhone: compliance.ownPhone === 'yes',
        ownPhoneAnswer: compliance.ownPhone,
        ownAppointmentBook: compliance.ownAppointmentBook === 'yes',
        ownAppointmentBookAnswer: compliance.ownAppointmentBook,
        ownCashRegister: compliance.ownCashRegister === 'yes',
        ownCashRegisterAnswer: compliance.ownCashRegister,
        ownPriceList: compliance.ownPriceList === 'yes',
        ownPriceListAnswer: compliance.ownPriceList,
        ownBranding: compliance.ownBranding === 'yes',
        ownBrandingAnswer: compliance.ownBranding,
        complianceConfirmedAt: new Date(),
        
        // Dokumente mit "nicht verfügbar" Flags
        masterCertificateUrl: documentUrls?.masterCertificate || null,
        masterCertificateStatus: documentUrls?.masterCertificate ? 'UPLOADED' : 'PENDING',
        masterCertificateNotAvailable: documentNotAvailable?.masterCertificate || false,
        
        businessRegistrationUrl: documentUrls?.businessRegistration || null,
        businessRegistrationStatus: documentUrls?.businessRegistration ? 'UPLOADED' : 'PENDING',
        businessRegistrationNotAvailable: documentNotAvailable?.businessRegistration || false,
        
        liabilityInsuranceUrl: documentUrls?.liabilityInsurance || null,
        liabilityInsuranceStatus: documentUrls?.liabilityInsurance ? 'UPLOADED' : 'PENDING',
        liabilityInsuranceNotAvailable: documentNotAvailable?.liabilityInsurance || false,
        
        statusDeterminationUrl: documentUrls?.statusDetermination || null,
        statusDeterminationStatus: documentUrls?.statusDetermination ? 'UPLOADED' : 'PENDING',
        statusDeterminationNotAvailable: documentNotAvailable?.statusDetermination || false,
        
        craftsChamberUrl: documentUrls?.craftsChamber || null,
        craftsChamberStatus: documentUrls?.craftsChamber ? 'UPLOADED' : 'PENDING',
        craftsChamberNotAvailable: documentNotAvailable?.craftsChamber || false,
        
        // Erklärung
        selfEmploymentDeclaration: declaration,
        declarationSignedAt: new Date(),
        
        // Status
        currentStep: 4,
        onboardingStatus: 'PENDING_REVIEW',
      },
      create: {
        userId: session.user.id,
        companyName: businessData.companyName,
        taxId: businessData.taxId || null,
        vatId: businessData.vatId || null,
        businessStreet: businessData.businessStreet,
        businessCity: businessData.businessCity,
        businessZipCode: businessData.businessZipCode,
        
        // Compliance
        ownPhone: compliance.ownPhone === 'yes',
        ownPhoneAnswer: compliance.ownPhone,
        ownAppointmentBook: compliance.ownAppointmentBook === 'yes',
        ownAppointmentBookAnswer: compliance.ownAppointmentBook,
        ownCashRegister: compliance.ownCashRegister === 'yes',
        ownCashRegisterAnswer: compliance.ownCashRegister,
        ownPriceList: compliance.ownPriceList === 'yes',
        ownPriceListAnswer: compliance.ownPriceList,
        ownBranding: compliance.ownBranding === 'yes',
        ownBrandingAnswer: compliance.ownBranding,
        complianceConfirmedAt: new Date(),
        
        // Dokumente
        masterCertificateUrl: documentUrls?.masterCertificate || null,
        masterCertificateStatus: documentUrls?.masterCertificate ? 'UPLOADED' : 'PENDING',
        masterCertificateNotAvailable: documentNotAvailable?.masterCertificate || false,
        
        businessRegistrationUrl: documentUrls?.businessRegistration || null,
        businessRegistrationStatus: documentUrls?.businessRegistration ? 'UPLOADED' : 'PENDING',
        businessRegistrationNotAvailable: documentNotAvailable?.businessRegistration || false,
        
        liabilityInsuranceUrl: documentUrls?.liabilityInsurance || null,
        liabilityInsuranceStatus: documentUrls?.liabilityInsurance ? 'UPLOADED' : 'PENDING',
        liabilityInsuranceNotAvailable: documentNotAvailable?.liabilityInsurance || false,
        
        statusDeterminationUrl: documentUrls?.statusDetermination || null,
        statusDeterminationStatus: documentUrls?.statusDetermination ? 'UPLOADED' : 'PENDING',
        statusDeterminationNotAvailable: documentNotAvailable?.statusDetermination || false,
        
        craftsChamberUrl: documentUrls?.craftsChamber || null,
        craftsChamberStatus: documentUrls?.craftsChamber ? 'UPLOADED' : 'PENDING',
        craftsChamberNotAvailable: documentNotAvailable?.craftsChamber || false,
        
        selfEmploymentDeclaration: declaration,
        declarationSignedAt: new Date(),
        currentStep: 4,
        onboardingStatus: 'PENDING_REVIEW',
      },
    })

    // Markiere User-Onboarding als abgeschlossen
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    })

    // Benachrichtige alle Admins über den neuen Onboarding-Antrag
    try {
      await notifyAllAdmins({
        type: 'ONBOARDING_SUBMITTED',
        title: 'Neuer Onboarding-Antrag',
        message: `${session.user.name || session.user.email} hat das Compliance-Onboarding abgeschlossen und wartet auf Prüfung.`,
        link: '/admin/onboarding-review',
        metadata: {
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          companyName: businessData.companyName,
        },
      })
    } catch (notificationError) {
      console.error('Error sending admin notifications:', notificationError)
      // Fahre fort, auch wenn Benachrichtigung fehlschlägt
    }

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding erfolgreich abgeschlossen'
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

