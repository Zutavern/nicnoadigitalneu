import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'Datei und Dokumenttyp erforderlich' },
        { status: 400 }
      )
    }

    // Validierung der Dateitypen
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur PDF, JPG, PNG und Word-Dateien erlaubt' },
        { status: 400 }
      )
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei darf maximal 10MB groß sein' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const fileExt = file.name.split('.').pop()
    const fileName = `${documentType}-${Date.now()}.${fileExt}`
    const blobPath = `documents/${session.user.id}/${fileName}`

    // Upload zu Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      url: blob.url,
      fileName,
      documentType,
      success: true 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    )
  }
}
