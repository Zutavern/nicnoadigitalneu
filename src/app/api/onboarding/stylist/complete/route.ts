import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyAllAdmins } from '@/lib/notifications'
import { OnboardingStatus } from '@prisma/client'

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

    // Compliance-Punkte müssen beantwortet sein (egal ob ja/nein/in Arbeit)
    const requiredComplianceKeys = ['ownPhone', 'ownAppointmentBook', 'ownCashRegister', 'ownPriceList', 'ownBranding']
    const allComplianceAnswered = requiredComplianceKeys.every(key => 
      compliance?.[key] === 'yes' || compliance?.[key] === 'no' || compliance?.[key] === 'pending'
    )
    
    if (!allComplianceAnswered) {
      return NextResponse.json(
        { error: 'Alle Compliance-Fragen müssen beantwortet sein' },
        { status: 400 }
      )
    }

    if (!declaration) {
      return NextResponse.json(
        { error: 'Rechtliche Erklärung muss akzeptiert werden' },
        { status: 400 }
      )
    }

    // Prüfe ob alle Dokumente vorhanden sind (hochgeladen ODER als "nicht verfügbar" markiert)
    const requiredDocuments = ['masterCertificate', 'businessRegistration', 'liabilityInsurance', 'statusDetermination', 'craftsChamber']
    const allDocumentsHandled = requiredDocuments.every(key => 
      documentUrls?.[key] || documentNotAvailable?.[key]
    )
    
    // Bestimme den Status: PENDING_DOCUMENTS wenn Dokumente fehlen, sonst PENDING_REVIEW
    const onboardingStatus: OnboardingStatus = allDocumentsHandled ? 'PENDING_REVIEW' : 'PENDING_DOCUMENTS'

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
        onboardingStatus: onboardingStatus,
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
        onboardingStatus: onboardingStatus,
      },
    })

    // Markiere User-Onboarding als abgeschlossen (vorläufig, auch wenn Dokumente fehlen)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    })

    // Benachrichtige alle Admins über den neuen Onboarding-Antrag
    try {
      const notificationMessage = onboardingStatus === 'PENDING_DOCUMENTS'
        ? `${session.user.name || session.user.email} hat das Onboarding vorläufig abgeschlossen. Dokumente fehlen noch.`
        : `${session.user.name || session.user.email} hat das Compliance-Onboarding abgeschlossen und wartet auf Prüfung.`
      
      await notifyAllAdmins({
        type: 'ONBOARDING_SUBMITTED',
        title: onboardingStatus === 'PENDING_DOCUMENTS' ? 'Onboarding vorläufig abgeschlossen' : 'Neuer Onboarding-Antrag',
        message: notificationMessage,
        link: '/admin/onboarding-review',
        metadata: {
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          companyName: businessData.companyName,
          status: onboardingStatus,
        },
      })
    } catch (notificationError) {
      console.error('Error sending admin notifications:', notificationError)
      // Fahre fort, auch wenn Benachrichtigung fehlschlägt
    }

    return NextResponse.json({ 
      success: true,
      message: onboardingStatus === 'PENDING_DOCUMENTS' 
        ? 'Onboarding vorläufig abgeschlossen. Du kannst fehlende Dokumente jederzeit nachreichen.'
        : 'Onboarding erfolgreich abgeschlossen',
      status: onboardingStatus,
      documentsComplete: allDocumentsHandled,
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

