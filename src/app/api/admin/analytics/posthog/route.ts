import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PostHogInsight {
  result: unknown[]
  count?: number
  aggregated_value?: number
}

interface PostHogSession {
  id: string
  distinct_id: string
  start_time: string
  end_time: string
  duration: number
  viewed_url: string
  recording_duration: number
  click_count: number
  keypress_count: number
  console_error_count: number
  active_seconds: number
}

interface PostHogPerson {
  id: string
  uuid: string
  distinct_ids: string[]
  properties: Record<string, unknown>
  created_at: string
}

// GET: Fetch analytics data from PostHog
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const dateFrom = searchParams.get('dateFrom') || '-7d'
    const dateTo = searchParams.get('dateTo') || null

    // Get PostHog config
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.posthogPersonalApiKey || !settings?.posthogEnabled) {
      return NextResponse.json({
        error: 'PostHog ist nicht konfiguriert oder deaktiviert',
        configured: false,
      }, { status: 400 })
    }

    const host = settings.posthogHost || 'https://eu.i.posthog.com'
    const projectId = settings.posthogProjectId
    const apiKey = settings.posthogPersonalApiKey

    if (!projectId) {
      return NextResponse.json({
        error: 'PostHog Project ID nicht konfiguriert',
        configured: false,
      }, { status: 400 })
    }

    // Fetch different types of data based on request
    switch (type) {
      case 'overview': {
        const [pageviews, uniqueUsers, events, extendedMetrics] = await Promise.all([
          fetchInsight(host, projectId, apiKey, {
            events: [{ id: '$pageview', math: 'total' }],
            date_from: dateFrom,
            date_to: dateTo,
          }),
          fetchInsight(host, projectId, apiKey, {
            events: [{ id: '$pageview', math: 'dau' }],
            date_from: dateFrom,
            date_to: dateTo,
          }),
          fetchEventCounts(host, projectId, apiKey, dateFrom),
          fetchExtendedMetrics(host, projectId, apiKey, dateFrom),
        ])

        return NextResponse.json({
          configured: true,
          data: {
            pageviews: extractTotal(pageviews),
            uniqueUsers: extractTotal(uniqueUsers),
            totalEvents: events.total || 0,
            signups: events.signups || 0,
            logins: events.logins || 0,
            ...extendedMetrics,
          },
        })
      }

      case 'trends': {
        const trends = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          interval: 'day',
        })

        return NextResponse.json({
          configured: true,
          data: formatTrends(trends),
        })
      }

      case 'top-pages': {
        const topPages = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$current_url',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatTopPages(topPages),
        })
      }

      case 'auth-funnel': {
        const funnel = await fetchFunnel(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: funnel,
        })
      }

      case 'devices': {
        const devices = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'dau' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$device_type',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatDevices(devices),
        })
      }

      case 'browsers': {
        const browsers = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'dau' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$browser',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatBrowsers(browsers),
        })
      }

      case 'countries': {
        const countries = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'dau' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$geoip_country_name',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatCountries(countries),
        })
      }

      case 'recent-events': {
        const events = await fetchRecentEvents(host, projectId, apiKey)
        
        return NextResponse.json({
          configured: true,
          data: events,
        })
      }

      // ============== NEW ENDPOINTS ==============

      case 'realtime': {
        // Fetch real-time data (active users in last 5 minutes)
        const realtime = await fetchRealtimeData(host, projectId, apiKey)
        
        return NextResponse.json({
          configured: true,
          data: realtime,
        })
      }

      case 'retention': {
        // Fetch retention data
        const retention = await fetchRetention(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: retention,
        })
      }

      case 'stickiness': {
        // Fetch stickiness (DAU/MAU)
        const stickiness = await fetchStickiness(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: stickiness,
        })
      }

      case 'paths': {
        // Fetch user paths
        const paths = await fetchPaths(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: paths,
        })
      }

      case 'entry-pages': {
        // Fetch entry pages (where users land first)
        const entryPages = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$entry_current_url',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatTopPages(entryPages),
        })
      }

      case 'exit-pages': {
        // Fetch exit pages (where users leave)
        const exitPages = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageleave', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$current_url',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatTopPages(exitPages),
        })
      }

      case 'sessions': {
        // Fetch session recordings list
        const sessions = await fetchSessions(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: sessions,
        })
      }

      case 'session-stats': {
        // Fetch session statistics
        const sessionStats = await fetchSessionStats(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: sessionStats,
        })
      }

      case 'bounce-rate': {
        // Calculate bounce rate
        const bounceRate = await fetchBounceRate(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: bounceRate,
        })
      }

      case 'referrers': {
        // Fetch referrer sources
        const referrers = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$referrer',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatReferrers(referrers),
        })
      }

      case 'utm-sources': {
        // Fetch UTM source breakdown
        const utmSources = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$utm_source',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatUtmData(utmSources, 'source'),
        })
      }

      case 'utm-campaigns': {
        // Fetch UTM campaign breakdown
        const utmCampaigns = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$utm_campaign',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatUtmData(utmCampaigns, 'campaign'),
        })
      }

      case 'utm-mediums': {
        // Fetch UTM medium breakdown
        const utmMediums = await fetchInsight(host, projectId, apiKey, {
          events: [{ id: '$pageview', math: 'total' }],
          date_from: dateFrom,
          date_to: dateTo,
          breakdown: '$utm_medium',
          breakdown_type: 'event',
        })

        return NextResponse.json({
          configured: true,
          data: formatUtmData(utmMediums, 'medium'),
        })
      }

      case 'custom-funnel': {
        // Get custom funnel steps from query params
        const steps = searchParams.get('steps')?.split(',') || []
        if (steps.length < 2) {
          return NextResponse.json({ error: 'Mindestens 2 Schritte erforderlich' }, { status: 400 })
        }
        
        const customFunnel = await fetchCustomFunnel(host, projectId, apiKey, dateFrom, steps)
        
        return NextResponse.json({
          configured: true,
          data: customFunnel,
        })
      }

      case 'new-vs-returning': {
        // Fetch new vs returning users
        const newVsReturning = await fetchNewVsReturning(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: newVsReturning,
        })
      }

      case 'hourly-activity': {
        // Fetch hourly activity pattern
        const hourlyActivity = await fetchHourlyActivity(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: hourlyActivity,
        })
      }

      case 'weekly-activity': {
        // Fetch weekly activity pattern
        const weeklyActivity = await fetchWeeklyActivity(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: weeklyActivity,
        })
      }

      case 'live-events': {
        // Fetch live events stream
        const liveEvents = await fetchLiveEvents(host, projectId, apiKey)
        
        return NextResponse.json({
          configured: true,
          data: liveEvents,
        })
      }

      case 'active-users': {
        // Fetch currently active users
        const activeUsers = await fetchActiveUsers(host, projectId, apiKey)
        
        return NextResponse.json({
          configured: true,
          data: activeUsers,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('PostHog API error:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Abrufen der Analytics-Daten',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============== HELPER FUNCTIONS ==============

async function fetchInsight(
  host: string,
  projectId: string,
  apiKey: string,
  query: Record<string, unknown>
): Promise<PostHogInsight | null> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      console.error('PostHog insight error:', await response.text())
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Fetch insight error:', error)
    return null
  }
}

async function fetchEventCounts(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ total: number; signups: number; logins: number }> {
  try {
    const [signupData, loginData] = await Promise.all([
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: 'signup_completed', math: 'total' }],
        date_from: dateFrom,
      }),
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: 'login_completed', math: 'total' }],
        date_from: dateFrom,
      }),
    ])

    return {
      total: 0,
      signups: extractTotal(signupData),
      logins: extractTotal(loginData),
    }
  } catch {
    return { total: 0, signups: 0, logins: 0 }
  }
}

