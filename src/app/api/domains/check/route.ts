/**
 * Domain Availability Check API
 * 
 * GET: Prüft die Verfügbarkeit einer Domain
 * POST: Sucht nach verfügbaren Domains basierend auf einem Begriff
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkDomainAvailability, searchDomains, isVercelConfigured } from '@/lib/vercel/domains'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Prüfe ob Vercel konfiguriert ist
    if (!isVercelConfigured()) {
      return NextResponse.json(
        { error: 'Domain-Service nicht verfügbar' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain-Parameter erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Domain-Format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Ungültiges Domain-Format' },
        { status: 400 }
      )
    }

    const result = await checkDomainAvailability(domain.toLowerCase())

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking domain:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Domain-Prüfung' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Prüfe ob Vercel konfiguriert ist
    if (!isVercelConfigured()) {
      return NextResponse.json(
        { error: 'Domain-Service nicht verfügbar' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { query, tlds } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Suchbegriff erforderlich' },
        { status: 400 }
      )
    }

    // Validiere und sanitize den Suchbegriff
    const sanitized = query.toLowerCase().replace(/[^a-z0-9-]/g, '')
    
    if (sanitized.length < 2) {
      return NextResponse.json(
        { error: 'Suchbegriff muss mindestens 2 Zeichen haben' },
        { status: 400 }
      )
    }

    if (sanitized.length > 63) {
      return NextResponse.json(
        { error: 'Suchbegriff darf maximal 63 Zeichen haben' },
        { status: 400 }
      )
    }

    // Standardmäßige TLDs
    const defaultTlds = ['.de', '.com', '.online', '.io', '.net']
    const searchTlds = tlds && Array.isArray(tlds) ? tlds : defaultTlds

    const results = await searchDomains(sanitized, searchTlds)

    return NextResponse.json({
      query: sanitized,
      results,
      availableCount: results.filter(r => r.available).length,
    })
  } catch (error) {
    console.error('Error searching domains:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Domain-Suche' },
      { status: 500 }
    )
  }
}



