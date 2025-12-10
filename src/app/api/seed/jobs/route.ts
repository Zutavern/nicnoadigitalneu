import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Stellenanzeigen für NICNOA - Startup im Beauty-Tech-Bereich
const jobPostings = [
  // IT & Entwicklung
  {
    title: 'Senior Full-Stack Developer (Next.js)',
    slug: 'senior-fullstack-developer-nextjs',
    category: 'IT-Development',
    description: `Als Senior Full-Stack Developer bei NICNOA gestaltest du die Zukunft der Salon-Branche aktiv mit. Du arbeitest an unserer innovativen SaaS-Plattform und entwickelst Features, die tausenden Friseuren und Salonbesitzern den Alltag erleichtern.

**Deine Aufgaben:**
- Entwicklung und Wartung unserer Next.js-basierten Plattform
- Implementierung neuer Features von der Konzeption bis zum Deployment
- Code-Reviews und Mentoring von Junior-Entwicklern
- Enge Zusammenarbeit mit Product und Design
- Performance-Optimierung und Skalierung der Anwendung

**Unser Tech-Stack:**
Next.js 15, React 19, TypeScript, Prisma, PostgreSQL (Neon), Tailwind CSS, Vercel, GitHub Actions`,
    requirements: `**Was du mitbringst:**
- 5+ Jahre Erfahrung in der Web-Entwicklung
- Sehr gute Kenntnisse in TypeScript, React und Next.js
- Erfahrung mit relationalen Datenbanken (PostgreSQL)
- Verständnis für Clean Code und Testing
- Teamfähigkeit und eigenverantwortliches Arbeiten
- Fließende Deutschkenntnisse (C1+) und gutes Englisch

**Nice to have:**
- Erfahrung mit Prisma ORM
- Kenntnisse in CI/CD und DevOps
- Erfahrung mit Vercel
- Interesse an der Beauty-Branche`,
    benefits: `**Was wir bieten:**
- Kompetitives Gehalt (80.000€ - 100.000€ je nach Erfahrung)
- Flexible Arbeitszeiten und Remote-First-Kultur
- MacBook Pro und Equipment deiner Wahl
- 30 Tage Urlaub + Sonderurlaub
- Startup-Atmosphäre mit flachen Hierarchien
- Regelmäßige Team-Events (auch remote!)
- Kostenlose Haarschnitte bei unseren Partner-Salons 💇`,
    location: 'München / Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'Frontend Developer (React/TypeScript)',
    slug: 'frontend-developer-react-typescript',
    category: 'IT-Development',
    description: `Du liebst es, großartige User Interfaces zu bauen? Bei NICNOA kannst du deine Kreativität voll ausleben und zusammen mit unserem Design-Team moderne, intuitive Oberflächen entwickeln.

**Deine Aufgaben:**
- Entwicklung von React-Komponenten mit TypeScript
- Umsetzung von Designs in pixelgenauen Code
- Optimierung der User Experience
- Implementation von Animationen und Micro-Interactions
- A/B-Testing und Performance-Messung`,
    requirements: `**Was du mitbringst:**
- 3+ Jahre Erfahrung mit React und TypeScript
- Gute Kenntnisse in CSS/Tailwind
- Auge für Design und UX
- Erfahrung mit modernen Frontend-Tools
- Teamgeist und Kommunikationsstärke

**Nice to have:**
- Erfahrung mit Framer Motion
- Kenntnisse in Next.js
- Accessibility-Expertise`,
    benefits: `**Was wir bieten:**
- Gehalt: 55.000€ - 75.000€
- Remote-First mit optionalem Office in München
- Flexible Arbeitszeiten
- Modernes Equipment
- 28 Tage Urlaub
- Weiterbildungsbudget`,
    location: 'München / Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 2,
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    category: 'IT-Development',
    description: `Als DevOps Engineer sorgst du dafür, dass unsere Plattform stabil, sicher und performant läuft. Du baust Infrastruktur, automatisierst Prozesse und hilfst dem Team, schneller und besser zu deployen.

**Deine Aufgaben:**
- Aufbau und Pflege unserer CI/CD-Pipelines
- Monitoring und Alerting implementieren
- Sicherheit und Compliance gewährleisten
- Infrastruktur als Code (IaC)
- Zusammenarbeit mit den Entwicklern für reibungslose Deployments`,
    requirements: `**Was du mitbringst:**
- 3+ Jahre DevOps/SRE-Erfahrung
- Kenntnisse in Cloud-Plattformen (AWS, Vercel, oder ähnliche)
- Erfahrung mit Container-Technologien
- Scripting-Skills (Bash, Python)
- Verständnis für Security Best Practices

**Nice to have:**
- Kubernetes-Erfahrung
- Terraform/Pulumi
- PostgreSQL-Administration`,
    benefits: `**Was wir bieten:**
- Gehalt: 65.000€ - 90.000€
- 100% Remote möglich
- Flexible Arbeitszeiten
- Premium Equipment
- 30 Tage Urlaub
- Conference-Budget`,
    location: 'Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 3,
  },
  {
    title: 'UX/UI Designer',
    slug: 'ux-ui-designer',
    category: 'Design',
    description: `Als UX/UI Designer bei NICNOA gestaltest du die Zukunft der Salon-Verwaltung. Du designst intuitive Interfaces, die von tausenden Nutzern täglich verwendet werden.

**Deine Aufgaben:**
- Konzeption und Design neuer Features
- Erstellung von Wireframes, Mockups und Prototypen
- User Research und Testing
- Pflege unseres Design Systems
- Enge Zusammenarbeit mit Product und Development`,
    requirements: `**Was du mitbringst:**
- 3+ Jahre Erfahrung im UX/UI Design
- Souveräner Umgang mit Figma
- Portfolio mit Web- und Mobile-Projekten
- Verständnis für Entwicklungsprozesse
- Nutzerzentriertes Denken

**Nice to have:**
- Erfahrung mit Design Systems
- Motion Design Skills
- HTML/CSS Grundkenntnisse`,
    benefits: `**Was wir bieten:**
- Gehalt: 50.000€ - 70.000€
- Remote-First Kultur
- MacBook und Design-Tools
- 28 Tage Urlaub
- Kreatives Team
- Design-Konferenzen`,
    location: 'München / Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 4,
  },
  // Product & Operations
  {
    title: 'Product Manager',
    slug: 'product-manager',
    category: 'Product',
    description: `Als Product Manager bei NICNOA bist du die Schnittstelle zwischen unseren Nutzern und dem Entwicklungsteam. Du definierst die Roadmap und sorgst dafür, dass wir die richtigen Features bauen.

**Deine Aufgaben:**
- Entwicklung und Pflege der Product Roadmap
- Priorisierung von Features basierend auf Nutzerfeedback und Daten
- Schreiben von User Stories und Akzeptanzkriterien
- Stakeholder-Management
- Markt- und Wettbewerbsanalysen`,
    requirements: `**Was du mitbringst:**
- 4+ Jahre Erfahrung als Product Manager
- Erfahrung mit agilen Methoden (Scrum/Kanban)
- Analytisches Denken und datengetriebene Entscheidungsfindung
- Exzellente Kommunikationsfähigkeiten
- Idealerweise Erfahrung mit SaaS-Produkten

**Nice to have:**
- Technischer Hintergrund
- Erfahrung in der Beauty-Branche
- Startup-Erfahrung`,
    benefits: `**Was wir bieten:**
- Gehalt: 70.000€ - 95.000€
- Echte Gestaltungsmöglichkeiten
- Remote-First mit Team-Offsites
- 30 Tage Urlaub
- Budget für Konferenzen
- Equity-Optionen möglich`,
    location: 'München / Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 5,
  },
  {
    title: 'Customer Success Manager',
    slug: 'customer-success-manager',
    category: 'Operations',
    description: `Als Customer Success Manager bist du der erste Ansprechpartner für unsere Kunden. Du sorgst dafür, dass Salons und Stuhlmieter das Beste aus NICNOA herausholen.

**Deine Aufgaben:**
- Onboarding neuer Kunden
- Proaktive Betreuung des Kundenportfolios
- Erkennen und Lösen von Problemen
- Sammeln von Feedback für das Product Team
- Entwicklung von Best Practices und Schulungsmaterialien`,
    requirements: `**Was du mitbringst:**
- 2+ Jahre Erfahrung im Customer Success oder Account Management
- Empathie und Kommunikationsstärke
- Lösungsorientiertes Denken
- Erfahrung mit CRM-Systemen
- Fließendes Deutsch

**Nice to have:**
- Erfahrung in der Beauty-Branche
- SaaS-Background
- Kenntnisse in Support-Tools`,
    benefits: `**Was wir bieten:**
- Gehalt: 45.000€ - 60.000€
- Direkter Impact auf Kundenzufriedenheit
- Hybrid-Arbeit möglich
- 28 Tage Urlaub
- Weiterbildungsbudget
- Tolle Team-Events`,
    location: 'München / Hybrid',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 6,
  },
  // Marketing & Sales
  {
    title: 'Marketing Manager',
    slug: 'marketing-manager',
    category: 'Marketing',
    description: `Als Marketing Manager bei NICNOA entwickelst und steuerst du unsere Marketing-Strategie. Du bringst unsere Marke nach vorne und generierst qualifizierte Leads.

**Deine Aufgaben:**
- Entwicklung und Umsetzung der Marketing-Strategie
- Content Marketing (Blog, Social Media, Newsletter)
- Performance Marketing (Google Ads, Meta Ads)
- Eventplanung und Messen
- Marketing-Automatisierung`,
    requirements: `**Was du mitbringst:**
- 3+ Jahre Marketing-Erfahrung, idealerweise B2B SaaS
- Kenntnisse in Performance Marketing
- Content-Erstellungsskills
- Analytisches Denken
- Kreativität und Eigeninitiative

**Nice to have:**
- SEO/SEA-Expertise
- Erfahrung mit HubSpot oder ähnlichen Tools
- Video-Content-Erfahrung`,
    benefits: `**Was wir bieten:**
- Gehalt: 55.000€ - 75.000€
- Marketing-Budget für Experimente
- Remote-First
- 28 Tage Urlaub
- Konferenz-Teilnahme
- Equity-Optionen`,
    location: 'München / Remote',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 7,
  },
  {
    title: 'Sales Representative (m/w/d)',
    slug: 'sales-representative',
    category: 'Sales',
    description: `Als Sales Representative gewinnst du neue Kunden für NICNOA. Du überzeugst Salonbesitzer und Stuhlmieter von unserer Plattform und baust langfristige Beziehungen auf.

**Deine Aufgaben:**
- Akquise neuer Kunden (Salons und Stuhlmieter)
- Durchführung von Produktdemos
- Verhandlung und Abschluss von Verträgen
- Pflege der Sales-Pipeline im CRM
- Teilnahme an Messen und Events`,
    requirements: `**Was du mitbringst:**
- 2+ Jahre Vertriebserfahrung
- Überzeugungskraft und Verhandlungsgeschick
- Hunter-Mentalität
- CRM-Erfahrung (z.B. HubSpot)
- Reisebereitschaft

**Nice to have:**
- Erfahrung in der Beauty-Branche
- SaaS-Sales-Erfahrung
- Netzwerk in der Friseurszene`,
    benefits: `**Was wir bieten:**
- Fixgehalt: 45.000€ + attraktive Provision
- Uncapped Commission
- Firmenwagen oder Mobilitätsbudget
- 28 Tage Urlaub
- Sales-Trainings
- Team-Events`,
    location: 'München + Außendienst',
    type: 'Vollzeit',
    isActive: true,
    sortOrder: 8,
  },
  // Werkstudent & Praktikum
  {
    title: 'Werkstudent Frontend Development',
    slug: 'werkstudent-frontend-development',
    category: 'IT-Development',
    description: `Du studierst Informatik oder einen verwandten Studiengang und möchtest praktische Erfahrung sammeln? Bei NICNOA arbeitest du von Anfang an an echten Features mit!

**Deine Aufgaben:**
- Mitarbeit an der Frontend-Entwicklung
- Umsetzung von UI-Komponenten
- Bug-Fixing und Testing
- Lernen von erfahrenen Entwicklern`,
    requirements: `**Was du mitbringst:**
- Eingeschriebener Student (m/w/d)
- Grundkenntnisse in React/TypeScript
- 15-20 Stunden/Woche verfügbar
- Motivation und Lernbereitschaft
- Gutes Deutsch`,
    benefits: `**Was wir bieten:**
- 18-22€/Stunde (je nach Erfahrung)
- Flexible Arbeitszeiten (Remote möglich)
- Echte Verantwortung
- Mentoring durch Senior-Entwickler
- Übernahmemöglichkeit nach dem Studium`,
    location: 'München / Remote',
    type: 'Werkstudent',
    isActive: true,
    sortOrder: 9,
  },
  {
    title: 'Praktikum Marketing',
    slug: 'praktikum-marketing',
    category: 'Marketing',
    description: `Du möchtest praktische Erfahrung im Marketing sammeln? Bei NICNOA lernst du alle Facetten des modernen Digital Marketings kennen.

**Deine Aufgaben:**
- Unterstützung bei Content-Erstellung
- Social Media Management
- Recherche und Analysen
- Mitarbeit an Kampagnen
- Event-Support`,
    requirements: `**Was du mitbringst:**
- Eingeschriebener Student oder Gap Year
- Interesse an Marketing und Beauty-Branche
- Kreativität und Eigeninitiative
- Gute Deutschkenntnisse
- 3-6 Monate Zeit`,
    benefits: `**Was wir bieten:**
- Faire Praktikumsvergütung
- Flexible Arbeitszeiten
- Echte Projekte, keine Kaffee-Aufgaben
- Zentrales Büro in München
- Übernahmemöglichkeit`,
    location: 'München',
    type: 'Praktikum',
    isActive: true,
    sortOrder: 10,
  },
]

export async function POST() {
  try {
    // Lösche alle vorhandenen Jobs
    await prisma.jobApplication.deleteMany({})
    await prisma.jobPosting.deleteMany({})

    // Erstelle neue Jobs
    const createdJobs = await prisma.jobPosting.createMany({
      data: jobPostings,
    })

    return NextResponse.json({
      success: true,
      message: `${createdJobs.count} Stellenanzeigen erfolgreich erstellt!`,
      count: createdJobs.count,
    })
  } catch (error) {
    console.error('Error seeding jobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Seeden der Jobs', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Jobs' },
      { status: 500 }
    )
  }
}

