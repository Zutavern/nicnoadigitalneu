import { NextRequest, NextResponse } from 'next/server'
import { googleBusinessTokenService } from '@/lib/google-business/token-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Get stored state and user ID from cookies
    const storedState = request.cookies.get('google_business_state')?.value
    const userId = request.cookies.get('google_business_user')?.value

    // Clear cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Handle errors from Google
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        `${baseUrl}/stylist/settings/integrations?error=${encodeURIComponent(error)}`
      )
    }

    // Validate state
    if (!state || state !== storedState) {
      console.error('State mismatch:', { state, storedState })
      return NextResponse.redirect(
        `${baseUrl}/stylist/settings/integrations?error=invalid_state`
      )
    }

    // Validate user ID
    if (!userId) {
      return NextResponse.redirect(
        `${baseUrl}/stylist/settings/integrations?error=session_expired`
      )
    }

    // Validate code
    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/stylist/settings/integrations?error=no_code`
      )
    }

    // Exchange code for tokens
    const tokens = await googleBusinessTokenService.exchangeCodeForTokens(code)

    // Get Google account info
    const accountInfo = await googleBusinessTokenService.getAccountInfo(tokens.accessToken)

    // Get available locations for the user to select
    // For now, we'll redirect to a location selection page
    // In the actual implementation, we'll fetch locations and let user choose
    
    // Store temporary tokens in session/cookie for location selection
    const tempData = {
      tokens,
      accountInfo,
      userId,
    }
    
    // Encode and store temporarily (will be cleared after location selection)
    const encodedData = Buffer.from(JSON.stringify(tempData)).toString('base64')
    
    const response = NextResponse.redirect(
      `${baseUrl}/stylist/settings/integrations/select-location`
    )
    
    // Clear state cookies
    response.cookies.delete('google_business_state')
    response.cookies.delete('google_business_user')
    
    // Store temp data for location selection (expires in 10 minutes)
    response.cookies.set('google_business_temp', encodedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in Google Business callback:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${baseUrl}/stylist/settings/integrations?error=callback_failed`
    )
  }
}