async function fetchExtendedMetrics(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ avgSessionDuration: number; pagesPerSession: number; bounceRate: number }> {
  try {
    // Fetch session duration
    const sessionData = await fetchInsight(host, projectId, apiKey, {
      events: [{ id: '$pageview', math: 'avg_count_per_actor' }],
      date_from: dateFrom,
    })

    return {
      avgSessionDuration: 0, // Would need session data
      pagesPerSession: extractTotal(sessionData) || 1,
      bounceRate: 0, // Calculated separately
    }
  } catch {
    return { avgSessionDuration: 0, pagesPerSession: 1, bounceRate: 0 }
  }
}

async function fetchFunnel(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ step: string; count: number; percentage: number }>> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/insights/funnel/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          { id: 'signup_started', order: 0 },
          { id: 'signup_completed', order: 1 },
          { id: 'login_completed', order: 2 },
        ],
        date_from: dateFrom,
        funnel_window_days: 14,
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const results = data.result?.[0] || []
    
    return results.map((step: { name: string; count: number; order: number }, index: number) => ({
      step: step.name || `Step ${step.order + 1}`,
      count: step.count || 0,
      percentage: index === 0 ? 100 : ((step.count || 0) / (results[0]?.count || 1)) * 100,
    }))
  } catch {
    return []
  }
}

