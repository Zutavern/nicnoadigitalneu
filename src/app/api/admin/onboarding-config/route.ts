import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default-Texte für Info-Bubbles
const DEFAULT_CONFIG = {
  // Compliance Info-Texte
  ownPhoneInfo: 'Ein eigenes Telefon zeigt, dass du eigenständig mit Kunden kommunizierst. Dies ist ein wichtiges Merkmal der Selbstständigkeit und grenzt dich von Angestellten ab, die über die Salon-Zentrale erreichbar sind.',
  ownAppointmentBookInfo: 'Eine eigenständige Terminplanung ohne Weisungsbindung ist essenziell für die Selbstständigkeit. Du entscheidest selbst, wann du arbeitest und wie du deine Termine koordinierst.',
  ownCashRegisterInfo: 'Eine eigene Kasse und ein eigenes EC-Terminal zeigen, dass du deine Einnahmen selbst verwaltest. Dies ist ein klares Zeichen für wirtschaftliche Unabhängigkeit.',
  ownPriceListInfo: 'Freie Preisgestaltung ohne Vorgaben vom Salon ist ein Kernmerkmal der Selbstständigkeit. Du bestimmst den Wert deiner Arbeit selbst.',
  ownBrandingInfo: 'Eine eigene Markenidentität (Name, Logo, Visitenkarten) zeigt, dass du als eigenständiges Unternehmen auftrittst und nicht als Teil des Salons wahrgenommen wirst.',
  
  // Dokument Info-Texte
  masterCertificateInfo: 'Der Meisterbrief oder eine Ausnahmebewilligung ist Voraussetzung für die Eintragung in die Handwerksrolle. Ohne dieses Dokument darfst du das Friseurhandwerk nicht selbstständig ausüben.',
  businessRegistrationInfo: 'Die Gewerbeanmeldung ist der offizielle Nachweis, dass du ein Gewerbe angemeldet hast. Dieses Dokument erhältst du vom zuständigen Gewerbeamt.',
  liabilityInsuranceInfo: 'Eine Betriebshaftpflichtversicherung schützt dich vor Schadensersatzansprüchen. Sie ist für selbstständige Friseure unerlässlich und wird oft vom Salonbetreiber verlangt.',
  statusDeterminationInfo: 'Die Statusfeststellung (Formular V027) klärt verbindlich, ob du als selbstständig oder scheinselbstständig eingestuft wirst. Der Antrag wird bei der Deutschen Rentenversicherung gestellt.',
  craftsChamberInfo: 'Die Eintragung in die Handwerksrolle bei der Handwerkskammer ist Pflicht für alle selbstständigen Friseure. Sie dokumentiert deine fachliche Qualifikation.',
  
  // Step Titles & Descriptions
  step1Title: 'Deine Geschäftsdaten',
  step1Description: 'Diese Daten benötigen wir für die Rechnungsstellung und rechtliche Dokumentation.',
  step2Title: 'Selbstständigkeits-Check',
  step2Description: 'Diese Kriterien dokumentieren deine Selbstständigkeit und schützen sowohl dich als auch den Salonbetreiber vor dem Risiko der Scheinselbstständigkeit.',
  step3Title: 'Dokumente hochladen',
  step3Description: 'Lade alle erforderlichen Nachweise hoch. Du kannst Dokumente auch später nachreichen.',
  step4Title: 'Zusammenfassung & Abschluss',
  step4Description: 'Überprüfe deine Daten und schließe das Onboarding ab.',
}

// GET - Onboarding Config abrufen (öffentlich für Onboarding-Seite)
export async function GET() {
  try {
    let config = await prisma.onboardingConfig.findUnique({
      where: { id: 'singleton' },
    })

    // Falls keine Config existiert, Default-Werte zurückgeben
    if (!config) {
      return NextResponse.json(DEFAULT_CONFIG)
    }

    // Merge mit Defaults für leere Felder
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...Object.fromEntries(
        Object.entries(config).filter(([, value]) => value !== null && value !== '')
      ),
    }

    return NextResponse.json(mergedConfig)
  } catch (error) {
    console.error('Error fetching onboarding config:', error)
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

// PUT - Onboarding Config aktualisieren (nur Admin)
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Upsert - erstellen falls nicht vorhanden, sonst aktualisieren
    const config = await prisma.onboardingConfig.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        ...data,
      },
      update: data,
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating onboarding config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern' },
      { status: 500 }
    )
  }
}

