import { NextResponse } from 'next/server'

// Using OpenPLZ API for German postal codes (free, no API key needed)
// https://openplzapi.org/

interface OpenPLZResponse {
  postalCode: string
  name: string
  municipality: string
  state: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const plz = searchParams.get('plz')

  if (!plz || plz.length !== 5 || !/^\d{5}$/.test(plz)) {
    return NextResponse.json(
      { error: 'Ungültige PLZ. Bitte gib eine 5-stellige Postleitzahl ein.' },
      { status: 400 }
    )
  }

  try {
    // OpenPLZ API für Deutschland
    const response = await fetch(
      `https://openplzapi.org/de/Localities?postalCode=${plz}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`OpenPLZ API error: ${response.status}`)
    }

    const data: OpenPLZResponse[] = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'PLZ nicht gefunden', found: false },
        { status: 404 }
      )
    }

    // Take the first result (most common locality for this postal code)
    const location = data[0]

    return NextResponse.json({
      found: true,
      plz: location.postalCode,
      city: location.name,
      municipality: location.municipality,
      state: location.state,
      // If multiple localities exist for this PLZ, return all options
      alternatives: data.length > 1 ? data.map(d => ({
        city: d.name,
        municipality: d.municipality,
      })) : undefined,
    })
  } catch (error) {
    console.error('PLZ Lookup error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der PLZ-Daten' },
      { status: 500 }
    )
  }
}