async function fetchCustomFunnel(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string,
  steps: string[]
): Promise<Array<{ step: string; count: number; percentage: number; dropoff: number }>> {
  try {
    const events = steps.map((step, index) => ({
      id: step,
      order: index,
    }))

    const response = await fetch(`${host}/api/projects/${projectId}/insights/funnel/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        date_from: dateFrom,
        funnel_window_days: 14,
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const results = data.result?.[0] || []
    
    return results.map((step: { name: string; count: number; order: number }, index: number) => {
      const prevCount = index === 0 ? step.count : results[index - 1]?.count || 0
      const dropoff = prevCount > 0 ? ((prevCount - step.count) / prevCount) * 100 : 0
      
      return {
        step: step.name || `Step ${step.order + 1}`,
        count: step.count || 0,
        percentage: index === 0 ? 100 : ((step.count || 0) / (results[0]?.count || 1)) * 100,
        dropoff,
      }
    })
  } catch {
    return []
  }
}

async function fetchRecentEvents(
  host: string,
  projectId: string,
  apiKey: string
): Promise<Array<{ event: string; timestamp: string; person?: string; properties?: Record<string, unknown> }>> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/events/?limit=20`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.results || []).map((event: { event: string; timestamp: string; distinct_id?: string; properties?: Record<string, unknown> }) => ({
      event: event.event,
      timestamp: event.timestamp,
      person: event.distinct_id,
      properties: event.properties,
    }))
  } catch {
    return []
  }
}

async function fetchLiveEvents(
  host: string,
  projectId: string,
  apiKey: string
): Promise<Array<{ event: string; timestamp: string; person?: string; url?: string }>> {
  try {
    // Fetch events from last minute
    const response = await fetch(
      `${host}/api/projects/${projectId}/events/?limit=50&orderBy=-timestamp`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.results || []).map((event: { event: string; timestamp: string; distinct_id?: string; properties?: { $current_url?: string } }) => ({
      event: event.event,
      timestamp: event.timestamp,
      person: event.distinct_id,
      url: event.properties?.$current_url,
    }))
  } catch {
    return []
  }
}

async function fetchRealtimeData(
  host: string,
  projectId: string,
  apiKey: string
): Promise<{ activeUsers: number; recentPageviews: number; recentEvents: number }> {
  try {
    // Fetch data from last 5 minutes
    const [pageviewData, eventData] = await Promise.all([
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'dau' }],
        date_from: '-5m',
      }),
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'total' }],
        date_from: '-5m',
      }),
    ])

    return {
      activeUsers: extractTotal(pageviewData),
      recentPageviews: extractTotal(eventData),
      recentEvents: extractTotal(eventData),
    }
  } catch {
    return { activeUsers: 0, recentPageviews: 0, recentEvents: 0 }
  }
}

