import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

/**
 * Admin-Route zum Hochladen von Dokumenten für Nutzer
 * Wird verwendet, wenn der Admin Dokumente per E-Mail vom Nutzer erhalten hat
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    // Nur Admins dürfen Dokumente für andere hochladen
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const documentKey = formData.get('documentKey') as string
    const onboardingId = formData.get('onboardingId') as string

    if (!file || !userId || !documentKey || !onboardingId) {
      return NextResponse.json(
        { error: 'Fehlende Parameter' },
        { status: 400 }
      )
    }

    // Validiere den Dokumententyp
    const validDocumentKeys = [
      'masterCertificate',
      'businessRegistration',
      'liabilityInsurance',
      'statusDetermination',
      'craftsChamber',
    ]
    
    if (!validDocumentKeys.includes(documentKey)) {
      return NextResponse.json(
        { error: 'Ungültiger Dokumententyp' },
        { status: 400 }
      )
    }

    // Prüfe ob Onboarding existiert
    const onboarding = await prisma.stylistOnboarding.findUnique({
      where: { id: onboardingId },
    })

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding nicht gefunden' },
        { status: 404 }
      )
    }

    // Upload zu Vercel Blob
    const fileName = `onboarding/${userId}/${documentKey}_${Date.now()}_${file.name}`
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    // Erstelle das Update-Objekt basierend auf dem Dokumententyp
    const updateData: Record<string, any> = {}
    
    switch (documentKey) {
      case 'masterCertificate':
        updateData.masterCertificateUrl = blob.url
        updateData.masterCertificateStatus = 'UPLOADED'
        updateData.masterCertificateNotAvailable = false
        break
      case 'businessRegistration':
        updateData.businessRegistrationUrl = blob.url
        updateData.businessRegistrationStatus = 'UPLOADED'
        updateData.businessRegistrationNotAvailable = false
        break
      case 'liabilityInsurance':
        updateData.liabilityInsuranceUrl = blob.url
        updateData.liabilityInsuranceStatus = 'UPLOADED'
        updateData.liabilityInsuranceNotAvailable = false
        break
      case 'statusDetermination':
        updateData.statusDeterminationUrl = blob.url
        updateData.statusDeterminationStatus = 'UPLOADED'
        updateData.statusDeterminationNotAvailable = false
        break
      case 'craftsChamber':
        updateData.craftsChamberUrl = blob.url
        updateData.craftsChamberStatus = 'UPLOADED'
        updateData.craftsChamberNotAvailable = false
        break
    }

    // Aktualisiere das Onboarding
    const updatedOnboarding = await prisma.stylistOnboarding.update({
      where: { id: onboardingId },
      data: updateData,
    })

    // Prüfe ob jetzt alle Dokumente vollständig sind
    const allDocumentsComplete = 
      updatedOnboarding.masterCertificateUrl &&
      updatedOnboarding.businessRegistrationUrl &&
      updatedOnboarding.liabilityInsuranceUrl &&
      updatedOnboarding.statusDeterminationUrl &&
      updatedOnboarding.craftsChamberUrl

    // Wenn alle Dokumente da sind und Status war PENDING_DOCUMENTS, setze auf PENDING_REVIEW
    let newStatus = updatedOnboarding.onboardingStatus
    if (allDocumentsComplete && updatedOnboarding.onboardingStatus === 'PENDING_DOCUMENTS') {
      await prisma.stylistOnboarding.update({
        where: { id: onboardingId },
        data: { onboardingStatus: 'PENDING_REVIEW' },
      })
      newStatus = 'PENDING_REVIEW'
    }

    // Log the admin action
    console.log(`Admin ${session.user.email} uploaded ${documentKey} for user ${userId}`)

    return NextResponse.json({
      success: true,
      url: blob.url,
      documentKey,
      newStatus,
    })
  } catch (error) {
    console.error('Admin upload error:', error)
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen' },
      { status: 500 }
    )
  }
}

