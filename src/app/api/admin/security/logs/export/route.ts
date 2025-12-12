import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/security/logs/export - Exportiere Security Logs als CSV
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '1000')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
    }

    // Hole Logs
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 10000), // Max 10000 Einträge
    })

    if (format === 'csv') {
      // CSV Export
      const headers = ['Datum', 'Zeit', 'Ereignis', 'Benutzer', 'Status', 'IP-Adresse', 'Standort', 'Gerät', 'Nachricht']
      
      const rows = logs.map(log => {
        const date = new Date(log.createdAt)
        return [
          date.toLocaleDateString('de-DE'),
          date.toLocaleTimeString('de-DE'),
          getEventLabel(log.event),
          log.userEmail,
          getStatusLabel(log.status),
          log.ipAddress || 'N/A',
          log.location || 'Unbekannt',
          log.device || 'Unbekannt',
          (log.message || '').replace(/"/g, '""'), // Escape quotes
        ].map(field => `"${field}"`).join(';')
      })

      const csv = [headers.join(';'), ...rows].join('\n')
      
      // Log Export
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          event: 'LOG_EXPORTED',
          status: 'SUCCESS',
          message: `${logs.length} Logs als CSV exportiert`,
        }
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="security-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    if (format === 'json') {
      // JSON Export (für PDF-Generierung im Frontend)
      const exportData = {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        totalLogs: logs.length,
        filters: {
          startDate,
          endDate,
          status,
        },
        logs: logs.map(log => ({
          date: new Date(log.createdAt).toLocaleDateString('de-DE'),
          time: new Date(log.createdAt).toLocaleTimeString('de-DE'),
          event: getEventLabel(log.event),
          user: log.userEmail,
          status: getStatusLabel(log.status),
          statusType: log.status,
          ip: log.ipAddress || 'N/A',
          location: log.location || 'Unbekannt',
          device: log.device || 'Unbekannt',
          message: log.message || '',
        })),
        summary: {
          success: logs.filter(l => l.status === 'SUCCESS').length,
          failed: logs.filter(l => l.status === 'FAILED').length,
          warning: logs.filter(l => l.status === 'WARNING').length,
        }
      }

      // Log Export
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          event: 'LOG_EXPORTED',
          status: 'SUCCESS',
          message: `${logs.length} Logs als JSON exportiert`,
        }
      })

      return NextResponse.json(exportData)
    }

    return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting logs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Exportieren der Logs' },
      { status: 500 }
    )
  }
}

function getEventLabel(event: string): string {
  const labels: Record<string, string> = {
    'LOGIN': 'Login erfolgreich',
    'LOGOUT': 'Logout',
    'LOGIN_FAILED': 'Login fehlgeschlagen',
    'PASSWORD_CHANGED': 'Passwort geändert',
    'PASSWORD_CHANGE_FAILED': 'Passwort-Änderung fehlgeschlagen',
    'PASSWORD_RESET': 'Passwort zurückgesetzt',
    'TWO_FACTOR_ENABLED': '2FA aktiviert',
    'TWO_FACTOR_DISABLED': '2FA deaktiviert',
    'API_KEY_CREATED': 'API-Schlüssel erstellt',
    'API_KEY_REVOKED': 'API-Schlüssel widerrufen',
    'SESSION_TERMINATED': 'Session beendet',
    'PERMISSION_CHANGED': 'Berechtigung geändert',
    'SETTINGS_CHANGED': 'Einstellungen geändert',
    'USER_CREATED': 'Benutzer erstellt',
    'USER_DELETED': 'Benutzer gelöscht',
    'SUSPICIOUS_ACTIVITY': 'Verdächtige Aktivität',
    'LOG_EXPORTED': 'Logs exportiert',
    'IP_BLOCKED': 'IP blockiert',
    'NEW_DEVICE_LOGIN': 'Login von neuem Gerät',
    'NEW_LOCATION_LOGIN': 'Login von neuem Standort',
  }
  return labels[event] || event
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUCCESS': 'Erfolgreich',
    'FAILED': 'Fehlgeschlagen',
    'WARNING': 'Warnung',
  }
  return labels[status] || status
}





