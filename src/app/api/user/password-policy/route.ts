import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number | null
}

const defaultPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  maxAge: null,
}

// GET /api/user/password-policy - Passwort-Richtlinien abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst()
    const passwordPolicy = settings?.passwordPolicy as Partial<PasswordPolicy> | null

    return NextResponse.json({
      ...defaultPolicy,
      ...passwordPolicy,
    })
  } catch (error) {
    console.error('Error fetching password policy:', error)
    return NextResponse.json(defaultPolicy)
  }
}


