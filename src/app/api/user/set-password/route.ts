import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Basis-Schema - erweiterte Validierung erfolgt mit passwordPolicy
const setPasswordSchema = z.object({
  password: z.string().min(1, 'Passwort erforderlich'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
})

interface PasswordPolicy {
  minLength?: number
  requireUppercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
}

function validatePasswordWithPolicy(password: string, policy: PasswordPolicy): string | null {
  const minLength = policy.minLength || 8
  
  if (password.length < minLength) {
    return `Passwort muss mindestens ${minLength} Zeichen haben`
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Passwort muss mindestens einen Großbuchstaben enthalten'
  }
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    return 'Passwort muss mindestens eine Zahl enthalten'
  }
  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Passwort muss mindestens ein Sonderzeichen enthalten'
  }
  return null
}

// POST /api/user/set-password - Passwort für OAuth-User setzen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = setPasswordSchema.parse(body)

    // Check if user already has a password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    if (user.password) {
      return NextResponse.json(
        { error: 'Du hast bereits ein Passwort. Nutze "Passwort ändern" stattdessen.' },
        { status: 400 }
      )
    }

    // Hole Passwort-Richtlinien
    const settings = await prisma.platformSettings.findFirst()
    const passwordPolicy = (settings?.passwordPolicy as PasswordPolicy) || {}
    
    // Validiere mit Policy
    const policyError = validatePasswordWithPolicy(validatedData.password, passwordPolicy)
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Update user with new password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    })

    // Log this action
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: user.email,
        event: 'PASSWORD_SET',
        status: 'SUCCESS',
        message: 'OAuth-Benutzer hat erstmalig ein Passwort gesetzt',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Passwort erfolgreich gesetzt. Du kannst dich jetzt auch mit E-Mail und Passwort anmelden.' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error setting password:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

