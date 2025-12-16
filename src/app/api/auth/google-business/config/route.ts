import { NextResponse } from 'next/server'

/**
 * Check if Google Business API is configured on the server
 * This endpoint is public and does not expose sensitive information
 */
export async function GET() {
  const isConfigured = !!(
    process.env.GOOGLE_BUSINESS_CLIENT_ID &&
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET &&
    process.env.GOOGLE_BUSINESS_REDIRECT_URI
  )

  return NextResponse.json({
    isConfigured,
    message: isConfigured 
      ? 'Google Business API ist verfügbar'
      : 'Google Business API ist noch nicht konfiguriert'
  })
}

