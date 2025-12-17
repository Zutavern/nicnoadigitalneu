import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public Pricing Page Config laden (für öffentliche Preisseite)
export async function GET() {
  try {
    // Config laden oder Default-Werte zurückgeben
    const config = await prisma.pricingPageConfig.findUnique({
      where: { id: 'default' }
    })

    // Fallback auf Default-Werte wenn nicht vorhanden
    const defaultConfig = {
      stylistBadgeText: 'Für Stuhlmieter',
      stylistTitle: 'Der perfekte Plan für deinen Erfolg',
      stylistDescription: 'Starte jetzt durch mit NICNOA – alle Tools für moderne Stylisten',
      salonBadgeText: 'Für Salonbesitzer',
      salonTitle: 'Dein Salon, dein Erfolg, deine Plattform',
      salonDescription: 'Verwalte dein Team, optimiere Abläufe und steigere deinen Umsatz',
      ctaTitle: 'Bereit für den nächsten Schritt?',
      ctaDescription: 'Starte jetzt kostenlos und überzeuge dich selbst',
      ctaButtonText: 'Jetzt kostenlos testen',
      ctaButtonUrl: '/register',
      showTrustElements: true,
      trustElement1Text: '14 Tage kostenlos',
      trustElement2Text: 'Jederzeit kündbar',
      trustElement3Text: 'Keine Kreditkarte nötig',
      trustElement4Text: '30 Tage Geld-zurück-Garantie',
      showFAQ: true,
      faqTitle: 'Häufige Fragen',
      faqDescription: 'Alles was du über unsere Preise wissen musst',
      showTestimonials: true,
      testimonialsTitle: 'Das sagen unsere Kunden',
      metaTitle: 'Preise & Pläne | NICNOA',
      metaDescription: 'Finde den perfekten Plan für dein Salon-Business. Flexible Preise, kostenlose Testphase und jederzeit kündbar.',
      metaKeywords: null,
      ogImage: null
    }

    return NextResponse.json({ 
      config: config || defaultConfig 
    })
  } catch (error) {
    console.error('Error fetching pricing page config:', error)
    // Bei Fehler Default-Config zurückgeben
    return NextResponse.json({ 
      config: {
        stylistBadgeText: 'Für Stuhlmieter',
        stylistTitle: 'Der perfekte Plan für deinen Erfolg',
        stylistDescription: 'Starte jetzt durch mit NICNOA – alle Tools für moderne Stylisten',
        salonBadgeText: 'Für Salonbesitzer',
        salonTitle: 'Dein Salon, dein Erfolg, deine Plattform',
        salonDescription: 'Verwalte dein Team, optimiere Abläufe und steigere deinen Umsatz',
        showTrustElements: true,
        showFAQ: true,
        showTestimonials: true
      }
    })
  }
}

