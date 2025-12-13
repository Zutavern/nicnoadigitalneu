import { prisma } from './prisma'
import { sendEmail } from './email'
import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

interface LoginInfo {
  userId: string
  userEmail: string
  userName?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

interface SecuritySettings {
  loginNotifications: {
    enabled: boolean
    onNewDevice: boolean
    onNewLocation: boolean
    onFailedAttempts: boolean
    failedAttemptsThreshold: number
  }
}

const defaultSettings: SecuritySettings = {
  loginNotifications: {
    enabled: true,
    onNewDevice: true,
    onNewLocation: true,
    onFailedAttempts: true,
    failedAttemptsThreshold: 3,
  }
}

// Holt Security-Einstellungen aus der Datenbank
async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.loginNotifications) return defaultSettings
    
    return {
      loginNotifications: {
        ...defaultSettings.loginNotifications,
        ...(settings.loginNotifications as Partial<SecuritySettings['loginNotifications']>),
      }
    }
  } catch {
    return defaultSettings
  }
}

// Extrahiert Client-Informationen aus dem Request
export async function getClientInfo() {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'
    
    const parser = new UAParser(userAgent)
    const browser = parser.getBrowser()
    const os = parser.getOS()
    const device = parser.getDevice()
    
    return {
      ipAddress,
      userAgent,
      browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unbekannt',
      os: os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unbekannt',
      device: device.type || 'Desktop',
    }
  } catch {
    return {
      ipAddress: 'unknown',
      userAgent: '',
      browser: 'Unbekannt',
      os: 'Unbekannt',
      device: 'Desktop',
    }
  }
}

// Holt ungefähren Standort aus IP (optional - kann mit externem Service erweitert werden)
async function getLocationFromIp(ip: string): Promise<string> {
  // Für Localhost oder private IPs
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return 'Lokal'
  }
  
  // Hier könnte man einen GeoIP-Service einbinden (z.B. ipinfo.io, maxmind)
  // Für jetzt geben wir nur die IP zurück
  return `IP: ${ip}`
}

// Prüft ob es ein neues Gerät ist
async function isNewDevice(userId: string, browser: string, os: string): Promise<boolean> {
  const recentLogins = await prisma.securityLog.findMany({
    where: {
      userId,
      event: 'LOGIN',
      status: 'SUCCESS',
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Letzte 30 Tage
    },
    select: { device: true },
    take: 50,
  })
  
  const deviceSignature = `${browser}|${os}`
  const knownDevices = recentLogins.map(l => l.device).filter(Boolean)
  
  return !knownDevices.some(d => d?.includes(browser) || d?.includes(os))
}

