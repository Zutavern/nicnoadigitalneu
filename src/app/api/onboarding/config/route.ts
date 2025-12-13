import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Default texts for info bubbles
const DEFAULT_CONFIG = {
  // Compliance Info Texts
  ownPhoneInfo: 'Ein eigenes Telefon zeigt, dass du eigenständig mit Kunden kommunizierst und nicht vom Salonbetreiber abhängig bist. Dies ist ein wichtiges Kriterium zur Vermeidung von Scheinselbstständigkeit.',
  ownAppointmentBookInfo: 'Die eigenständige Terminplanung ohne Weisungsbindung des Salonbetreibers ist essentiell. Du bestimmst selbst, wann du arbeitest und welche Termine du annimmst.',
  ownCashRegisterInfo: 'Eine eigene Kasse und ein eigenes EC-Terminal zeigen, dass du deine Einnahmen selbst verwaltest und direkt mit deinen Kunden abrechnest – nicht über den Salon.',
  ownPriceListInfo: 'Die freie Preisgestaltung ist ein Kernmerkmal der Selbstständigkeit. Du bestimmst deine Preise selbst, ohne Vorgaben des Salonbetreibers.',
  ownBrandingInfo: 'Ein eigener Markenauftritt (Name, Logo, Visitenkarten) zeigt deine unternehmerische Eigenständigkeit und hilft beim Aufbau deines eigenen Kundenstamms.',
  
  // Document Info Texts
  masterCertificateInfo: 'Der Meisterbrief (oder eine Ausnahmebewilligung) ist für den Eintrag in die Handwerksrolle erforderlich. Ohne diesen Nachweis ist eine selbstständige Tätigkeit im Friseurhandwerk nicht zulässig.',
  businessRegistrationInfo: 'Die Gewerbeanmeldung ist der offizielle Nachweis deiner selbstständigen Tätigkeit. Du erhältst sie vom zuständigen Gewerbeamt deiner Stadt/Gemeinde.',
  liabilityInsuranceInfo: 'Eine Betriebshaftpflichtversicherung schützt dich vor Schadensersatzansprüchen, die aus deiner beruflichen Tätigkeit entstehen können. Sie ist für Salonbetreiber oft Voraussetzung für die Zusammenarbeit.',
  statusDeterminationInfo: 'Das Statusfeststellungsverfahren (Formular V027) bei der Deutschen Rentenversicherung klärt verbindlich, ob du als selbstständig oder abhängig beschäftigt giltst. Dies schützt dich und den Salonbetreiber vor späteren Nachforderungen.',
  craftsChamberInfo: 'Die Eintragung in die Handwerksrolle bei der zuständigen Handwerkskammer ist für das Friseurhandwerk Pflicht. Sie bestätigt deine Berechtigung zur selbstständigen Ausübung des Handwerks.',
  
  // Step Titles & Descriptions
  step1Title: 'Deine Geschäftsdaten',
  step1Description: 'Diese Daten benötigen wir für die Rechnungsstellung und den Vertrag.',
  step2Title: 'Selbstständigkeits-Check',
  step2Description: 'Diese Kriterien dokumentieren deine Selbstständigkeit und schützen vor Scheinselbstständigkeit.',
  step3Title: 'Dokumente hochladen',
  step3Description: 'Lade alle erforderlichen Nachweise hoch oder markiere, welche dir noch fehlen.',
  step4Title: 'Zusammenfassung & Abschluss',
  step4Description: 'Überprüfe deine Daten und schließe das Onboarding ab.',
}

export async function GET() {
  try {
    // Try to get existing config
    let config = await prisma.onboardingConfig.findUnique({
      where: { id: 'singleton' },
    })

    // If no config exists, create with defaults
    if (!config) {
      config = await prisma.onboardingConfig.create({
        data: {
          id: 'singleton',
          ...DEFAULT_CONFIG,
        },
      })
    }

    // Merge with defaults for any null values
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...Object.fromEntries(
        Object.entries(config).filter(([_, value]) => value !== null)
      ),
    }

    return NextResponse.json(mergedConfig)
  } catch (error) {
    console.error('Error fetching onboarding config:', error)
    // Return defaults on error
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const config = await prisma.onboardingConfig.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        ...DEFAULT_CONFIG,
        ...data,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating onboarding config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}

