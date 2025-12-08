import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// FAQs für Salonbesitzer (SALON_OWNER)
const salonOwnerFAQs = [
  {
    question: "Was ist NICNOA & CO. DIGITAL?",
    answer: "NICNOA & CO. DIGITAL ist eine innovative SaaS-Plattform, die speziell für Salon-Coworking-Spaces entwickelt wurde. Wir bieten eine All-in-One-Lösung für die Verwaltung Ihres Beauty-Spaces, von der Buchung bis zur Abrechnung.",
    category: "Allgemein",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 1,
  },
  {
    question: "Wie kann ich meinen Salon-Space mit NICNOA verwalten?",
    answer: "Unsere Plattform bietet Ihnen Tools für Terminplanung, Stuhlvermietung, Kundenverwaltung, Abrechnungen und mehr. Sie können alles zentral über ein übersichtliches Dashboard steuern.",
    category: "Allgemein",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 2,
  },
  {
    question: "Welche Vorteile bietet NICNOA für mein Geschäft?",
    answer: "Mit NICNOA optimieren Sie Ihre Auslastung, reduzieren den Verwaltungsaufwand und schaffen ein professionelles Arbeitsumfeld. Sie profitieren von automatisierten Prozessen, detaillierten Analysen und einem modernen Buchungssystem.",
    category: "Allgemein",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 3,
  },
  {
    question: "Wie funktioniert die Abrechnung?",
    answer: "NICNOA bietet ein transparentes Pay-as-you-go Modell. Sie zahlen nur für die Features, die Sie wirklich nutzen. Alle Transaktionen werden automatisch erfasst und übersichtlich dokumentiert.",
    category: "Finanzen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 4,
  },
  {
    question: "Wie kann ich eine neue Buchung erstellen?",
    answer: "Gehe zum Kalender und klicke auf \"Neuer Termin\". Wähle den Kunden, den Stylisten, den Service und die gewünschte Zeit aus. Bestätige die Buchung und der Kunde erhält automatisch eine Bestätigung.",
    category: "Buchungen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 5,
  },
  {
    question: "Wie storniere ich einen Termin?",
    answer: "Öffne die Buchungsübersicht, finde den entsprechenden Termin und klicke auf das Drei-Punkte-Menü. Wähle \"Stornieren\" und bestätige. Der Kunde wird automatisch über die Stornierung informiert.",
    category: "Buchungen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 6,
  },
  {
    question: "Wie füge ich einen neuen Stylisten hinzu?",
    answer: "Gehe zu \"Stylisten\" und klicke auf \"Stylist einladen\". Gib die E-Mail-Adresse des Stylisten ein. Der Stylist erhält eine Einladung und kann sich nach Abschluss des Onboardings deinem Salon anschließen.",
    category: "Stylisten",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 7,
  },
  {
    question: "Wie verwalte ich die Stuhlmiete?",
    answer: "Unter \"Stylisten\" findest du bei jedem Stylisten die aktuelle Mietvereinbarung. Du kannst dort die monatliche Miete, den Zeitraum und die Konditionen einsehen und bei Bedarf anpassen.",
    category: "Stylisten",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 8,
  },
  {
    question: "Wie erstelle ich eine Rechnung?",
    answer: "Gehe zu \"Rechnungen\" und klicke auf \"Neue Rechnung\". Wähle den Empfänger aus, füge die Positionen hinzu und erstelle die Rechnung. Du kannst sie direkt als PDF herunterladen oder per E-Mail versenden.",
    category: "Finanzen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 9,
  },
  {
    question: "Wo finde ich meine Umsatzübersicht?",
    answer: "Unter \"Umsatz\" findest du eine detaillierte Übersicht deiner Einnahmen. Du kannst nach Zeiträumen, Stylisten und Services filtern und die Daten als Bericht exportieren.",
    category: "Finanzen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 10,
  },
  {
    question: "Wie ändere ich meine Salon-Öffnungszeiten?",
    answer: "Gehe zu \"Einstellungen\" und dann zu \"Öffnungszeiten\". Dort kannst du für jeden Wochentag die Start- und Endzeit festlegen sowie Pausen und Feiertage eintragen.",
    category: "Einstellungen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 11,
  },
  {
    question: "Wie aktualisiere ich meine Kontaktdaten?",
    answer: "Unter \"Einstellungen\" findest du den Bereich \"Kontaktdaten\". Dort kannst du Adresse, Telefonnummer, E-Mail und Website aktualisieren.",
    category: "Einstellungen",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 12,
  },
  {
    question: "Wie kann ich Kundendaten exportieren?",
    answer: "Gehe zu \"Kunden\" und klicke auf \"Exportieren\". Du kannst wählen, welche Daten exportiert werden sollen (DSGVO-konform) und erhältst eine CSV-Datei.",
    category: "Kunden",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 13,
  },
  {
    question: "Wie aktiviere ich die Zwei-Faktor-Authentifizierung?",
    answer: "Gehe zu \"Einstellungen\" → \"Sicherheit\" und aktiviere die Zwei-Faktor-Authentifizierung. Folge den Anweisungen, um eine Authenticator-App zu verknüpfen.",
    category: "Sicherheit",
    role: "SALON_OWNER",
    isActive: true,
    sortOrder: 14,
  },
]

