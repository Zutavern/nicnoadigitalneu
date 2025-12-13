import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch heatmap data and configuration
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

    const days = parseInt(dateFrom.replace('-', '').replace('d', '')) || 7

    switch (type) {
      case 'config': {
        // Return PostHog configuration for toolbar/heatmap embedding
        const toolbarUrl = `${host.replace('.i.', '.')}/project/${projectId}/toolbar`
        const heatmapUrl = `${host.replace('.i.', '.')}/project/${projectId}/heatmaps`
        
        return NextResponse.json({
          configured: true,
          data: {
            host: host.replace('.i.', '.'),
            projectId,
            clientApiKey,
            toolbarUrl,
            heatmapUrl,
            // PostHog Toolbar launch URL (opens heatmap overlay on your site)
            launchToolbarUrl: `${host.replace('.i.', '.')}/project/${projectId}/toolbar?launch`,
          },
        })
      }

      case 'click-data': {
        // Fetch autocapture click events for a specific page
        try {
          const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              events: [{
                id: '$autocapture',
                math: 'total',
                properties: [
                  { key: '$current_url', value: page, operator: 'icontains' },
                ],
              }],
              date_from: `-${days}d`,
              breakdown: '$el_text',
              breakdown_type: 'event',
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const results = (data.result || []) as Array<{ 
              breakdown_value?: string
              aggregated_value?: number 
            }>
            
            const clicks = results
              .filter(r => r.breakdown_value)
              .map(r => ({
                element: r.breakdown_value || 'Unknown',
                clicks: r.aggregated_value || 0,
              }))
              .sort((a, b) => b.clicks - a.clicks)
              .slice(0, 20)

            return NextResponse.json({
              configured: true,
              data: clicks,
            })
          }
        } catch (error) {
          console.error('Click data fetch error:', error)
        }

        return NextResponse.json({
          configured: true,
          data: [],
        })
      }

      case 'scroll-depth': {
        // Fetch scroll depth data
        try {
          const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              events: [{
                id: '$pageview',
                math: 'total',
              }],
              date_from: `-${days}d`,
              breakdown: '$viewport_height',
              breakdown_type: 'event',
            }),
          })

          if (response.ok) {
            const data = await response.json()
            // Process scroll depth data
            return NextResponse.json({
              configured: true,
              data: data.result || [],
            })
          }
        } catch (error) {
          console.error('Scroll depth fetch error:', error)
        }

        return NextResponse.json({
          configured: true,
          data: [],
        })
      }

      case 'rage-clicks': {
        // Fetch rage click events (rapid repeated clicks)
        try {
          const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              events: [{
                id: '$rageclick',
                math: 'total',
              }],
              date_from: `-${days}d`,
              breakdown: '$current_url',
              breakdown_type: 'event',
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const results = (data.result || []) as Array<{ 
              breakdown_value?: string
              aggregated_value?: number 
            }>
            
            const rageClicks = results
              .filter(r => r.breakdown_value)
              .map(r => ({
                url: r.breakdown_value || 'Unknown',
                count: r.aggregated_value || 0,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)

            return NextResponse.json({
              configured: true,
              data: rageClicks,
            })
          }
        } catch (error) {
          console.error('Rage clicks fetch error:', error)
        }

        return NextResponse.json({
          configured: true,
          data: [],
        })
      }

      case 'top-interactions': {
        // Fetch most clicked elements across all pages
        try {
          const response = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              events: [{
                id: '$autocapture',
                math: 'total',
              }],
              date_from: `-${days}d`,
              breakdown: '$event_type',
              breakdown_type: 'event',
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const results = (data.result || []) as Array<{ 
              breakdown_value?: string
              aggregated_value?: number 
            }>
            
            const interactions = results
              .filter(r => r.breakdown_value)
              .map(r => ({
                type: r.breakdown_value || 'Unknown',
                count: r.aggregated_value || 0,
              }))
              .sort((a, b) => b.count - a.count)

            return NextResponse.json({
              configured: true,
              data: interactions,
            })
          }
        } catch (error) {
          console.error('Top interactions fetch error:', error)
        }

        return NextResponse.json({
          configured: true,
          data: [],
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