async function fetchActiveUsers(
  host: string,
  projectId: string,
  apiKey: string
): Promise<Array<{ id: string; lastSeen: string; currentUrl?: string }>> {
  try {
    const response = await fetch(
      `${host}/api/projects/${projectId}/events/?limit=20&event=$pageview`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const seen = new Set<string>()
    const users: Array<{ id: string; lastSeen: string; currentUrl?: string }> = []

    for (const event of data.results || []) {
      if (!seen.has(event.distinct_id)) {
        seen.add(event.distinct_id)
        users.push({
          id: event.distinct_id,
          lastSeen: event.timestamp,
          currentUrl: event.properties?.$current_url,
        })
      }
    }

    return users.slice(0, 10)
  } catch {
    return []
  }
}

async function fetchRetention(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ cohorts: Array<{ date: string; size: number; retention: number[] }> }> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/insights/retention/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_entity: { id: '$pageview', type: 'events' },
        returning_entity: { id: '$pageview', type: 'events' },
        date_from: dateFrom,
        period: 'Day',
        retention_type: 'retention_first_time',
        total_intervals: 7,
      }),
    })

    if (!response.ok) {
      return { cohorts: [] }
    }

    const data = await response.json()
    
    return {
      cohorts: (data.result || []).map((cohort: { date: string; values: Array<{ count: number }> }) => ({
        date: cohort.date,
        size: cohort.values?.[0]?.count || 0,
        retention: cohort.values?.map((v: { count: number }, i: number) => {
          const initial = cohort.values?.[0]?.count || 1
          return i === 0 ? 100 : Math.round((v.count / initial) * 100)
        }) || [],
      })),
    }
  } catch {
    return { cohorts: [] }
  }
}

async function fetchStickiness(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ stickiness: number[]; labels: string[] }> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/insights/stickiness/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', math: 'dau' }],
        date_from: dateFrom,
        shown_as: 'Stickiness',
      }),
    })

    if (!response.ok) {
      return { stickiness: [], labels: [] }
    }

    const data = await response.json()
    const result = data.result?.[0] || {}
    
    return {
      stickiness: result.data || [],
      labels: result.labels || [],
    }
  } catch {
    return { stickiness: [], labels: [] }
  }
}

async function fetchPaths(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ nodes: Array<{ name: string; value: number }>; links: Array<{ source: string; target: string; value: number }> }> {
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/insights/path/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date_from: dateFrom,
        include_event_types: ['$pageview'],
        path_type: '$pageview',
        start_point: null,
        step_limit: 5,
        exclude_events: [],
        path_groupings: [],
      }),
    })

    if (!response.ok) {
      return { nodes: [], links: [] }
    }

    const data = await response.json()
    const result = data.result || []
    
    // Convert PostHog path format to nodes and links
    const nodeMap = new Map<string, number>()
    const links: Array<{ source: string; target: string; value: number }> = []
    
    for (const path of result) {
      const source = path.source || 'Start'
      const target = path.target || 'End'
      const value = path.value || 0
      
      nodeMap.set(source, (nodeMap.get(source) || 0) + value)
      nodeMap.set(target, (nodeMap.get(target) || 0) + value)
      
      links.push({ source, target, value })
    }
    
    const nodes = Array.from(nodeMap.entries()).map(([name, value]) => ({ name, value }))
    
    return { nodes, links }
  } catch {
    return { nodes: [], links: [] }
  }
}

