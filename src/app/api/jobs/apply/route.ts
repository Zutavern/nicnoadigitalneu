import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

// POST - Bewerbung einreichen
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const jobId = formData.get('jobId') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string | null
    const coverLetter = formData.get('coverLetter') as string | null
    const cvFile = formData.get('cv') as File | null

    if (!jobId || !firstName || !lastName || !email || !cvFile) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt sein' },
        { status: 400 }
      )
    }

    // Prüfe ob Job existiert (außer bei Initiativbewerbungen)
    if (jobId !== 'initiativ') {
      const job = await prisma.jobPosting.findUnique({
        where: { id: jobId, isActive: true },
      })

      if (!job) {
        return NextResponse.json(
          { error: 'Job nicht gefunden' },
          { status: 404 }
        )
      }
    }

    // Upload CV zu Vercel Blob
    const folder = jobId === 'initiativ' ? 'initiativ' : jobId
    const blob = await put(`job-applications/${folder}/${Date.now()}-${cvFile.name}`, cvFile, {
      access: 'public',
      contentType: cvFile.type,
    })

    // Speichere Bewerbung in Datenbank
    // Für Initiativbewerbungen: jobId ist null
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId === 'initiativ' ? null : jobId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        coverLetter: coverLetter || null,
        cvUrl: blob.url,
        cvFileName: cvFile.name,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Bewerbung erfolgreich eingereicht!',
      applicationId: application.id,
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Fehler beim Einreichen der Bewerbung' },
      { status: 500 }
    )
  }
}

