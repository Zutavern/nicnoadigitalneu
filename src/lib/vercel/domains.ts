/**
 * Vercel Domains API Client
 * 
 * Handles domain availability checks, purchases, and management
 */

const VERCEL_API_URL = 'https://api.vercel.com'
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_oQlTAXAjO0OlbvODLUcyeZeF'
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_x1OEzPaqiG3zstwvGJja0cM8UxIX'

// Marge für Domain-Verkauf (in Prozent)
const DOMAIN_MARGIN_PERCENT = 50

interface DomainAvailability {
  available: boolean
  premium: boolean
  price: number | null
  fee: number | null
}

interface DomainPrice {
  purchasePrice: number
  renewalPrice: number
  transferPrice: number
  currency: string
}

interface VercelDomainResponse {
  id: string
  name: string
  verified: boolean
  verification?: {
    type: string
    method: string
    domain: string
    token: string
  }[]
}

export interface DomainCheckResult {
  domain: string
  available: boolean
  premium: boolean
  vercelPriceUsd: number | null
  customerPriceEur: number | null
  renewalPriceEur: number | null
  message?: string
}

export interface DomainPurchaseResult {
  success: boolean
  domain?: string
  vercelDomainId?: string
  error?: string
  transactionId?: string
}

/**
 * Prüft ob die Vercel API konfiguriert ist
 */
export function isVercelConfigured(): boolean {
  return Boolean(VERCEL_TOKEN)
}

/**
 * Konvertiert USD zu EUR mit aktuellem Kurs (vereinfacht)
 */
function usdToEur(usd: number): number {
  const exchangeRate = 0.92 // Vereinfacht, sollte dynamisch sein
  return usd * exchangeRate
}

/**
 * Berechnet den Kundenpreis mit Marge
 */
function calculateCustomerPrice(vercelPriceUsd: number): number {
  const priceWithMargin = vercelPriceUsd * (1 + DOMAIN_MARGIN_PERCENT / 100)
  return Math.ceil(usdToEur(priceWithMargin) * 100) / 100 // Auf 2 Dezimalstellen runden
}

/**
 * Prüft die Verfügbarkeit einer Domain
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  if (!VERCEL_TOKEN) {
    return {
      domain,
      available: false,
      premium: false,
      vercelPriceUsd: null,
      customerPriceEur: null,
      renewalPriceEur: null,
      message: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    // 1. Verfügbarkeit prüfen
    const availabilityRes = await fetch(
      `${VERCEL_API_URL}/v1/registrar/domains/${domain}/availability?teamId=${VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    )

    if (!availabilityRes.ok) {
      const errorText = await availabilityRes.text()
      console.error('Vercel availability check failed:', errorText)
      return {
        domain,
        available: false,
        premium: false,
        vercelPriceUsd: null,
        customerPriceEur: null,
        renewalPriceEur: null,
        message: 'Fehler bei der Verfügbarkeitsprüfung',
      }
    }

    const availability = await availabilityRes.json() as { availability: DomainAvailability }

    if (!availability.availability.available) {
      return {
        domain,
        available: false,
        premium: availability.availability.premium,
        vercelPriceUsd: null,
        customerPriceEur: null,
        renewalPriceEur: null,
        message: 'Domain ist bereits vergeben',
      }
    }

    // 2. Preis abrufen
    const priceRes = await fetch(
      `${VERCEL_API_URL}/v1/registrar/domains/${domain}/price?teamId=${VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    )

    let vercelPriceUsd = availability.availability.price || 12.99 // Fallback-Preis
    let renewalPriceUsd = vercelPriceUsd

    if (priceRes.ok) {
      const priceData = await priceRes.json() as { price: DomainPrice }
      vercelPriceUsd = priceData.price?.purchasePrice || vercelPriceUsd
      renewalPriceUsd = priceData.price?.renewalPrice || vercelPriceUsd
    }

    return {
      domain,
      available: true,
      premium: availability.availability.premium,
      vercelPriceUsd,
      customerPriceEur: calculateCustomerPrice(vercelPriceUsd),
      renewalPriceEur: calculateCustomerPrice(renewalPriceUsd),
    }
  } catch (error) {
    console.error('Error checking domain availability:', error)
    return {
      domain,
      available: false,
      premium: false,
      vercelPriceUsd: null,
      customerPriceEur: null,
      renewalPriceEur: null,
      message: 'Netzwerkfehler bei der Verfügbarkeitsprüfung',
    }
  }
}

/**
 * Sucht nach verfügbaren Domains basierend auf einem Suchbegriff
 */
