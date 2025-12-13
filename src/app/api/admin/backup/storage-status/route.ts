import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStorageStatus, listBlobBackups, getBackupStats } from '@/lib/backup'

// GET /api/admin/backup/storage-status - Get storage configuration status
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storageStatus = getStorageStatus()
    const stats = await getBackupStats()
    
    // Get Vercel Blob backups if configured
    let blobInfo = null
    if (storageStatus.provider === 'vercel-blob') {
      const { blobs } = await listBlobBackups()
      blobInfo = {
        count: blobs.length,
        totalSize: blobs.reduce((acc, blob) => acc + blob.size, 0),
      }
    }

    return NextResponse.json({
      storage: storageStatus,
      stats,
      blobInfo,
    })
  } catch (error) {
    console.error('Error getting storage status:', error)
    return NextResponse.json(
      { error: 'Failed to get storage status' },
      { status: 500 }
    )
  }
}

