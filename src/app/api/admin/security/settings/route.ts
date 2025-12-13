import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number | null // Tage bis Passwort abläuft, null = nie
}

interface LoginNotificationSettings {
  enabled: boolean
  onNewDevice: boolean
  onNewLocation: boolean
  onFailedAttempts: boolean
  failedAttemptsThreshold: number
}

interface IpWhitelist {
  enabled: boolean
  ips: string[]
  allowedRoles: string[] // Welche Rollen brauchen Whitelist
}

interface SecuritySettings {
  passwordPolicy: PasswordPolicy
  loginNotifications: LoginNotificationSettings
  ipWhitelist: IpWhitelist
  sessionTimeout: number // Minuten
  maxActiveSessions: number
  requireTwoFactorForAdmin: boolean
}

const defaultSettings: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: null,
  },
  loginNotifications: {
    enabled: true,
    onNewDevice: true,
    onNewLocation: true,
    onFailedAttempts: true,
    failedAttemptsThreshold: 3,
  },
  ipWhitelist: {
    enabled: false,
    ips: [],
    allowedRoles: ['ADMIN'],
  },
  sessionTimeout: 60 * 24 * 7, // 7 Tage
  maxActiveSessions: 5,
  requireTwoFactorForAdmin: false,
}

// GET /api/admin/security/settings - Hole Sicherheitseinstellungen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json(defaultSettings)
    }

    // Merge mit Default-Settings falls Felder fehlen
    const securitySettings: SecuritySettings = {
      passwordPolicy: {
        ...defaultSettings.passwordPolicy,
        ...(settings.passwordPolicy as Partial<PasswordPolicy> || {}),
      },
      loginNotifications: {
        ...defaultSettings.loginNotifications,
        ...(settings.loginNotifications as Partial<LoginNotificationSettings> || {}),
      },
      ipWhitelist: {
        ...defaultSettings.ipWhitelist,
        ...(settings.ipWhitelist as Partial<IpWhitelist> || {}),
      },
      sessionTimeout: (settings.sessionTimeout as number) || defaultSettings.sessionTimeout,
      maxActiveSessions: (settings.maxActiveSessions as number) || defaultSettings.maxActiveSessions,
      requireTwoFactorForAdmin: (settings.requireTwoFactorForAdmin as boolean) || defaultSettings.requireTwoFactorForAdmin,
    }

    return NextResponse.json(securitySettings)
  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/security/settings - Aktualisiere Sicherheitseinstellungen
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      passwordPolicy, 
      loginNotifications, 
      ipWhitelist, 
      sessionTimeout,
      maxActiveSessions,
      requireTwoFactorForAdmin 
    } = body

    // Validierung
    if (passwordPolicy?.minLength && (passwordPolicy.minLength < 6 || passwordPolicy.minLength > 128)) {
      return NextResponse.json(
        { error: 'Passwort-Mindestlänge muss zwischen 6 und 128 liegen' },
        { status: 400 }
      )
    }

    if (ipWhitelist?.enabled && ipWhitelist?.ips?.length === 0) {
      return NextResponse.json(
        { error: 'Bei aktivierter IP-Whitelist muss mindestens eine IP angegeben werden' },
        { status: 400 }
      )
    }

    // IP-Format validieren
    if (ipWhitelist?.ips) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
      for (const ip of ipWhitelist.ips) {
        if (!ipRegex.test(ip) && ip !== '*') {
          return NextResponse.json(
            { error: `Ungültiges IP-Format: ${ip}` },
            { status: 400 }
          )
        }
      }
    }

    // Hole oder erstelle Settings
    let settings = await prisma.platformSettings.findFirst()
    
    const updateData = {
      passwordPolicy: passwordPolicy || defaultSettings.passwordPolicy,
      loginNotifications: loginNotifications || defaultSettings.loginNotifications,
      ipWhitelist: ipWhitelist || defaultSettings.ipWhitelist,
      sessionTimeout: sessionTimeout ?? defaultSettings.sessionTimeout,
      maxActiveSessions: maxActiveSessions ?? defaultSettings.maxActiveSessions,
      requireTwoFactorForAdmin: requireTwoFactorForAdmin ?? defaultSettings.requireTwoFactorForAdmin,
    }

    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    } else {
      settings = await prisma.platformSettings.create({
        data: {
          siteName: 'NICNOA&CO.online',
          ...updateData,
        },
      })
    }

    // Log Änderung
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event: 'SETTINGS_CHANGED',
        status: 'SUCCESS',
        message: 'Sicherheitseinstellungen aktualisiert',
        metadata: { changes: Object.keys(body) },
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Einstellungen gespeichert',
      settings: updateData,
    })
  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    )
  }
}