async function fetchSessions(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{
  id: string
  duration: number
  startTime: string
  pageCount: number
  country?: string
  device?: string
  browser?: string
  startUrl?: string
}>> {
  try {
    const response = await fetch(
      `${host}/api/projects/${projectId}/session_recordings?limit=20&date_from=${dateFrom}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    return (data.results || []).map((session: PostHogSession & { 
      person?: PostHogPerson
      $geoip_country_name?: string
      $device_type?: string
      $browser?: string
    }) => ({
      id: session.id,
      duration: session.recording_duration || session.duration || 0,
      startTime: session.start_time,
      pageCount: session.click_count || 0,
      country: session.$geoip_country_name,
      device: session.$device_type,
      browser: session.$browser,
      startUrl: session.viewed_url,
    }))
  } catch {
    return []
  }
}

async function fetchSessionStats(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ totalSessions: number; avgDuration: number; avgClicks: number; errorSessions: number }> {
  try {
    const response = await fetch(
      `${host}/api/projects/${projectId}/session_recordings?limit=100&date_from=${dateFrom}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return { totalSessions: 0, avgDuration: 0, avgClicks: 0, errorSessions: 0 }
    }

    const data = await response.json()
    const sessions = data.results || []
    const totalSessions = sessions.length
    
    if (totalSessions === 0) {
      return { totalSessions: 0, avgDuration: 0, avgClicks: 0, errorSessions: 0 }
    }

    const totalDuration = sessions.reduce((sum: number, s: PostHogSession) => sum + (s.recording_duration || 0), 0)
    const totalClicks = sessions.reduce((sum: number, s: PostHogSession) => sum + (s.click_count || 0), 0)
    const errorSessions = sessions.filter((s: PostHogSession) => (s.console_error_count || 0) > 0).length

    return {
      totalSessions,
      avgDuration: Math.round(totalDuration / totalSessions),
      avgClicks: Math.round(totalClicks / totalSessions),
      errorSessions,
    }
  } catch {
    return { totalSessions: 0, avgDuration: 0, avgClicks: 0, errorSessions: 0 }
  }
}

async function fetchBounceRate(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ bounceRate: number; singlePageSessions: number; totalSessions: number }> {
  try {
    // Fetch sessions with only 1 pageview (bounce)
    const [singlePageData, totalData] = await Promise.all([
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'unique_session' }],
        date_from: dateFrom,
        properties: [{ key: '$session_page_count', value: 1, operator: 'exact' }],
      }),
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'unique_session' }],
        date_from: dateFrom,
      }),
    ])

    const singlePageSessions = extractTotal(singlePageData)
    const totalSessions = extractTotal(totalData)
    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0

    return {
      bounceRate: Math.round(bounceRate * 10) / 10,
      singlePageSessions,
      totalSessions,
    }
  } catch {
    return { bounceRate: 0, singlePageSessions: 0, totalSessions: 0 }
  }
}

async function fetchNewVsReturning(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<{ newUsers: number; returningUsers: number }> {
  try {
    const [newData, totalData] = await Promise.all([
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'unique_session' }],
        date_from: dateFrom,
        properties: [{ key: '$is_first_session', value: true, operator: 'exact' }],
      }),
      fetchInsight(host, projectId, apiKey, {
        events: [{ id: '$pageview', math: 'dau' }],
        date_from: dateFrom,
      }),
    ])

    const newUsers = extractTotal(newData)
    const totalUsers = extractTotal(totalData)

    return {
      newUsers,
      returningUsers: Math.max(0, totalUsers - newUsers),
    }
  } catch {
    return { newUsers: 0, returningUsers: 0 }
  }
}

