/**
 * Shopify Token Encryption
 * Verschlüsselung für sensible Shopify-Zugangsdaten
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32
const KEY_LENGTH = 32

/**
 * Generiert einen Verschlüsselungsschlüssel aus dem Geheimnis
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH)
}

/**
 * Holt das Verschlüsselungsgeheimnis aus der Umgebung
 */
function getEncryptionSecret(): string {
  const secret = process.env.SHOPIFY_ENCRYPTION_SECRET || process.env.AUTH_SECRET
  
  if (!secret) {
    throw new Error('SHOPIFY_ENCRYPTION_SECRET oder AUTH_SECRET muss gesetzt sein')
  }
  
  return secret
}

/**
 * Verschlüsselt einen Text (z.B. Access Token)
 * Format: salt:iv:authTag:encryptedData (alle Base64)
 */
export function encryptToken(plaintext: string): string {
  const secret = getEncryptionSecret()
  const salt = randomBytes(SALT_LENGTH)
  const key = deriveKey(secret, salt)
  const iv = randomBytes(IV_LENGTH)
  
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  
  const authTag = cipher.getAuthTag()
  
  // Kombiniere alle Teile mit Doppelpunkt als Trennzeichen
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted
  ].join(':')
}

/**
 * Entschlüsselt einen verschlüsselten Token
 */
export function decryptToken(encryptedData: string): string {
  const secret = getEncryptionSecret()
  
  const parts = encryptedData.split(':')
  
  if (parts.length !== 4) {
    throw new Error('Ungültiges Verschlüsselungsformat')
  }
  
  const [saltBase64, ivBase64, authTagBase64, encrypted] = parts
  
  const salt = Buffer.from(saltBase64, 'base64')
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  
  const key = deriveKey(secret, salt)
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Überprüft, ob ein String verschlüsselt ist (hat das richtige Format)
 */
export function isEncrypted(data: string): boolean {
  const parts = data.split(':')
  
  if (parts.length !== 4) {
    return false
  }
  
  try {
    // Versuche die Base64-Teile zu dekodieren
    const salt = Buffer.from(parts[0], 'base64')
    const iv = Buffer.from(parts[1], 'base64')
    const authTag = Buffer.from(parts[2], 'base64')
    
    return (
      salt.length === SALT_LENGTH &&
      iv.length === IV_LENGTH &&
      authTag.length === AUTH_TAG_LENGTH
    )
  } catch {
    return false
  }
}

/**
 * Maskiert einen Token für sichere Anzeige (zeigt nur die letzten 4 Zeichen)
 */
export function maskToken(token: string): string {
  if (token.length <= 8) {
    return '****'
  }
  
  return `${'*'.repeat(token.length - 4)}${token.slice(-4)}`
}

