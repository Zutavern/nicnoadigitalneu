import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.nicnoa.online'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Dashboard-Bereiche (nicht öffentlich)
          '/admin/',
          '/stylist/',
          '/salon/',
          '/dashboard/',
          
          // Auth-interne Seiten
          '/onboarding/',
          '/verify-email/',
          '/reset-password/',
          
          // API-Routen
          '/api/',
          
          // Technische Seiten
          '/_next/',
          '/static/',
          
          // Private Referral-Links (User-spezifisch)
          '/join/',
        ],
      },
      {
        // Googlebot speziell erlauben für wichtige Seiten
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog/',
          '/uber-uns/',
          '/produkt/',
          '/preise/',
          '/faq/',
          '/partner/',
          '/karriere/',
        ],
        disallow: [
          '/admin/',
          '/stylist/',
          '/salon/',
          '/api/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}

