import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

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
        adminNotes: null,
      })
    }

    // Count uploaded documents
    const documentStatuses = [
      onboarding.masterCertificateStatus,
      onboarding.businessRegistrationStatus,
      onboarding.liabilityInsuranceStatus,
      onboarding.statusDeterminationStatus,
      onboarding.craftsChamberStatus,
    ]

    const documentsUploaded = documentStatuses.filter(
      status => status === 'UPLOADED' || status === 'APPROVED'
    ).length

    return NextResponse.json({
      exists: true,
      status: onboarding.onboardingStatus,
      currentStep: onboarding.currentStep,
      documentsUploaded,
      documentsTotal: 5,
      adminNotes: onboarding.adminNotes,
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Status' },
      { status: 500 }
    )
  }
}







