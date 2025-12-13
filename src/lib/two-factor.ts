import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

const APP_NAME = 'NICNOA'

// Generate a new TOTP secret
export function generateTOTPSecret(email: string): { secret: string; uri: string } {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  })

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  }
}

// Verify a TOTP token
export function verifyTOTPToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  // Allow 1 period window for clock drift
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

// Generate QR code as data URL
export async function generateQRCodeDataURL(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

// Generate backup codes
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  
  for (let i = 0; i < count; i++) {
    let code = ''
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
      if (j === 3) code += '-' // Add dash in middle
    }
    codes.push(code)
  }
  
  return codes
}










