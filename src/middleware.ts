import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export async function middleware(req: NextRequest) {
  // Skip auth check if no secret is configured (development without auth)
  if (!secret) {
    console.warn('No AUTH_SECRET or NEXTAUTH_SECRET configured')
    return NextResponse.next()
  }

  const token = await getToken({ 
    req, 
    secret,
  })
  
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/registrieren', '/api/auth', '/preise', '/faq', '/features', '/produkt', '/unternehmen', '/uber-uns', '/partner', '/roadmap', '/updates', '/beta-programm', '/agb', '/datenschutz', '/impressum']
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/auth')
  )

  // Static files and assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Protected dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/admin') ||
                           pathname.startsWith('/salon') ||
                           pathname.startsWith('/stylist') ||
                           pathname.startsWith('/onboarding')

  // If user is not logged in and tries to access protected routes
  if (!token && isDashboardRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and tries to access auth pages
  if (token && (pathname === '/login' || pathname === '/registrieren')) {
    // Redirect based on role
    const role = token.role as string
    const onboardingCompleted = token.onboardingCompleted as boolean
    
    // Nutzer, die das Onboarding nicht abgeschlossen haben, zur Onboarding-Seite
    if ((role === 'STYLIST' || role === 'SALON_OWNER') && !onboardingCompleted) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
    
    let redirectUrl = '/dashboard'
    
    if (role === 'ADMIN') {
      redirectUrl = '/admin'
    } else if (role === 'SALON_OWNER') {
      redirectUrl = '/salon'
    } else if (role === 'STYLIST') {
      redirectUrl = '/stylist'
    }
    
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Nutzer ohne abgeschlossenes Basis-Onboarding zum Onboarding weiterleiten
  if (token && (token.role === 'STYLIST' || token.role === 'SALON_OWNER') && !token.onboardingCompleted) {
    // Erlaube Zugriff auf Onboarding-Seiten und APIs
    const allowedPaths = ['/onboarding', '/api/onboarding', '/api/services']
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path))
    
    if (!isAllowed && isDashboardRoute) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }
  
  // Nach Phase 1 dürfen Stylisten aufs Dashboard + auf Phase 2 Onboarding zugreifen
  // Die Compliance-APIs sind immer erlaubt für eingeloggte User
  if (token && pathname.startsWith('/api/onboarding/stylist')) {
    return NextResponse.next()
  }

  // Role-based access control for admin routes
  if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
