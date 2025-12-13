import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// POST: Test PostHog connection
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { apiKey, host } = await request.json()

    if (!apiKey) {
      return NextResponse.json({
        valid: false,
        error: 'Kein API Key angegeben',
      })
    }

    // Check key format
    if (!apiKey.startsWith('phc_')) {
      return NextResponse.json({
        valid: false,
        error: `Ungültiges API Key Format. Der Key sollte mit "phc_" beginnen. Dein Key beginnt mit: "${apiKey.substring(0, 4)}..."`,
      })
    }

    // Normalize host - try multiple hosts if needed
    let testHost = host || 'https://eu.i.posthog.com'
    testHost = testHost.replace(/\/$/, '')
    
    // List of hosts to try
    const hostsToTry = [testHost]
    
    // If user specified eu, also try the i. subdomain and vice versa
    if (testHost.includes('eu.posthog.com') && !testHost.includes('eu.i.')) {
      hostsToTry.push('https://eu.i.posthog.com')
    }
    if (testHost.includes('eu.i.posthog.com')) {
      hostsToTry.push('https://eu.posthog.com')
    }
    if (testHost.includes('us.posthog.com') && !testHost.includes('us.i.')) {
      hostsToTry.push('https://us.i.posthog.com')
    }
    if (testHost.includes('app.posthog.com')) {
      hostsToTry.push('https://us.i.posthog.com')
    }

    console.log('Testing PostHog connection:', { hosts: hostsToTry, keyPrefix: apiKey.substring(0, 8) })
    
    let lastError = ''
    
    for (const currentHost of hostsToTry) {
      try {
        // Method 1: Try /decide endpoint (standard way for client API keys)
        const decideResponse = await fetch(`${currentHost}/decide?v=3`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            distinct_id: 'test-connection-' + Date.now(),
          }),
        })

        const decideText = await decideResponse.text()
        console.log(`PostHog /decide response (${currentHost}):`, decideResponse.status, decideText.substring(0, 300))

        if (decideResponse.ok) {
          try {
            const data = JSON.parse(decideText)
            
            // Check for PostHog error codes
            if (data.errcode) {
              lastError = `PostHog Fehler: ${data.errcode} - ${data.error || 'Unbekannter Fehler'}`
              continue // Try next host
            }
            
            // If we get sessionRecording, featureFlags, or any valid response, it's working
            if (
              data.sessionRecording !== undefined ||
              data.featureFlags !== undefined ||
              data.isAuthenticated !== undefined ||
              typeof data === 'object'
            ) {
              return NextResponse.json({
                valid: true,
                message: 'Verbindung erfolgreich! API Key ist gültig.',
                host: currentHost,
                workingHost: currentHost,
              })
            }
          } catch {
            // Response wasn't JSON but was OK - still consider it valid
            return NextResponse.json({
              valid: true,
              message: 'Verbindung erfolgreich',
              host: currentHost,
            })
          }
        }

        // Try to parse error response
        try {
          const errorData = JSON.parse(decideText)
          if (errorData.type === 'authentication_error') {
            lastError = `Authentifizierungsfehler: ${errorData.detail || 'API Key ungültig'}`
          } else {
            lastError = errorData.detail || errorData.error || `Status ${decideResponse.status}`
          }
        } catch {
          lastError = `Server antwortete mit Status ${decideResponse.status}`
        }
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler'
        console.error(`PostHog fetch error (${currentHost}):`, errorMessage)
        
        if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
          lastError = `Host nicht erreichbar: ${currentHost}`
        } else if (errorMessage.includes('ECONNREFUSED')) {
          lastError = `Verbindung abgelehnt: ${currentHost}`
        } else {
          lastError = `Netzwerkfehler: ${errorMessage}`
        }
      }
    }

    // If we get here, all hosts failed
    return NextResponse.json({
      valid: false,
      error: lastError || 'Verbindung fehlgeschlagen',
      suggestion: 'Überprüfe:\n1. Ist der API Key korrekt kopiert?\n2. Stimmt die Region (EU/US)?\n3. Ist das PostHog Projekt aktiv?',
      triedHosts: hostsToTry,
    })
    
  } catch (error) {
    console.error('Error testing PostHog connection:', error)
    return NextResponse.json({
      valid: false,
      error: 'Interner Fehler beim Testen: ' + (error instanceof Error ? error.message : 'Unbekannt'),
    })
  }
}


