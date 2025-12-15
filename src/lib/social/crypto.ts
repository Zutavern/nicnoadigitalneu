/**
 * Social Media Integration - Crypto Utilities
 * 
 * Sichere Verschlüsselung für OAuth Tokens
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const SALT_LENGTH = 32

function getEncryptionKey(): Buffer {
  const secret = process.env.SOCIAL_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET
  
  if (!secret) {
    throw new Error('SOCIAL_ENCRYPTION_SECRET oder NEXTAUTH_SECRET muss gesetzt sein')
  }
  
  // Derive a 32-byte key from the secret
  return scryptSync(secret, 'social-media-salt', 32)
}

/**
 * Verschlüsselt einen String (z.B. OAuth Token)
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

/**
 * Entschlüsselt einen verschlüsselten Token
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  
  const parts = ciphertext.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Ungültiges verschlüsseltes Format')
  }
  
  const [ivHex, tagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Generiert einen sicheren State-Parameter für OAuth
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Prüft ob ein Token bald abläuft (innerhalb von 5 Minuten)
 */
export function isTokenExpiringSoon(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false
  
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
  return expiresAt <= fiveMinutesFromNow
}

/**
 * Prüft ob ein Token abgelaufen ist
 */
export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false
  return expiresAt <= new Date()
}

