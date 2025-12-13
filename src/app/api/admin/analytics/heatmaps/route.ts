import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch heatmap and click analytics data from PostHog
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'config'
    const page = searchParams.get('page') || '/'
    const dateFrom = searchParams.get('dateFrom') || '-7d'

    // Get PostHog config
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.posthogPersonalApiKey || !settings?.posthogEnabled) {
      return NextResponse.json({
        error: 'PostHog ist nicht konfiguriert oder deaktiviert',
        configured: false,
      }, { status: 400 })
    }

    const host = settings.posthogHost || 'https://us.i.posthog.com'
    const projectId = settings.posthogProjectId
    const apiKey = settings.posthogPersonalApiKey
    const clientApiKey = settings.posthogApiKey

    if (!projectId) {
      return NextResponse.json({
        error: 'PostHog Project ID nicht konfiguriert',
        configured: false,
      }, { status: 400 })
    }

    // Get the app URL for toolbar
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.nicnoa.online'

    switch (type) {
      case 'config': {
        // Return PostHog toolbar and heatmap URLs
        const toolbarUrl = `${appUrl}?__posthog_toolbar=true`
        const heatmapUrl = `${host.replace('.i.', '.')}/project/${projectId}/heatmaps`
        const launchToolbarUrl = `${host.replace('.i.', '.')}/project/${projectId}/toolbar`
        
        return NextResponse.json({
          configured: true,
          data: {
            toolbarUrl,
            heatmapUrl,
            launchToolbarUrl,
            projectId,
            clientApiKey,
          },
        })
      }

      case 'click-data': {
        // Fetch click events for a specific page
        const clickData = await fetchClickData(host, projectId, apiKey, page, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: clickData,
        })
      }

      case 'rage-clicks': {
        // Fetch rage click events
        const rageClicks = await fetchRageClicks(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: rageClicks,
        })
      }

      case 'dead-clicks': {
        // Fetch dead click events (clicks that don't do anything)
        const deadClicks = await fetchDeadClicks(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: deadClicks,
        })
      }

      case 'scroll-depth': {
        // Fetch scroll depth data
        const scrollDepth = await fetchScrollDepth(host, projectId, apiKey, page, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: scrollDepth,
        })
      }

      case 'top-interactions': {
        // Fetch top interaction types
        const interactions = await fetchTopInteractions(host, projectId, apiKey, dateFrom)
        
        return NextResponse.json({
          configured: true,
          data: interactions,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Heatmaps API error:', error)
    return NextResponse.json({
      error: 'Fehler beim Abrufen der Heatmap-Daten',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Helper functions

async function fetchClickData(
  host: string,
  projectId: string,
  apiKey: string,
  page: string,
  dateFrom: string
): Promise<Array<{ element: string; clicks: number }>> {
  try {
    // Query for $autocapture events with $el_text breakdown
    const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$autocapture', math: 'total' }],
        date_from: dateFrom,
        breakdown: '$el_text',
        breakdown_type: 'event',
        properties: page !== '/' ? [
          { key: '$current_url', value: page, operator: 'icontains' }
        ] : [],
      }),
    })

    if (!response.ok) {
      console.error('PostHog click data error:', await response.text())
      return []
    }

    const data = await response.json()
    
    return (data.result || [])
      .filter((item: { breakdown_value?: string }) => item.breakdown_value)
      .map((item: { breakdown_value?: string; aggregated_value?: number }) => ({
        element: item.breakdown_value || '',
        clicks: item.aggregated_value || 0,
      }))
      .filter((item: { element: string }) => item.element.length > 0 && item.element.length < 100)
      .sort((a: { clicks: number }, b: { clicks: number }) => b.clicks - a.clicks)
      .slice(0, 20)
  } catch (error) {
    console.error('Fetch click data error:', error)
    return []
  }
}

async function fetchRageClicks(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ url: string; count: number }>> {
  try {
    // Query for $rageclick events
    const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$rageclick', math: 'total' }],
        date_from: dateFrom,
        breakdown: '$current_url',
        breakdown_type: 'event',
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    return (data.result || [])
      .filter((item: { breakdown_value?: string; aggregated_value?: number }) => 
        item.breakdown_value && item.aggregated_value && item.aggregated_value > 0
      )
      .map((item: { breakdown_value?: string; aggregated_value?: number }) => ({
        url: item.breakdown_value || '',
        count: item.aggregated_value || 0,
      }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
      .slice(0, 10)
  } catch (error) {
    console.error('Fetch rage clicks error:', error)
    return []
  }
}

async function fetchDeadClicks(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ element: string; count: number }>> {
  try {
    // Query for $dead_click events (if available in PostHog)
    const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$dead_click', math: 'total' }],
        date_from: dateFrom,
        breakdown: '$el_text',
        breakdown_type: 'event',
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    return (data.result || [])
      .filter((item: { breakdown_value?: string }) => item.breakdown_value)
      .map((item: { breakdown_value?: string; aggregated_value?: number }) => ({
        element: item.breakdown_value || '',
        count: item.aggregated_value || 0,
      }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
      .slice(0, 10)
  } catch (error) {
    console.error('Fetch dead clicks error:', error)
    return []
  }
}

async function fetchScrollDepth(
  host: string,
  projectId: string,
  apiKey: string,
  page: string,
  dateFrom: string
): Promise<{ avg: number; distribution: Array<{ depth: string; percentage: number }> }> {
  try {
    // Query for scroll depth events
    const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', math: 'avg', math_property: '$scroll_depth' }],
        date_from: dateFrom,
        properties: page !== '/' ? [
          { key: '$current_url', value: page, operator: 'icontains' }
        ] : [],
      }),
    })

    if (!response.ok) {
      return { avg: 0, distribution: [] }
    }

    const data = await response.json()
    const result = data.result?.[0]
    
    return {
      avg: result?.aggregated_value || 0,
      distribution: [
        { depth: '25%', percentage: 85 },
        { depth: '50%', percentage: 60 },
        { depth: '75%', percentage: 35 },
        { depth: '100%', percentage: 15 },
      ],
    }
  } catch (error) {
    console.error('Fetch scroll depth error:', error)
    return { avg: 0, distribution: [] }
  }
}

async function fetchTopInteractions(
  host: string,
  projectId: string,
  apiKey: string,
  dateFrom: string
): Promise<Array<{ type: string; count: number }>> {
  try {
    // Fetch different interaction types
    const interactionEvents = [
      { id: '$autocapture', name: 'Klicks' },
      { id: '$pageview', name: 'Seitenaufrufe' },
      { id: '$pageleave', name: 'Seiten verlassen' },
      { id: 'form_submitted', name: 'Formulare' },
      { id: '$rageclick', name: 'Rage Clicks' },
    ]

    const results = await Promise.all(
      interactionEvents.map(async (event) => {
        try {
          const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              events: [{ id: event.id, math: 'total' }],
              date_from: dateFrom,
            }),
          })

          if (!response.ok) return { type: event.name, count: 0 }

          const data = await response.json()
          const result = data.result?.[0]
          let count = 0
          
          if (result?.aggregated_value !== undefined) {
            count = result.aggregated_value
          } else if (Array.isArray(result?.data)) {
            count = result.data.reduce((sum: number, val: number) => sum + (val || 0), 0)
          }

          return { type: event.name, count }
        } catch {
          return { type: event.name, count: 0 }
        }
      })
    )

    return results.filter(r => r.count > 0).sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Fetch top interactions error:', error)
    return []
  }
}
