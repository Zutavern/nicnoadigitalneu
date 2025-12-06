import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Lokaler Upload - später auf Vercel Blob umstellen
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
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur PDF, JPG und PNG Dateien erlaubt' },
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

    // Erstelle Verzeichnis für den User
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', session.user.id)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generiere eindeutigen Dateinamen
    const fileExt = file.name.split('.').pop()
    const fileName = `${documentType}-${Date.now()}.${fileExt}`
    const filePath = path.join(uploadDir, fileName)

    // Schreibe Datei
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generiere öffentliche URL
    const url = `/uploads/documents/${session.user.id}/${fileName}`

    return NextResponse.json({ 
      url,
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

