import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'
import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync, readFileSync } from 'fs'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { createReadStream } from 'fs'
import { createHash } from 'crypto'
import path from 'path'
import os from 'os'
import { put, del, list, head } from '@vercel/blob'

const execAsync = promisify(exec)

// All tables to backup
const ALL_TABLES = [
  'users',
  'accounts',
  'sessions',
  'verification_tokens',
  'user_profiles',
  'salon_profiles',
  'stylist_profiles',
  'stylist_onboardings',
  'salons',
  'salon_stylist_connections',
  'salon_invitations',
  'chairs',
  'services',
  'salon_services',
  'customers',
  'bookings',
  'reviews',
  'conversations',
  'conversation_participants',
  'messages',
  'notifications',
  'subscription_plans',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'blog_authors',
  'analytics_events',
  'platform_settings',
  'languages',
  'translations',
  'backup_configs',
  'backups',
  'backup_restore_attempts',
]

/**
 * Check if Vercel Blob is configured
 */
function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/**
 * Create a database backup and upload to Vercel Blob
 */
export async function createBackup(backupId: string): Promise<void> {
  const startTime = Date.now()
  
  try {
    // Get backup record and config
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
      include: { config: true },
    })

    if (!backup) {
      throw new Error('Backup record not found')
    }

    const config = backup.config

    // Use temp directory for backup creation
    const backupDir = os.tmpdir()

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const baseFilename = `backup_${timestamp}`
    const sqlFilename = `${baseFilename}.sql`
    const finalFilename = config.compressionEnabled 
      ? `${baseFilename}.sql.gz` 
      : sqlFilename
    const sqlPath = path.join(backupDir, sqlFilename)
    const finalPath = path.join(backupDir, finalFilename)

    // Get database URL
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured')
    }

    // Parse database URL for pg_dump
    const dbUrl = new URL(databaseUrl)
    const host = dbUrl.hostname
    const port = dbUrl.port || '5432'
    const database = dbUrl.pathname.slice(1).split('?')[0] // Remove query params
    const user = dbUrl.username
    const password = dbUrl.password

    // Determine which tables to backup
    const tablesToBackup = backup.includeTables.length > 0 
      ? backup.includeTables 
      : ALL_TABLES

    // Build pg_dump command with SSL mode for Neon
    const tableArgs = tablesToBackup.map(t => `-t ${t}`).join(' ')
    const pgDumpCmd = `PGPASSWORD="${password}" PGSSLMODE=require pg_dump -h ${host} -p ${port} -U ${user} -d ${database} ${tableArgs} --no-owner --no-acl --clean --if-exists -f ${sqlPath}`

    // Execute pg_dump
    await execAsync(pgDumpCmd)

    // Count rows in backup
    const rowCount = await countBackupRows(tablesToBackup)

    // Compress if enabled
    let finalSize: bigint
    let checksum: string
    let blobUrl: string | null = null

    if (config.compressionEnabled) {
      await compressFile(sqlPath, finalPath)
      // Delete uncompressed file
      if (existsSync(sqlPath)) unlinkSync(sqlPath)
      finalSize = BigInt(statSync(finalPath).size)
      checksum = await calculateChecksum(finalPath)
    } else {
      finalSize = BigInt(statSync(sqlPath).size)
      checksum = await calculateChecksum(sqlPath)
    }

    const pathToUpload = config.compressionEnabled ? finalPath : sqlPath

    // Upload to Vercel Blob if configured
    if (isVercelBlobConfigured()) {
      const fileContent = readFileSync(pathToUpload)
      const blob = await put(`backups/${finalFilename}`, fileContent, {
        access: 'public',
        contentType: config.compressionEnabled 
          ? 'application/gzip' 
          : 'application/sql',
      })
      blobUrl = blob.url
      
      // Delete local temp file after upload
      if (existsSync(pathToUpload)) unlinkSync(pathToUpload)
      
      console.log(`Backup uploaded to Vercel Blob: ${blobUrl}`)
    } else {
      // Fallback: Keep local file for development
      const localBackupDir = path.join(process.cwd(), 'backups')
      if (!existsSync(localBackupDir)) {
        mkdirSync(localBackupDir, { recursive: true })
      }
      const localPath = path.join(localBackupDir, finalFilename)
      
      // Move from temp to local backup dir
      if (existsSync(pathToUpload)) {
        const content = readFileSync(pathToUpload)
        const writeStream = createWriteStream(localPath)
        writeStream.write(content)
        writeStream.end()
        unlinkSync(pathToUpload)
      }
      
      blobUrl = localPath
      console.log(`Backup saved locally (Vercel Blob not configured): ${localPath}`)
    }

    const duration = Math.round((Date.now() - startTime) / 1000)

    // Update backup record
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        filename: finalFilename,
        filePath: blobUrl,
        fileSize: finalSize,
        checksum,
        status: 'COMPLETED',
        includeTables: tablesToBackup,
        tableCount: tablesToBackup.length,
        rowCount: BigInt(rowCount),
        completedAt: new Date(),
        duration,
      },
    })

    // Update config last backup time
    await prisma.backupConfig.update({
      where: { id: config.id },
      data: {
        lastBackupAt: new Date(),
      },
    })

    // Cleanup old backups
    await cleanupOldBackups(config.id, config.maxBackups, config.retentionDays)

    console.log(`Backup completed: ${finalFilename} (${formatBytes(Number(finalSize))})`)
  } catch (error) {
    console.error('Backup failed:', error)
    
    // Update backup record with error
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
      },
    })

    throw error
  }
}

