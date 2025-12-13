import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBackup } from '@/lib/backup'
import { ServerSystemEvents } from '@/lib/analytics-server'

// This should be called by Vercel Cron or similar
// Set up cron expression in vercel.json: "0 * * * *" (every hour)
export async function GET(request: Request) {
  try {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get backup config
    const config = await prisma.backupConfig.findFirst()
    
    if (!config || !config.isEnabled) {
      return NextResponse.json({ 
        message: 'Backup is disabled or not configured',
        executed: false 
      })
    }

    // Check if it's time for a backup
    const now = new Date()
    
    if (!config.nextBackupAt || now < config.nextBackupAt) {
      return NextResponse.json({ 
        message: 'Not time for backup yet',
        nextBackupAt: config.nextBackupAt,
        executed: false 
      })
    }

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        configId: config.id,
        filename: `backup_scheduled_${Date.now()}.sql`,
        filePath: '',
        fileSize: BigInt(0),
        status: 'IN_PROGRESS',
        type: 'SCHEDULED',
        includeTables: [],
        isCompressed: config.compressionEnabled,
        isEncrypted: config.encryptionEnabled,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + config.retentionDays * 24 * 60 * 60 * 1000),
      },
    })

    // Calculate next backup time
    const nextBackupAt = calculateNextBackupTime(config)

    // Update config with next backup time
    await prisma.backupConfig.update({
      where: { id: config.id },
      data: { nextBackupAt },
    })

    // Execute backup
    try {
      await createBackup(backup.id)
      
      // Track success
      await ServerSystemEvents.cronJobCompleted('backup', true, {
        backupId: backup.id,
        type: 'SCHEDULED',
      })

      // Send success notification if enabled
      if (config.notifyOnSuccess && config.notificationEmail) {
        await sendBackupNotification(
          config.notificationEmail,
          'Backup erfolgreich',
          `Das geplante Backup wurde erfolgreich erstellt.`
        )
      }

      return NextResponse.json({
        message: 'Backup completed successfully',
        backupId: backup.id,
        nextBackupAt,
        executed: true,
      })
    } catch (backupError) {
      console.error('Backup execution failed:', backupError)
      
      // Track failure
      await ServerSystemEvents.cronJobCompleted('backup', false, {
        backupId: backup.id,
        error: backupError instanceof Error ? backupError.message : 'Unknown error',
      })

      // Send failure notification if enabled
      if (config.notifyOnFailure && config.notificationEmail) {
        await sendBackupNotification(
          config.notificationEmail,
          'Backup fehlgeschlagen',
          `Das geplante Backup ist fehlgeschlagen: ${backupError instanceof Error ? backupError.message : 'Unbekannter Fehler'}`
        )
      }

      return NextResponse.json({
        message: 'Backup failed',
        backupId: backup.id,
        error: backupError instanceof Error ? backupError.message : 'Unknown error',
        nextBackupAt,
        executed: true,
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Backup cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateNextBackupTime(config: {
  frequency: string
  scheduledTime: string
  scheduledDays: number[]
}): Date {
  const now = new Date()
  const [hours, minutes] = config.scheduledTime.split(':').map(Number)
  
  const next = new Date(now)
  next.setHours(hours, minutes, 0, 0)

  // Move to next occurrence based on frequency
  switch (config.frequency) {
    case 'HOURLY':
      next.setHours(now.getHours() + 1)
      next.setMinutes(0, 0, 0)
      break
      
    case 'DAILY':
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      break
      
    case 'WEEKLY':
    case 'CUSTOM':
      if (config.scheduledDays.length > 0) {
        // Find next scheduled day
        let found = false
        for (let i = 0; i <= 7; i++) {
          const checkDate = new Date(now)
          checkDate.setDate(now.getDate() + i)
          checkDate.setHours(hours, minutes, 0, 0)
          
          if (config.scheduledDays.includes(checkDate.getDay()) && checkDate > now) {
            next.setTime(checkDate.getTime())
            found = true
            break
          }
        }
        
        if (!found) {
          // Default to next week same day
          next.setDate(next.getDate() + 7)
        }
      } else {
        // No specific days, default to 7 days
        next.setDate(next.getDate() + 7)
      }
      break
      
    case 'MONTHLY':
      if (next <= now) {
        next.setMonth(next.getMonth() + 1)
      }
      break
      
    default:
      // Default to daily
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
  }

  return next
}

async function sendBackupNotification(
  email: string,
  subject: string,
  message: string
): Promise<void> {
  // TODO: Implement email sending using your email service
  // For now, just log
  console.log(`[Backup Notification] To: ${email}, Subject: ${subject}, Message: ${message}`)
  
  // You could use something like:
  // await sendEmail({ to: email, subject, text: message })
}