// Prüft ob es ein neuer Standort ist
async function isNewLocation(userId: string, ipAddress: string): Promise<boolean> {
  const recentLogins = await prisma.securityLog.findMany({
    where: {
      userId,
      event: 'LOGIN',
      status: 'SUCCESS',
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { ipAddress: true },
    take: 50,
  })
  
  const knownIps = recentLogins.map(l => l.ipAddress).filter(Boolean)
  
  // Vergleiche die ersten 3 Oktette der IP (gleiches Subnetz)
  const ipPrefix = ipAddress.split('.').slice(0, 3).join('.')
  return !knownIps.some(ip => ip?.startsWith(ipPrefix))
}

// Zählt fehlgeschlagene Login-Versuche
async function getFailedLoginCount(email: string, minutes: number = 15): Promise<number> {
  const count = await prisma.securityLog.count({
    where: {
      userEmail: email,
      event: 'LOGIN_FAILED',
      createdAt: { gte: new Date(Date.now() - minutes * 60 * 1000) },
    },
  })
  return count
}

// Hauptfunktion: Logge Login und sende Benachrichtigungen
export async function handleLoginEvent(info: LoginInfo, success: boolean) {
  const settings = await getSecuritySettings()
  const clientInfo = await getClientInfo()
  
  const ipAddress = info.ipAddress || clientInfo.ipAddress
  const location = await getLocationFromIp(ipAddress)
  const deviceString = `${clientInfo.browser} auf ${clientInfo.os}`
  
  // Erstelle Security-Log Eintrag
  await prisma.securityLog.create({
    data: {
      userId: success ? info.userId : undefined,
      userEmail: info.userEmail,
      event: success ? 'LOGIN' : 'LOGIN_FAILED',
      status: success ? 'SUCCESS' : 'FAILED',
      message: success ? 'Erfolgreicher Login' : 'Login fehlgeschlagen - falsches Passwort',
      ipAddress,
      device: deviceString,
      location,
      metadata: {
        browser: clientInfo.browser,
        os: clientInfo.os,
        deviceType: clientInfo.device,
      },
    },
  })
  
  // Update User's last login info bei Erfolg
  if (success) {
    await prisma.user.update({
      where: { id: info.userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        lastLoginDevice: deviceString,
      },
    })
  }
  
  // Prüfe ob Benachrichtigungen aktiviert sind
  if (!settings.loginNotifications.enabled) return
  
  // Prüfe ob der User Benachrichtigungen aktiviert hat
  const user = await prisma.user.findUnique({
    where: { id: info.userId },
    select: { loginNotificationsEnabled: true, name: true },
  })
  
  if (!user?.loginNotificationsEnabled) return
  
  const userName = user.name || info.userName || info.userEmail.split('@')[0]
  
  if (success) {
    // Erfolgreicher Login - prüfe auf verdächtige Aktivität
    let shouldNotify = false
    let notifyReason = ''
    
    // Neues Gerät?
    if (settings.loginNotifications.onNewDevice) {
      const newDevice = await isNewDevice(info.userId, clientInfo.browser, clientInfo.os)
      if (newDevice) {
        shouldNotify = true
        notifyReason = 'Neues Gerät'
        
        // Log als Warnung
        await prisma.securityLog.create({
          data: {
            userId: info.userId,
            userEmail: info.userEmail,
            event: 'NEW_DEVICE_LOGIN',
            status: 'WARNING',
            message: `Login von neuem Gerät: ${deviceString}`,
            ipAddress,
            device: deviceString,
            location,
          },
        })
      }
    }
    
    // Neuer Standort?
    if (settings.loginNotifications.onNewLocation && !shouldNotify) {
      const newLocation = await isNewLocation(info.userId, ipAddress)
      if (newLocation) {
        shouldNotify = true
        notifyReason = 'Neuer Standort'
        
        await prisma.securityLog.create({
          data: {
            userId: info.userId,
            userEmail: info.userEmail,
            event: 'NEW_LOCATION_LOGIN',
            status: 'WARNING',
            message: `Login von neuem Standort: ${location}`,
            ipAddress,
            device: deviceString,
            location,
          },
        })
      }
    }
    
    // Sende E-Mail bei verdächtiger Aktivität
    if (shouldNotify) {
      try {
        await sendEmail({
          to: info.userEmail,
          templateSlug: 'login-new-device',
          data: {
            userName,
            device: deviceString,
            location,
            ipAddress,
            time: new Date().toLocaleString('de-DE', {
              dateStyle: 'full',
              timeStyle: 'short',
            }),
            reason: notifyReason,
            securityUrl: `${process.env.NEXTAUTH_URL || 'https://www.nicnoa.online'}/dashboard/settings/security`,
          },
          userId: info.userId,
        })
      } catch (error) {
        console.error('Failed to send login notification email:', error)
      }
    }
  } else {
    // Fehlgeschlagener Login
    if (settings.loginNotifications.onFailedAttempts) {
      const failedCount = await getFailedLoginCount(info.userEmail)
      
      // Benachrichtige bei Überschreitung des Schwellwerts
      if (failedCount >= settings.loginNotifications.failedAttemptsThreshold) {
        // Finde den User (falls er existiert)
        const targetUser = await prisma.user.findUnique({
          where: { email: info.userEmail },
          select: { id: true, name: true, loginNotificationsEnabled: true },
        })
        
        if (targetUser?.loginNotificationsEnabled) {
          // Log als Warnung
          await prisma.securityLog.create({
            data: {
              userId: targetUser.id,
              userEmail: info.userEmail,
              event: 'SUSPICIOUS_ACTIVITY',
              status: 'WARNING',
              message: `${failedCount} fehlgeschlagene Login-Versuche in den letzten 15 Minuten`,
              ipAddress,
              device: deviceString,
              location,
            },
          })
          
          // Sende Warnung nur alle 15 Minuten (nicht bei jedem Fehlversuch)
          if (failedCount === settings.loginNotifications.failedAttemptsThreshold) {
            try {
              await sendEmail({
                to: info.userEmail,
                templateSlug: 'security-alert',
                data: {
                  userName: targetUser.name || info.userEmail.split('@')[0],
                  alertType: 'Mehrfach fehlgeschlagene Login-Versuche',
                  description: `Es wurden ${failedCount} fehlgeschlagene Login-Versuche auf Ihr Konto registriert.`,
                  ipAddress,
                  location,
                  time: new Date().toLocaleString('de-DE', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }),
                  actionUrl: `${process.env.NEXTAUTH_URL || 'https://www.nicnoa.online'}/dashboard/settings/security`,
                },
                userId: targetUser.id,
              })
            } catch (error) {
              console.error('Failed to send security alert email:', error)
            }
          }
        }
      }
    }
  }
}

// Erstelle/Update ActiveSession bei Login
export async function createActiveSession(userId: string, sessionToken: string) {
  const clientInfo = await getClientInfo()
  const location = await getLocationFromIp(clientInfo.ipAddress)
  
  // Prüfe max. Sessions
  const settings = await prisma.platformSettings.findFirst()
  const maxSessions = (settings?.maxActiveSessions as number) || 5
  
  const activeSessions = await prisma.activeSession.count({
    where: { userId, isActive: true },
  })
  
  // Lösche älteste Sessions wenn Limit erreicht
  if (activeSessions >= maxSessions) {
    const oldestSessions = await prisma.activeSession.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: 'asc' },
      take: activeSessions - maxSessions + 1,
    })
    
    await prisma.activeSession.updateMany({
      where: { id: { in: oldestSessions.map(s => s.id) } },
      data: { isActive: false },
    })
  }
  
  // Erstelle neue Session
  await prisma.activeSession.create({
    data: {
      userId,
      sessionToken,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      browser: clientInfo.browser,
      os: clientInfo.os,
      device: clientInfo.device,
      location,
      isActive: true,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Tage
    },
  })
}

// Passwort-Änderung Benachrichtigung
export async function notifyPasswordChanged(userId: string, userEmail: string, userName?: string | null) {
  const clientInfo = await getClientInfo()
  const location = await getLocationFromIp(clientInfo.ipAddress)
  
  try {
    await sendEmail({
      to: userEmail,
      templateSlug: 'password-changed',
      data: {
        userName: userName || userEmail.split('@')[0],
        device: `${clientInfo.browser} auf ${clientInfo.os}`,
        location,
        time: new Date().toLocaleString('de-DE', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
        securityUrl: `${process.env.NEXTAUTH_URL || 'https://www.nicnoa.online'}/dashboard/settings/security`,
      },
      userId,
    })
  } catch (error) {
    console.error('Failed to send password changed email:', error)
  }
}

