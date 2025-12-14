import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cache für Resend API Daten (5 Minuten TTL)
interface ResendCache {
  domains: Array<{
    id: string
    name: string
    status: string
    region: string
    createdAt: string
    capabilities?: {
      sending: string
      receiving: string
    }
  }>
  resendEmails: Array<{
    id: string
    to: string[]
    from: string
    subject: string
    created_at: string
    last_event: string
  }>
  lastFetched: number
  error: string | null
}

let resendCache: ResendCache | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 Minuten

async function fetchResendData(apiKey: string): Promise<{ 
  domains: ResendCache['domains']
  resendEmails: ResendCache['resendEmails']
  error: string | null 
}> {
  // Check if cache is still valid
  if (resendCache && Date.now() - resendCache.lastFetched < CACHE_TTL_MS) {
    return {
      domains: resendCache.domains,
      resendEmails: resendCache.resendEmails,
      error: resendCache.error,
    }
  }

  let domains: ResendCache['domains'] = []
  let resendEmails: ResendCache['resendEmails'] = []
  let error: string | null = null

  try {
    // Domains abrufen
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (domainsResponse.ok) {
      const domainsData = await domainsResponse.json()
      domains = domainsData.data || []
    } else if (domainsResponse.status === 429) {
      // Rate limit erreicht
      const retryAfter = domainsResponse.headers.get('retry-after') || '60'
      error = `Rate Limit erreicht. Bitte warte ${retryAfter} Sekunden.`
      
      // Bei Rate Limit alten Cache behalten wenn vorhanden
      if (resendCache) {
        return {
          domains: resendCache.domains,
          resendEmails: resendCache.resendEmails,
          error,
        }
      }
    } else {
      const errorData = await domainsResponse.json().catch(() => ({}))
      error = errorData.message || `API Fehler: ${domainsResponse.status}`
    }

    // E-Mails nur abrufen wenn keine Rate Limit Error
    if (!error || !error.includes('Rate Limit')) {
      try {
        const emailsResponse = await fetch('https://api.resend.com/emails?limit=10', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (emailsResponse.ok) {
          const emailsData = await emailsResponse.json()
          resendEmails = emailsData.data || []
        } else if (emailsResponse.status === 429) {
          const retryAfter = emailsResponse.headers.get('retry-after') || '60'
          error = `Rate Limit erreicht. Bitte warte ${retryAfter} Sekunden.`
          
          // Bei Rate Limit alten Cache behalten
          if (resendCache) {
            return {
              domains: resendCache.domains,
              resendEmails: resendCache.resendEmails,
              error,
            }
          }
        }
      } catch {
        // E-Mails sind optional, Fehler ignorieren
      }
    }
  } catch (e) {
    error = 'Netzwerkfehler beim Verbinden mit Resend'
  }

  // Cache aktualisieren (nur wenn kein Rate Limit)
  if (!error || !error.includes('Rate Limit')) {
    resendCache = {
      domains,
      resendEmails,
      lastFetched: Date.now(),
      error,
    }
  }

  return { domains, resendEmails, error }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Platform Settings für Resend-Konfiguration abrufen
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        resendApiKey: true,
        resendEnabled: true,
        resendFromEmail: true,
        resendFromName: true,
      },
    })

    const isConfigured = !!settings?.resendApiKey && settings?.resendEnabled

    // E-Mail-Statistiken aus der lokalen Datenbank
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Gesamt-Statistiken
    const [
      totalEmails,
      last30DaysCount,
      last7DaysCount,
      last24HoursCount,
      statusCounts,
      emailsByDay,
      recentEmails,
      templateStats,
    ] = await Promise.all([
      // Gesamt
      prisma.emailLog.count(),
      // Letzte 30 Tage
      prisma.emailLog.count({
        where: { createdAt: { gte: last30Days } },
      }),
      // Letzte 7 Tage
      prisma.emailLog.count({
        where: { createdAt: { gte: last7Days } },
      }),
      // Letzte 24 Stunden
      prisma.emailLog.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      // Status-Verteilung
      prisma.emailLog.groupBy({
        by: ['status'],
        _count: true,
      }),
      // E-Mails pro Tag (letzte 30 Tage)
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM email_logs
        WHERE created_at >= ${last30Days}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Letzte 10 E-Mails
      prisma.emailLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { name: true, slug: true },
          },
        },
      }),
      // Template-Statistiken
      prisma.emailLog.groupBy({
        by: ['templateId'],
        _count: true,
        _max: {
          createdAt: true,
        },
        orderBy: {
          _count: {
            templateId: 'desc',
          },
        },
        take: 10,
      }),
    ])

    // Status-Counts in ein Objekt umwandeln
    const statusMap = statusCounts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count
        return acc
      },
      {} as Record<string, number>
    )

    // Berechne Raten
    const sent = (statusMap['SENT'] || 0) + (statusMap['DELIVERED'] || 0) + (statusMap['OPENED'] || 0) + (statusMap['CLICKED'] || 0)
    const delivered = (statusMap['DELIVERED'] || 0) + (statusMap['OPENED'] || 0) + (statusMap['CLICKED'] || 0)
    const opened = (statusMap['OPENED'] || 0) + (statusMap['CLICKED'] || 0)
    const clicked = statusMap['CLICKED'] || 0
    const bounced = statusMap['BOUNCED'] || 0
    const failed = statusMap['FAILED'] || 0

    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0
    const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0

    // Template-Namen abrufen
    const templateIds = templateStats.map((t) => t.templateId)
    const templates = await prisma.emailTemplate.findMany({
      where: { id: { in: templateIds } },
      select: { id: true, name: true, slug: true },
    })

    const templateMap = templates.reduce(
      (acc, t) => {
        acc[t.id] = t
        return acc
      },
      {} as Record<string, { id: string; name: string; slug: string }>
    )

    const templateStatsWithNames = templateStats.map((stat) => ({
      templateId: stat.templateId,
      templateName: templateMap[stat.templateId]?.name || 'Unbekannt',
      templateSlug: templateMap[stat.templateId]?.slug || 'unknown',
      count: stat._count,
      lastSent: stat._max.createdAt,
    }))

    // Resend API Daten abrufen (mit Cache)
    let domains: ResendCache['domains'] = []
    let resendEmails: ResendCache['resendEmails'] = []
    let resendApiError: string | null = null

    if (isConfigured && settings?.resendApiKey) {
      const resendData = await fetchResendData(settings.resendApiKey)
      domains = resendData.domains
      resendEmails = resendData.resendEmails
      resendApiError = resendData.error
    }

    // Cache-Info für das Frontend
    const cacheInfo = resendCache ? {
      lastFetched: new Date(resendCache.lastFetched).toISOString(),
      nextRefresh: new Date(resendCache.lastFetched + CACHE_TTL_MS).toISOString(),
      isCached: true,
    } : null

    return NextResponse.json({
      isConfigured,
      resendApiError,
      cacheInfo,
      settings: isConfigured
        ? {
            fromEmail: settings?.resendFromEmail,
            fromName: settings?.resendFromName,
          }
        : null,
      statistics: {
        total: totalEmails,
        last30Days: last30DaysCount,
        last7Days: last7DaysCount,
        last24Hours: last24HoursCount,
        byStatus: {
          pending: statusMap['PENDING'] || 0,
          sent: statusMap['SENT'] || 0,
          delivered: statusMap['DELIVERED'] || 0,
          opened: statusMap['OPENED'] || 0,
          clicked: statusMap['CLICKED'] || 0,
          bounced: statusMap['BOUNCED'] || 0,
          failed: statusMap['FAILED'] || 0,
        },
        rates: {
          delivery: Math.round(deliveryRate * 10) / 10,
          open: Math.round(openRate * 10) / 10,
          click: Math.round(clickRate * 10) / 10,
          bounce: Math.round(bounceRate * 10) / 10,
        },
      },
      chartData: {
        emailsByDay: (emailsByDay as Array<{ date: string; count: number }>).map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
      },
      recentEmails: recentEmails.map((email) => ({
        id: email.id,
        templateName: email.template.name,
        recipientEmail: email.recipientEmail,
        subject: email.subject,
        status: email.status,
        createdAt: email.createdAt,
        deliveredAt: email.deliveredAt,
        openedAt: email.openedAt,
        clickedAt: email.clickedAt,
        resendId: email.resendId,
      })),
      templateStats: templateStatsWithNames,
      domains,
      resendEmails,
    })
  } catch (error) {
    console.error('Error fetching email analytics:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der E-Mail Analytics' },
      { status: 500 }
    )
  }
}