// FAQs für Stuhlmietern (STYLIST)
const stylistFAQs = [
  {
    question: "Wie sicher ist die Vermietung rechtlich?",
    answer: "Mit NICNOA sind Sie auf der sicheren Seite. Wir stellen rechtssichere Mietverträge zur Verfügung, die von Fachanwälten geprüft wurden. Zusätzlich sind alle Transaktionen und Vereinbarungen digital dokumentiert und entsprechen den aktuellen Datenschutzrichtlinien.",
    category: "Allgemein",
    role: "STYLIST",
    isActive: true,
    sortOrder: 1,
  },
  {
    question: "Welche Vorteile habe ich als Stuhlmieter?",
    answer: "Sie profitieren von flexiblen Mietoptionen, einem professionellen Arbeitsumfeld und einer starken Community. Zudem erhalten Sie Zugang zu unserem Buchungssystem für Ihre Kunden.",
    category: "Allgemein",
    role: "STYLIST",
    isActive: true,
    sortOrder: 2,
  },
  {
    question: "Wie funktioniert die Terminverwaltung?",
    answer: "Sie erhalten Zugriff auf unser digitales Terminbuchungssystem. Ihre Kunden können online Termine buchen, und Sie behalten stets den Überblick über Ihren Kalender.",
    category: "Buchungen",
    role: "STYLIST",
    isActive: true,
    sortOrder: 3,
  },
  {
    question: "Wie kann ich mein Business analysieren und Preise gestalten?",
    answer: "NICNOA bietet Ihnen umfangreiche Analytics-Tools für Ihre Geschäftsentwicklung. Sie können Auslastung, Umsatz und Kundenverhalten analysieren sowie flexible Preislisten erstellen. Das hilft Ihnen, datenbasierte Entscheidungen zu treffen und Ihre Preisgestaltung zu optimieren.",
    category: "Verdienst",
    role: "STYLIST",
    isActive: true,
    sortOrder: 4,
  },
  {
    question: "Wie sehe ich meine anstehenden Termine?",
    answer: "Gehe zum Kalender in deinem Dashboard. Dort siehst du alle deine Termine in der Tages-, Wochen- oder Monatsansicht. Klicke auf einen Termin für Details wie Kundeninfos und gebuchte Services.",
    category: "Buchungen",
    role: "STYLIST",
    isActive: true,
    sortOrder: 5,
  },
  {
    question: "Kann ich Zeiten blocken, in denen ich nicht verfügbar bin?",
    answer: "Ja! Gehe zu \"Verfügbarkeit\" und klicke auf \"Blocker hinzufügen\". Du kannst einzelne Zeiträume oder wiederkehrende Auszeiten (z.B. jeden Montag) eintragen.",
    category: "Buchungen",
    role: "STYLIST",
    isActive: true,
    sortOrder: 6,
  },
  {
    question: "Wo sehe ich meine Einnahmen?",
    answer: "Unter \"Verdienst\" findest du eine detaillierte Übersicht deiner Einnahmen. Du siehst dein Tages-, Wochen- und Monatseinkommen sowie eine Aufschlüsselung nach Salons und Services.",
    category: "Verdienst",
    role: "STYLIST",
    isActive: true,
    sortOrder: 7,
  },
  {
    question: "Wann und wie werde ich bezahlt?",
    answer: "Die Auszahlung erfolgt je nach Vereinbarung mit dem Salon. In der Regel erhältst du deine Einnahmen abzüglich der Stuhlmiete am Monatsende auf dein hinterlegtes Bankkonto.",
    category: "Verdienst",
    role: "STYLIST",
    isActive: true,
    sortOrder: 8,
  },
  {
    question: "Wie finde ich einen Salon für die Stuhlmiete?",
    answer: "Gehe zu \"Salon finden\" und nutze die Suchfunktion. Du kannst nach Standort, Ausstattung und Konditionen filtern. Sende eine Anfrage an interessante Salons direkt über die Plattform.",
    category: "Salon",
    role: "STYLIST",
    isActive: true,
    sortOrder: 9,
  },
  {
    question: "Kann ich in mehreren Salons gleichzeitig arbeiten?",
    answer: "Ja, du kannst Vereinbarungen mit mehreren Salons haben. Achte darauf, deine Verfügbarkeit entsprechend zu pflegen, um Überschneidungen zu vermeiden.",
    category: "Salon",
    role: "STYLIST",
    isActive: true,
    sortOrder: 10,
  },
  {
    question: "Wie aktualisiere ich mein Profil?",
    answer: "Unter \"Einstellungen\" → \"Profil\" kannst du deine Infos, Bio, Skills und Social-Media-Links bearbeiten. Ein vollständiges Profil hilft dir, mehr Kunden zu gewinnen.",
    category: "Profil",
    role: "STYLIST",
    isActive: true,
    sortOrder: 11,
  },
  {
    question: "Wie füge ich Bilder zu meinem Portfolio hinzu?",
    answer: "Gehe zu \"Profil\" und scrolle zum Abschnitt \"Portfolio\". Klicke auf \"Bilder hinzufügen\" und lade deine besten Arbeiten hoch. Qualitativ hochwertige Bilder sind wichtig für deinen Erfolg!",
    category: "Profil",
    role: "STYLIST",
    isActive: true,
    sortOrder: 12,
  },
  {
    question: "Welche Dokumente brauche ich für die Selbstständigkeit?",
    answer: "Du benötigst: Meisterbrief/Ausnahmebewilligung, Gewerbeanmeldung, Betriebshaftpflichtversicherung, Statusfeststellung (V027) und Handwerkskammer-Eintragung. Diese lädst du im Onboarding hoch.",
    category: "Compliance",
    role: "STYLIST",
    isActive: true,
    sortOrder: 13,
  },
  {
    question: "Was bedeutet \"Scheinselbstständigkeit\"?",
    answer: "Scheinselbstständigkeit liegt vor, wenn du rechtlich wie ein Angestellter behandelt wirst, aber als Selbstständiger gemeldet bist. Um das zu vermeiden, nutzt du eigene Tools, bestimmst deine Preise selbst und hast mehrere Auftraggeber.",
    category: "Compliance",
    role: "STYLIST",
    isActive: true,
    sortOrder: 14,
  },
]

async function main() {
  console.log('🌱 Seeding FAQs...')

  const allFAQs = [...salonOwnerFAQs, ...stylistFAQs]

  for (const faq of allFAQs) {
    try {
      // Try to find existing FAQ by question and role
      const existing = await (prisma as any).fAQ?.findFirst?.({
        where: {
          question: faq.question,
          role: faq.role,
        },
      }) || await (prisma as any).faq?.findFirst?.({
        where: {
          question: faq.question,
          role: faq.role,
        },
      })

      if (existing) {
        await (prisma as any).fAQ?.update?.({
          where: { id: existing.id },
          data: faq,
        }) || await (prisma as any).faq?.update?.({
          where: { id: existing.id },
          data: faq,
        })
      } else {
        await (prisma as any).fAQ?.create?.({
          data: faq,
        }) || await (prisma as any).faq?.create?.({
          data: faq,
        })
      }
    } catch (error) {
      console.error(`Error seeding FAQ ${faq.question}:`, error)
    }
  }

  console.log('✅ FAQs seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

