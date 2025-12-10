import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const jobs = [
  // IT-Development
  {
    title: 'Senior Full-Stack Developer',
    slug: 'senior-full-stack-developer',
    category: 'IT-Development',
    description: `Wir suchen einen erfahrenen Full-Stack Developer, der unsere innovative SaaS-Plattform für Salon-Coworking-Spaces mitgestaltet. Du arbeitest an spannenden Features wie Buchungssystemen, Payment-Integrationen und Analytics-Dashboards.

**Was dich erwartet:**
- Entwicklung moderner Web-Anwendungen mit Next.js, React und TypeScript
- Arbeit mit PostgreSQL, Prisma und modernen APIs
- Gestaltung skalierbarer Architekturen
- Zusammenarbeit in einem agilen, remote-freundlichen Team
- Code Reviews und Pair Programming`,
    requirements: `- 5+ Jahre Erfahrung in Full-Stack Development
- Starke Kenntnisse in TypeScript, React und Node.js
- Erfahrung mit Next.js, Prisma und PostgreSQL
- Verständnis für moderne DevOps-Praktiken
- Teamplayer mit ausgeprägter Kommunikationsfähigkeit
- Fließend Deutsch und Englisch`,
    benefits: `- Modernes Tech-Stack und neueste Tools
- Flexible Arbeitszeiten und Remote-First
- Regelmäßige Team-Events in München
- Entwicklungsbudget für Weiterbildung
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 1,
  },
  {
    title: 'Product Manager',
    slug: 'product-manager',
    category: 'IT-Development',
    description: `Als Product Manager bei NICNOA prägst du die Zukunft unserer Plattform. Du arbeitest eng mit Entwicklern, Designern und unseren Kunden zusammen, um innovative Features zu entwickeln, die echte Probleme lösen.

**Deine Aufgaben:**
- Produktstrategie und Roadmap-Entwicklung
- User Research und Kundeninterviews
- Feature-Spezifikationen und User Stories
- Zusammenarbeit mit Engineering und Design
- Datengetriebene Entscheidungen treffen`,
    requirements: `- 3+ Jahre Erfahrung als Product Manager
- Erfahrung mit SaaS-Produkten
- Starke analytische Fähigkeiten
- Ausgezeichnete Kommunikationsfähigkeiten
- Erfahrung mit Agile/Scrum
- Fließend Deutsch und Englisch`,
    benefits: `- Gestalte ein Produkt, das echte Probleme löst
- Direkter Einfluss auf Produktentscheidungen
- Modernes Büro im Herzen von München
- Remote-First mit flexiblen Arbeitszeiten
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 2,
  },
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'IT-Development',
    description: `Du liebst es, schöne und intuitive User Interfaces zu entwickeln? Dann bist du bei uns genau richtig! Wir suchen einen Frontend Developer, der unsere Plattform zu einem echten Erlebnis macht.

**Was dich erwartet:**
- Entwicklung moderner React-Komponenten mit TypeScript
- Arbeit mit Tailwind CSS und Shadcn UI
- Optimierung für Performance und Accessibility
- Zusammenarbeit mit Designern und Backend-Entwicklern
- Code Reviews und kontinuierliche Verbesserung`,
    requirements: `- 3+ Jahre Erfahrung in Frontend Development
- Starke Kenntnisse in React, TypeScript und CSS
- Erfahrung mit modernen Build-Tools
- Auge für Design und UX
- Teamplayer mit Leidenschaft für Code-Qualität
- Fließend Deutsch und Englisch`,
    benefits: `- Modernes Tech-Stack (React 19, Next.js 15)
- Design-System und beste Tools
- Remote-First mit flexiblen Arbeitszeiten
- Regelmäßige Team-Events
- Entwicklungsbudget für Weiterbildung`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 3,
  },
  // Operations
  {
    title: 'Customer Care Specialist',
    slug: 'customer-care-specialist',
    category: 'Operations',
    description: `Als Customer Care Specialist bist du die erste Anlaufstelle für unsere Kunden. Du hilfst Salon-Besitzern und Stylisten dabei, das Beste aus unserer Plattform herauszuholen und sorgst dafür, dass sie sich bei uns wohlfühlen.

**Deine Aufgaben:**
- Kundenbetreuung per E-Mail, Chat und Telefon
- Onboarding neuer Kunden
- Schulungen und Webinare durchführen
- Feedback sammeln und an Product weiterleiten
- Erstellen von Help-Artikeln und Dokumentation`,
    requirements: `- 2+ Jahre Erfahrung im Customer Support
- Ausgezeichnete Kommunikationsfähigkeiten
- Empathie und Problemlösungsfähigkeit
- Erfahrung mit SaaS-Produkten von Vorteil
- Fließend Deutsch, Englisch von Vorteil
- Bereitschaft zu flexiblen Arbeitszeiten`,
    benefits: `- Direkter Kundenkontakt und Impact
- Modernes Büro im Herzen von München
- Remote-First mit flexiblen Arbeitszeiten
- Regelmäßige Schulungen und Weiterbildung
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 1,
  },
  {
    title: 'Marketing Manager',
    slug: 'marketing-manager',
    category: 'Operations',
    description: `Als Marketing Manager entwickelst du Strategien, um unsere innovative Plattform bekannt zu machen. Du arbeitest an Content-Marketing, Social Media, Events und Partnerships, um unsere Community zu wachsen.

**Deine Aufgaben:**
- Entwicklung und Umsetzung von Marketing-Strategien
- Content-Erstellung für Blog, Social Media und E-Mails
- Planung und Durchführung von Events und Webinaren
- Zusammenarbeit mit Influencern und Partnern
- Analyse von Marketing-Metriken und Optimierung`,
    requirements: `- 3+ Jahre Erfahrung im Marketing
- Erfahrung mit B2B-SaaS-Marketing
- Starke Content-Erstellung Fähigkeiten
- Erfahrung mit Marketing-Tools (HubSpot, etc.)
- Kreativität und strategisches Denken
- Fließend Deutsch und Englisch`,
    benefits: `- Gestalte die Marke eines wachsenden Startups
- Modernes Büro im Herzen von München
- Remote-First mit flexiblen Arbeitszeiten
- Budget für Marketing-Tools und Events
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 2,
  },
  // Finance
  {
    title: 'Buchhalter (m/w/d)',
    slug: 'buchhalter',
    category: 'Finance',
    description: `Als Buchhalter bei NICNOA sorgst du für Ordnung in unseren Finanzen und unterstützt unser wachsendes Team bei allen finanziellen Angelegenheiten. Du arbeitest eng mit dem Management zusammen und hilfst dabei, unsere Finanzprozesse zu optimieren.

**Deine Aufgaben:**
- Buchhaltung und Finanzbuchhaltung
- Rechnungsstellung und Zahlungsabwicklung
- Zusammenarbeit mit Steuerberatern
- Monatliche und jährliche Abschlüsse
- Finanzplanung und Budgetierung`,
    requirements: `- Abgeschlossene Ausbildung als Buchhalter oder ähnlich
- 3+ Jahre Berufserfahrung
- Kenntnisse in DATEV oder ähnlichen Systemen
- Sorgfältige und zuverlässige Arbeitsweise
- Gute Excel-Kenntnisse
- Fließend Deutsch`,
    benefits: `- Verantwortungsvolle Position in wachsendem Startup
- Modernes Büro im Herzen von München
- Remote-First mit flexiblen Arbeitszeiten
- Regelmäßige Weiterbildungsmöglichkeiten
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 1,
  },
  {
    title: 'Finance Manager',
    slug: 'finance-manager',
    category: 'Finance',
    description: `Als Finance Manager übernimmst du eine zentrale Rolle in unserem wachsenden Startup. Du entwickelst Finanzstrategien, analysierst Zahlen und unterstützt das Management bei wichtigen Entscheidungen.

**Deine Aufgaben:**
- Finanzplanung und -analyse
- Budgetierung und Forecasting
- Investor Relations
- Finanzreporting und KPIs
- Optimierung von Finanzprozessen`,
    requirements: `- Studium der BWL, VWL oder ähnlich
- 5+ Jahre Erfahrung im Finance-Bereich
- Erfahrung in Startups oder Tech-Unternehmen
- Starke analytische Fähigkeiten
- Erfahrung mit Finanz-Tools und ERP-Systemen
- Fließend Deutsch und Englisch`,
    benefits: `- Gestalte die Finanzstrategie eines wachsenden Startups
- Modernes Büro im Herzen von München
- Remote-First mit flexiblen Arbeitszeiten
- Direkter Einfluss auf Geschäftsentscheidungen
- Attraktives Gehaltspaket`,
    location: 'München (Remote)',
    type: 'Vollzeit',
    sortOrder: 2,
  },
]

async function main() {
  console.log('🌱 Seeding job postings...')

  for (const job of jobs) {
    await prisma.jobPosting.upsert({
      where: { slug: job.slug },
      update: job,
      create: {
        ...job,
        isActive: true,
      },
    })
  }

  console.log('✅ Job postings seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





