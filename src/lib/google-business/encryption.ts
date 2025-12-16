import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getEncryptionKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    console.warn('⚠️ ENCRYPTION_KEY not configured - Google Business token encryption disabled')
    return null
  }
  
  // If the key is hex-encoded (64 chars for 32 bytes)
  if (key.length === 64) {
    return Buffer.from(key, 'hex')
  }
  
  // Otherwise, hash it to get 32 bytes
  return crypto.createHash('sha256').update(key).digest()
}

/**
 * Check if encryption is available
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_KEY
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  
  // If encryption is not configured, return Base64 encoded (NOT secure, only for development)
  if (!key) {
    console.warn('⚠️ Storing tokens without encryption - configure ENCRYPTION_KEY for production!')
    return `unencrypted:${Buffer.from(text).toString('base64')}`
  }
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  // Handle unencrypted tokens (development mode)
  if (encryptedText.startsWith('unencrypted:')) {
    const base64 = encryptedText.slice('unencrypted:'.length)
    return Buffer.from(base64, 'base64').toString('utf8')
  }
  
  const key = getEncryptionKey()
  const parts = encryptedText.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format')
  }
  
  if (!key) {
    throw new Error('Cannot decrypt: ENCRYPTION_KEY not configured')
  }
  
  const [ivHex, tagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Utility to check if a string is encrypted
export function isEncrypted(text: string): boolean {
  const parts = text.split(':')
  if (parts.length !== 3) return false
  
  const [ivHex, tagHex] = parts
  return ivHex.length === IV_LENGTH * 2 && tagHex.length === TAG_LENGTH * 2
}