/**
 * Compress a file using gzip
 */
async function compressFile(source: string, destination: string): Promise<void> {
  const sourceStream = createReadStream(source)
  const gzip = createGzip({ level: 6 })
  const destinationStream = createWriteStream(destination)
  
  await pipeline(sourceStream, gzip, destinationStream)
}

/**
 * Calculate SHA256 checksum of a file
 */
async function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

/**
 * Count total rows across all backed up tables
 */
async function countBackupRows(tables: string[]): Promise<number> {
  let total = 0
  
  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${table}"`
      )
      total += Number(result[0]?.count || 0)
    } catch {
      // Table might not exist or have different name
      console.warn(`Could not count rows for table: ${table}`)
    }
  }
  
  return total
}

/**
 * Cleanup old backups based on retention policy
 */
async function cleanupOldBackups(
  configId: string,
  maxBackups: number,
  retentionDays: number
): Promise<void> {
  try {
    // Get all completed backups for this config
    const backups = await prisma.backup.findMany({
      where: {
        configId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    })

    const now = new Date()
    const retentionCutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000)

    for (let i = 0; i < backups.length; i++) {
      const backup = backups[i]
      
      // Delete if over max count or past retention period
      if (i >= maxBackups || backup.createdAt < retentionCutoff) {
        // Delete from Vercel Blob if URL is a blob URL
        if (backup.filePath) {
          try {
            if (backup.filePath.includes('.blob.vercel-storage.com')) {
              // Delete from Vercel Blob
              await del(backup.filePath)
              console.log(`Deleted backup from Vercel Blob: ${backup.filename}`)
            } else if (existsSync(backup.filePath)) {
              // Delete local file
              unlinkSync(backup.filePath)
              console.log(`Deleted local backup: ${backup.filename}`)
            }
          } catch (e) {
            console.warn(`Failed to delete backup file: ${backup.filePath}`, e)
          }
        }
        
        // Mark as expired in database
        await prisma.backup.update({
          where: { id: backup.id },
          data: { status: 'EXPIRED' },
        })
      }
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get backup file from Vercel Blob or local storage
 */
export async function getBackupFile(backup: { filePath: string | null; filename: string }): Promise<{
  content: Buffer | null
  url: string | null
}> {
  if (!backup.filePath) {
    return { content: null, url: null }
  }

  // If it's a Vercel Blob URL, return the URL directly
  if (backup.filePath.includes('.blob.vercel-storage.com')) {
    return { content: null, url: backup.filePath }
  }

  // If it's a local file, read and return content
  if (existsSync(backup.filePath)) {
    const content = readFileSync(backup.filePath)
    return { content, url: null }
  }

  return { content: null, url: null }
}

/**
 * Get backup statistics
 */
export async function getBackupStats() {
  const [total, completed, failed, totalSize] = await Promise.all([
    prisma.backup.count(),
    prisma.backup.count({ where: { status: 'COMPLETED' } }),
    prisma.backup.count({ where: { status: 'FAILED' } }),
    prisma.backup.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { fileSize: true },
    }),
  ])

  return {
    total,
    completed,
    failed,
    inProgress: total - completed - failed,
    totalSize: formatBytes(Number(totalSize._sum.fileSize || 0)),
  }
}

/**
 * List all backups from Vercel Blob
 */
export async function listBlobBackups() {
  if (!isVercelBlobConfigured()) {
    return { blobs: [] }
  }

  try {
    const { blobs } = await list({ prefix: 'backups/' })
    return { blobs }
  } catch (error) {
    console.error('Failed to list Vercel Blob backups:', error)
    return { blobs: [] }
  }
}

/**
 * Get backup metadata from Vercel Blob
 */
export async function getBlobBackupMetadata(url: string) {
  if (!isVercelBlobConfigured()) {
    return null
  }

  try {
    const metadata = await head(url)
    return metadata
  } catch (error) {
    console.error('Failed to get blob metadata:', error)
    return null
  }
}

/**
 * Check storage configuration status
 */
export function getStorageStatus(): {
  isConfigured: boolean
  provider: 'vercel-blob' | 'local'
  details: string
} {
  if (isVercelBlobConfigured()) {
    return {
      isConfigured: true,
      provider: 'vercel-blob',
      details: 'Backups werden in Vercel Blob gespeichert',
    }
  }

  return {
    isConfigured: true,
    provider: 'local',
    details: 'Backups werden lokal gespeichert (nur für Entwicklung)',
  }
}
