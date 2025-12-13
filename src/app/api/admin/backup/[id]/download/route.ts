import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getBackupFile } from '@/lib/backup'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/backup/[id]/download - Download a backup
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const backup = await prisma.backup.findUnique({
      where: { id },
      include: {
        config: true,
      },
    })

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      )
    }

    if (backup.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Backup is not ready for download' },
        { status: 400 }
      )
    }

    // Check if file path exists
    if (!backup.filePath) {
      return NextResponse.json(
        { error: 'Backup file path not found' },
        { status: 404 }
      )
    }

    // Get backup file (handles both Vercel Blob and local storage)
    const { content, url } = await getBackupFile({
      filePath: backup.filePath,
      filename: backup.filename,
    })

    // If it's a Vercel Blob URL, redirect to it
    if (url && url.includes('.blob.vercel-storage.com')) {
      // Update download count
      await prisma.backup.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      })

      // Redirect to the Blob URL for direct download
      return NextResponse.redirect(url)
    }

    // For local files, read and return
    if (content) {
      // Update download count
      await prisma.backup.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      })

      // Determine content type
      const ext = path.extname(backup.filename).toLowerCase()
      let contentType = 'application/octet-stream'
      if (ext === '.sql') contentType = 'application/sql'
      else if (ext === '.gz') contentType = 'application/gzip'
      else if (ext === '.zip') contentType = 'application/zip'

      // Return file
      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${backup.filename}"`,
          'Content-Length': backup.fileSize.toString(),
        },
      })
    }

    // Fallback: Try to read from local path directly
    const filePath = backup.filePath
    if (existsSync(filePath)) {
      const fileBuffer = await readFile(filePath)
      
      await prisma.backup.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      })

      const ext = path.extname(backup.filename).toLowerCase()
      let contentType = 'application/octet-stream'
      if (ext === '.sql') contentType = 'application/sql'
      else if (ext === '.gz') contentType = 'application/gzip'
      else if (ext === '.zip') contentType = 'application/zip'

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${backup.filename}"`,
          'Content-Length': backup.fileSize.toString(),
        },
      })
    }

    return NextResponse.json(
      { error: 'Backup file not found on server' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error downloading backup:', error)
    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    )
  }
}
