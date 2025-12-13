import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { BackupFrequency } from '@prisma/client'

// GET /api/admin/backup/config - Get backup configuration
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create config
    let config = await prisma.backupConfig.findFirst()
    
    if (!config) {
      config = await prisma.backupConfig.create({
        data: {
          isEnabled: false,
          frequency: 'DAILY',
          scheduledTime: '03:00',
          scheduledDays: [],
          retentionDays: 30,
          maxBackups: 10,
          storageProvider: 'local',
          compressionEnabled: true,
          compressionLevel: 6,
          encryptionEnabled: false,
          notifyOnSuccess: false,
          notifyOnFailure: true,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching backup config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backup configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/backup/config - Update backup configuration
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      isEnabled,
      frequency,
      scheduledTime,
      scheduledDays,
      retentionDays,
      maxBackups,
      storageProvider,
      storagePath,
      compressionEnabled,
      compressionLevel,
      encryptionEnabled,
      notifyOnSuccess,
      notifyOnFailure,
      notificationEmail,
    } = body

    // Calculate next backup time
    const nextBackupAt = calculateNextBackupTime(
      isEnabled,
      frequency as BackupFrequency,
      scheduledTime,
      scheduledDays
    )

    // Get or create config
    let config = await prisma.backupConfig.findFirst()
    
    if (!config) {
      config = await prisma.backupConfig.create({
        data: {
          isEnabled,
          frequency: frequency as BackupFrequency,
          scheduledTime,
          scheduledDays,
          retentionDays,
          maxBackups,
          storageProvider,
          storagePath,
          compressionEnabled,
          compressionLevel,
          encryptionEnabled,
          notifyOnSuccess,
          notifyOnFailure,
          notificationEmail,
          nextBackupAt,
        },
      })
    } else {
      config = await prisma.backupConfig.update({
        where: { id: config.id },
        data: {
          isEnabled,
          frequency: frequency as BackupFrequency,
          scheduledTime,
          scheduledDays,
          retentionDays,
          maxBackups,
          storageProvider,
          storagePath,
          compressionEnabled,
          compressionLevel,
          encryptionEnabled,
          notifyOnSuccess,
          notifyOnFailure,
          notificationEmail,
          nextBackupAt,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating backup config:', error)
    return NextResponse.json(
      { error: 'Failed to update backup configuration' },
      { status: 500 }
    )
  }
}

function calculateNextBackupTime(
  isEnabled: boolean,
  frequency: BackupFrequency,
  scheduledTime: string,
  scheduledDays: number[]
): Date | null {
  if (!isEnabled) return null

  const now = new Date()
  const [hours, minutes] = scheduledTime.split(':').map(Number)
  
  const next = new Date(now)
  next.setHours(hours, minutes, 0, 0)

  // If time has passed today, move to next occurrence
  if (next <= now) {
    switch (frequency) {
      case 'HOURLY':
        next.setHours(next.getHours() + 1)
        break
      case 'DAILY':
        next.setDate(next.getDate() + 1)
        break
      case 'WEEKLY':
        // Find next scheduled day
        if (scheduledDays.length > 0) {
          const currentDay = now.getDay()
          let daysUntilNext = 7
          for (const day of scheduledDays) {
            const diff = (day - currentDay + 7) % 7
            if (diff > 0 && diff < daysUntilNext) {
              daysUntilNext = diff
            }
          }
          next.setDate(next.getDate() + daysUntilNext)
        } else {
          next.setDate(next.getDate() + 7)
        }
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1)
        break
      case 'CUSTOM':
        // Find next scheduled day
        if (scheduledDays.length > 0) {
          const currentDay = now.getDay()
          let daysUntilNext = 7
          for (const day of scheduledDays) {
            const diff = (day - currentDay + 7) % 7
            if (diff > 0 && diff < daysUntilNext) {
              daysUntilNext = diff
            }
          }
          next.setDate(next.getDate() + daysUntilNext)
        }
        break
    }
  }

  return next
}