export async function searchDomains(query: string, tlds: string[] = ['.de', '.com', '.online', '.io']): Promise<DomainCheckResult[]> {
  // Normalisiere den Suchbegriff
  const sanitized = query
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 63)

  if (!sanitized) {
    return []
  }

  // Generiere Domain-Varianten
  const domains = tlds.map(tld => `${sanitized}${tld}`)

  // Prüfe alle parallel
  const results = await Promise.all(domains.map(checkDomainAvailability))

  return results
}

/**
 * Kauft eine Domain über Vercel
 */
export async function purchaseDomain(
  domain: string,
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    city: string
    state: string
    zip: string
    country: string
  },
  expectedPriceUsd?: number
): Promise<DomainPurchaseResult> {
  if (!VERCEL_TOKEN) {
    return {
      success: false,
      error: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v1/registrar/domains/${domain}/buy?teamId=${VERCEL_TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRenew: true,
          years: 1,
          expectedPrice: expectedPriceUsd,
          contactInformation: contactInfo,
        }),
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Vercel domain purchase failed:', errorData)
      return {
        success: false,
        error: errorData.error?.message || 'Domain-Kauf fehlgeschlagen',
      }
    }

    const result = await res.json()
    
    return {
      success: true,
      domain,
      vercelDomainId: result.id,
      transactionId: result.transactionId,
    }
  } catch (error) {
    console.error('Error purchasing domain:', error)
    return {
      success: false,
      error: 'Netzwerkfehler beim Domain-Kauf',
    }
  }
}

/**
 * Fügt eine Domain zum Vercel-Projekt hinzu
 */
export async function addDomainToProject(domain: string): Promise<{
  success: boolean
  verified: boolean
  verification?: {
    type: string
    token: string
    domain: string
  }
  error?: string
}> {
  if (!VERCEL_TOKEN) {
    return {
      success: false,
      verified: false,
      error: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Failed to add domain to project:', errorData)
      return {
        success: false,
        verified: false,
        error: errorData.error?.message || 'Fehler beim Hinzufügen der Domain',
      }
    }

    const result = await res.json() as VercelDomainResponse

    return {
      success: true,
      verified: result.verified,
      verification: result.verification?.[0] ? {
        type: result.verification[0].type,
        token: result.verification[0].token,
        domain: result.verification[0].domain,
      } : undefined,
    }
  } catch (error) {
    console.error('Error adding domain to project:', error)
    return {
      success: false,
      verified: false,
      error: 'Netzwerkfehler beim Hinzufügen der Domain',
    }
  }
}

/**
 * Prüft den Verifizierungsstatus einer Domain
 */
export async function verifyDomain(domain: string): Promise<{
  verified: boolean
  error?: string
}> {
  if (!VERCEL_TOKEN) {
    return {
      verified: false,
      error: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify?teamId=${VERCEL_TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      return {
        verified: false,
        error: errorData.error?.message || 'Verifizierung fehlgeschlagen',
      }
    }

    const result = await res.json()
    return {
      verified: result.verified,
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return {
      verified: false,
      error: 'Netzwerkfehler bei der Verifizierung',
    }
  }
}

/**
 * Entfernt eine Domain vom Vercel-Projekt
 */
export async function removeDomainFromProject(domain: string): Promise<{
  success: boolean
  error?: string
}> {
  if (!VERCEL_TOKEN) {
    return {
      success: false,
      error: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      return {
        success: false,
        error: errorData.error?.message || 'Fehler beim Entfernen der Domain',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing domain:', error)
    return {
      success: false,
      error: 'Netzwerkfehler beim Entfernen der Domain',
    }
  }
}

/**
 * Holt den Status einer Domain
 */
export async function getDomainStatus(domain: string): Promise<{
  configured: boolean
  verified: boolean
  error?: string
}> {
  if (!VERCEL_TOKEN) {
    return {
      configured: false,
      verified: false,
      error: 'Vercel API nicht konfiguriert',
    }
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      if (res.status === 404) {
        return {
          configured: false,
          verified: false,
        }
      }
      const errorData = await res.json()
      return {
        configured: false,
        verified: false,
        error: errorData.error?.message,
      }
    }

    const result = await res.json()
    return {
      configured: true,
      verified: result.verified,
    }
  } catch (error) {
    console.error('Error getting domain status:', error)
    return {
      configured: false,
      verified: false,
      error: 'Netzwerkfehler beim Abrufen des Domain-Status',
    }
  }
}



