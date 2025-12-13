import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBackup } from '@/lib/backup'

// GET /api/admin/backup - List all backups
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where = status ? { status: status as 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED' } : {}

    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          config: {
            select: {
              storageProvider: true,
            },
          },
          _count: {
            select: { restoreAttempts: true },
          },
        },
      }),
      prisma.backup.count({ where }),
    ])

    return NextResponse.json({
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching backups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}

// POST /api/admin/backup - Create a new manual backup
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { tables } = body // Optional: specific tables to backup

    // Get config
    const config = await prisma.backupConfig.findFirst()
    
    if (!config) {
      return NextResponse.json(
        { error: 'Backup not configured' },
        { status: 400 }
      )
    }

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        configId: config.id,
        filename: `backup_manual_${Date.now()}.sql`,
        filePath: '',
        fileSize: BigInt(0),
        status: 'IN_PROGRESS',
        type: 'MANUAL',
        includeTables: tables || [],
        isCompressed: config.compressionEnabled,
        isEncrypted: config.encryptionEnabled,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + config.retentionDays * 24 * 60 * 60 * 1000),
      },
    })

    // Start backup process in background
    createBackup(backup.id).catch((err) => {
      console.error('Background backup failed:', err)
    })

    return NextResponse.json({
      message: 'Backup started',
      backupId: backup.id,
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/backup - Delete a backup
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const backupId = searchParams.get('id')

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID required' },
        { status: 400 }
      )
    }

    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    })

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      )
    }

    // Delete backup file from storage
    // TODO: Implement file deletion based on storage provider

    // Delete from database
    await prisma.backup.delete({
      where: { id: backupId },
    })

    return NextResponse.json({ message: 'Backup deleted' })
  } catch (error) {
    console.error('Error deleting backup:', error)
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}