async function fetchHourlyActivity(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ hour: number; users: number }>> {
  try {
    const hourlyData = await fetchInsight(host, projectId, apiKey, {
      events: [{ id: '$pageview', math: 'dau' }],
      date_from: dateFrom,
      breakdown: '$hour',
      breakdown_type: 'event',
    })

    if (!hourlyData?.result) return []
    
    return (hourlyData.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
      .filter(item => item.breakdown_value !== undefined)
      .map(item => ({
        hour: parseInt(item.breakdown_value || '0', 10),
        users: item.aggregated_value || 0,
      }))
      .sort((a, b) => a.hour - b.hour)
  } catch {
    return []
  }
}

async function fetchWeeklyActivity(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ day: string; users: number }>> {
  try {
    const weeklyData = await fetchInsight(host, projectId, apiKey, {
      events: [{ id: '$pageview', math: 'dau' }],
      date_from: dateFrom,
      breakdown: '$day_of_week',
      breakdown_type: 'event',
    })

    if (!weeklyData?.result) return []
    
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    
    return (weeklyData.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
      .filter(item => item.breakdown_value !== undefined)
      .map(item => {
        const dayIndex = parseInt(item.breakdown_value || '0', 10)
        return {
          day: dayNames[dayIndex] || 'Unbekannt',
          users: item.aggregated_value || 0,
        }
      })
  } catch {
    return []
  }
}

// ============== FORMATTING FUNCTIONS ==============

function extractTotal(insight: PostHogInsight | null): number {
  if (!insight?.result?.[0]) return 0
  const result = insight.result[0] as { aggregated_value?: number; data?: number[] }
  if (result.aggregated_value !== undefined) return result.aggregated_value
  if (Array.isArray(result.data)) {
    return result.data.reduce((sum: number, val: number) => sum + (val || 0), 0)
  }
  return 0
}

function formatTrends(insight: PostHogInsight | null): Array<{ date: string; value: number }> {
  if (!insight?.result?.[0]) return []
  const result = insight.result[0] as { labels?: string[]; data?: number[] }
  const labels = result.labels || []
  const data = result.data || []
  
  return labels.map((label: string, index: number) => ({
    date: label,
    value: data[index] || 0,
  }))
}

function formatTopPages(insight: PostHogInsight | null): Array<{ url: string; views: number }> {
  if (!insight?.result) return []
  return (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value)
    .map((item) => ({
      url: item.breakdown_value || '',
      views: item.aggregated_value || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

function formatDevices(insight: PostHogInsight | null): Array<{ device: string; users: number }> {
  if (!insight?.result) return []
  return (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value)
    .map((item) => ({
      device: item.breakdown_value || 'Unknown',
      users: item.aggregated_value || 0,
    }))
}

function formatBrowsers(insight: PostHogInsight | null): Array<{ browser: string; users: number }> {
  if (!insight?.result) return []
  return (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value)
    .map((item) => ({
      browser: item.breakdown_value || 'Unknown',
      users: item.aggregated_value || 0,
    }))
    .slice(0, 10)
}

function formatCountries(insight: PostHogInsight | null): Array<{ country: string; users: number }> {
  if (!insight?.result) return []
  return (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value)
    .map((item) => ({
      country: item.breakdown_value || 'Unknown',
      users: item.aggregated_value || 0,
    }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 10)
}

function formatReferrers(insight: PostHogInsight | null): Array<{ referrer: string; visits: number; percentage: number }> {
  if (!insight?.result) return []
  
  const results = (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value && item.breakdown_value !== '$direct')
    .map((item) => ({
      referrer: item.breakdown_value || 'Direct',
      visits: item.aggregated_value || 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
  
  const total = results.reduce((sum, r) => sum + r.visits, 0)
  
  return results.map(r => ({
    ...r,
    percentage: total > 0 ? Math.round((r.visits / total) * 100) : 0,
  }))
}

function formatUtmData(
  insight: PostHogInsight | null,
  type: 'source' | 'campaign' | 'medium'
): Array<{ name: string; visits: number; percentage: number }> {
  if (!insight?.result) return []
  
  const results = (insight.result as Array<{ breakdown_value?: string; aggregated_value?: number }>)
    .filter((item) => item.breakdown_value)
    .map((item) => ({
      name: item.breakdown_value || 'None',
      visits: item.aggregated_value || 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
  
  const total = results.reduce((sum, r) => sum + r.visits, 0)
  
  return results.map(r => ({
    ...r,
    percentage: total > 0 ? Math.round((r.visits / total) * 100) : 0,
  }))
}
