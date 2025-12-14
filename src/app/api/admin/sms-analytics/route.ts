import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cache für seven.io API Daten (5 Minuten TTL)
interface SevenIoCache {
  balance: number
  journal: Array<{
    id: string
    to: string
    from: string
    text: string
    timestamp: string
    status: string
    price: number
    type: string
  }>
  lastFetched: number
  error: string | null
}

let sevenIoCache: SevenIoCache | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 Minuten

async function fetchSevenIoData(apiKey: string): Promise<{
  balance: number
  journal: SevenIoCache['journal']
  error: string | null
}> {
  // Check if cache is still valid
  if (sevenIoCache && Date.now() - sevenIoCache.lastFetched < CACHE_TTL_MS) {
    return {
      balance: sevenIoCache.balance,
      journal: sevenIoCache.journal,
      error: sevenIoCache.error,
    }
  }

  let balance = 0
  let journal: SevenIoCache['journal'] = []
  let error: string | null = null

  try {
    // Balance abrufen
    const balanceResponse = await fetch('https://gateway.seven.io/api/balance', {
      headers: {
        'X-Api-Key': apiKey,
      },
    })

    if (balanceResponse.ok) {
      const balanceText = await balanceResponse.text()
      const parsedBalance = parseFloat(balanceText)
      if (!isNaN(parsedBalance)) {
        balance = parsedBalance
      }
    } else {
      const statusCode = await balanceResponse.text()
      if (statusCode.trim() === '900') {
        error = 'Authentifizierung fehlgeschlagen - API-Key prüfen'
      } else {
        error = `API Fehler: ${statusCode}`
      }
    }

    // Journal/Logs abrufen (letzte 100 Einträge)
    if (!error) {
      try {
        const journalResponse = await fetch('https://gateway.seven.io/api/journal/outbound?limit=100', {
          headers: {
            'X-Api-Key': apiKey,
          },
        })

        if (journalResponse.ok) {
          const journalData = await journalResponse.json()
          if (Array.isArray(journalData)) {
            journal = journalData.map((entry: Record<string, unknown>) => ({
              id: String(entry.id || entry.msg_id || ''),
              to: String(entry.to || ''),
              from: String(entry.from || ''),
              text: String(entry.text || ''),
              timestamp: String(entry.timestamp || entry.created || ''),
              status: String(entry.status || entry.dlr || 'unknown'),
              price: parseFloat(String(entry.price || entry.cost || '0')) || 0,
              type: String(entry.type || 'sms'),
            }))
          }
        }
      } catch {
        // Journal ist optional
      }
    }
  } catch {
    error = 'Netzwerkfehler beim Verbinden mit seven.io'
  }

  // Cache aktualisieren
  if (!error) {
    sevenIoCache = {
      balance,
      journal,
      lastFetched: Date.now(),
      error,
    }
  }

  return { balance, journal, error }
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

    // Platform Settings für seven.io-Konfiguration abrufen
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    })

    // Type-safe access
    const sevenIoApiKey = (settings as Record<string, unknown> | null)?.sevenIoApiKey as string | undefined
    const sevenIoEnabled = (settings as Record<string, unknown> | null)?.sevenIoEnabled === true
    const sevenIoSenderId = ((settings as Record<string, unknown> | null)?.sevenIoSenderId as string) || 'NICNOA'
    const sevenIoTestNumbers = ((settings as Record<string, unknown> | null)?.sevenIoTestNumbers as string) || ''

    const isConfigured = !!sevenIoApiKey && sevenIoEnabled

    // SMS-Statistiken aus der lokalen Datenbank (PhoneVerification)
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Lokale Statistiken
    const [
      totalVerifications,
      last30DaysCount,
      last7DaysCount,
      last24HoursCount,
      verifiedCount,
      smsCount,
      verificationsByDay,
      recentVerifications,
    ] = await Promise.all([
      // Gesamt
      prisma.phoneVerification.count(),
      // Letzte 30 Tage
      prisma.phoneVerification.count({
        where: { createdAt: { gte: last30Days } },
      }),
      // Letzte 7 Tage
      prisma.phoneVerification.count({
        where: { createdAt: { gte: last7Days } },
      }),
      // Letzte 24 Stunden
      prisma.phoneVerification.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      // Erfolgreich verifiziert
      prisma.phoneVerification.count({
        where: { verified: true },
      }),
      // Gesamt SMS gesendet (Summe der smsCount)
      prisma.phoneVerification.aggregate({
        _sum: { smsCount: true },
      }),
      // Verifizierungen pro Tag (letzte 30 Tage)
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM phone_verifications
        WHERE created_at >= ${last30Days}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Letzte 10 Verifizierungen
      prisma.phoneVerification.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ])

    // Berechne Raten
    const totalSms = smsCount._sum.smsCount || 0
    const verificationRate = totalVerifications > 0 ? (verifiedCount / totalVerifications) * 100 : 0

    // seven.io API Daten abrufen (mit Cache)
    let balance = 0
    let journal: SevenIoCache['journal'] = []
    let sevenIoApiError: string | null = null

    if (isConfigured && sevenIoApiKey) {
      const sevenIoData = await fetchSevenIoData(sevenIoApiKey)
      balance = sevenIoData.balance
      journal = sevenIoData.journal
      sevenIoApiError = sevenIoData.error
    }

    // Statistiken aus dem Journal berechnen
    const journalStats = {
      totalSent: journal.length,
      delivered: journal.filter(j => j.status === 'DELIVERED' || j.status === '1' || j.status === 'delivered').length,
      failed: journal.filter(j => j.status === 'FAILED' || j.status === 'failed' || j.status === '0').length,
      pending: journal.filter(j => j.status === 'PENDING' || j.status === 'pending' || j.status === 'BUFFERED').length,
      totalCost: journal.reduce((sum, j) => sum + j.price, 0),
    }

    // Cache-Info für das Frontend
    const cacheInfo = sevenIoCache ? {
      lastFetched: new Date(sevenIoCache.lastFetched).toISOString(),
      nextRefresh: new Date(sevenIoCache.lastFetched + CACHE_TTL_MS).toISOString(),
      isCached: true,
    } : null

    // Test-Nummern parsen
    const testNumbers = sevenIoTestNumbers
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)

    return NextResponse.json({
      isConfigured,
      sevenIoApiError,
      cacheInfo,
      settings: {
        senderId: sevenIoSenderId,
        testNumbers,
        testNumbersCount: testNumbers.length,
      },
      balance: {
        current: balance,
        currency: '€',
        formatted: `${balance.toFixed(2)}€`,
      },
      localStatistics: {
        totalVerifications,
        last30Days: last30DaysCount,
        last7Days: last7DaysCount,
        last24Hours: last24HoursCount,
        verified: verifiedCount,
        verificationRate: Math.round(verificationRate * 10) / 10,
        totalSmsSent: totalSms,
      },
      journalStatistics: journalStats,
      chartData: {
        verificationsByDay: (verificationsByDay as Array<{ date: string; count: number }>).map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
      },
      recentVerifications: recentVerifications.map((v) => ({
        id: v.id,
        phone: v.phone,
        verified: v.verified,
        smsCount: v.smsCount,
        attempts: v.attempts,
        createdAt: v.createdAt,
        verifiedAt: v.verifiedAt,
        userName: v.user?.name || null,
        userEmail: v.user?.email || null,
      })),
      recentJournalEntries: journal.slice(0, 10).map((entry) => ({
        id: entry.id,
        to: entry.to,
        from: entry.from,
        text: entry.text.length > 50 ? entry.text.substring(0, 50) + '...' : entry.text,
        timestamp: entry.timestamp,
        status: entry.status,
        price: entry.price,
      })),
    })
  } catch (error) {
    console.error('Error fetching SMS analytics:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der SMS Analytics' },
      { status: 500 }
    )
  }
}

