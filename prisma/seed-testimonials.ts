import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const testimonials = [
  // Stuhlmietern Testimonials
  {
    name: 'Sarah Müller',
    role: 'STYLIST',
    text: 'NICNOA hat mein Arbeitsleben komplett verändert! Endlich habe ich einen professionellen Arbeitsplatz ohne die hohen Kosten eines eigenen Salons. Die Buchungsplattform ist super intuitiv und ich kann mich voll auf meine Kunden konzentrieren.',
    company: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Lisa Schmidt',
    role: 'STYLIST',
    text: 'Als selbstständige Friseurin war es immer schwierig, einen passenden Salon zu finden. Mit NICNOA habe ich jetzt Zugang zu mehreren hochwertigen Salons in meiner Nähe. Die Flexibilität ist unschlagbar!',
    company: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Maria Weber',
    role: 'STYLIST',
    text: 'Die Verwaltung meiner Buchungen war früher ein Alptraum. Jetzt läuft alles automatisch über NICNOA. Ich spare so viel Zeit und kann mehr Kunden bedienen. Absolut empfehlenswert!',
    company: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Anna Fischer',
    role: 'STYLIST',
    text: 'Ich liebe die Community auf NICNOA! Man lernt andere Stylisten kennen, tauscht sich aus und wächst gemeinsam. Das Netzwerk ist genauso wertvoll wie die praktischen Tools.',
    company: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Julia Becker',
    role: 'STYLIST',
    text: 'Endlich eine Lösung, die wirklich für uns Stylisten gemacht ist. Die App ist so benutzerfreundlich und die Support-Mitarbeiter sind immer hilfsbereit. 5 Sterne!',
    company: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Sophie Wagner',
    role: 'STYLIST',
    text: 'Seit ich NICNOA nutze, habe ich meine Auslastung um 40% gesteigert. Die automatischen Erinnerungen an Kunden funktionieren perfekt und ich habe weniger No-Shows.',
    company: null,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Emma Hoffmann',
    role: 'STYLIST',
    text: 'Die Partner-Vorteile sind ein Game-Changer! Ich spare bei Produkten und Tools, die ich sowieso brauche. Das macht NICNOA noch wertvoller für mich.',
    company: null,
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'Laura Klein',
    role: 'STYLIST',
    text: 'Als Berufseinsteigerin war es schwer, Fuß zu fassen. NICNOA hat mir geholfen, schnell Kunden zu finden und einen guten Ruf aufzubauen. Danke für diese tolle Plattform!',
    company: null,
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Nina Schulz',
    role: 'STYLIST',
    text: 'Die Flexibilität ist das Beste! Ich kann meine Arbeitszeiten selbst bestimmen und trotzdem professionell arbeiten. Perfekt für Work-Life-Balance.',
    company: null,
    isActive: true,
    sortOrder: 9,
  },
  {
    name: 'Mia Bauer',
    role: 'STYLIST',
    text: 'NICNOA hat mir geholfen, mein eigenes Business aufzubauen, ohne die Risiken eines eigenen Salons. Die monatlichen Kosten sind fair und transparent.',
    company: null,
    isActive: true,
    sortOrder: 10,
  },
  // Salonbesitzer Testimonials
  {
    name: 'Thomas Schneider',
    role: 'SALON_OWNER',
    text: 'Seit wir NICNOA nutzen, haben wir unsere Auslastung von 60% auf 95% gesteigert! Die Plattform verwaltet alles automatisch und wir sparen enorm viel Zeit bei der Administration.',
    company: 'Salon Elegance',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Michael Braun',
    role: 'SALON_OWNER',
    text: 'Die Verwaltung von Stuhlvermietungen war früher sehr aufwendig. Mit NICNOA läuft alles reibungslos. Wir haben mehr Zeit für unsere Kunden und weniger Stress.',
    company: 'Hair Studio München',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Andreas Koch',
    role: 'SALON_OWNER',
    text: 'NICNOA hat unseren Salon zu einem echten Coworking-Space gemacht. Wir haben jetzt eine bunte Mischung aus talentierten Stylisten, die alle voneinander profitieren.',
    company: 'Style Lounge',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Stefan Wolf',
    role: 'SALON_OWNER',
    text: 'Die Analytics-Tools zeigen uns genau, welche Stühle am besten genutzt werden und wo wir optimieren können. Das hilft uns, bessere Entscheidungen zu treffen.',
    company: 'Cut & Color',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Daniel Meyer',
    role: 'SALON_OWNER',
    text: 'Wir haben unsere Verwaltungskosten um 70% reduziert, seit wir NICNOA nutzen. Die automatische Abrechnung und das Reporting sparen uns Stunden pro Woche.',
    company: 'Hair Design',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Markus Zimmermann',
    role: 'SALON_OWNER',
    text: 'Die Plattform ist so intuitiv, dass unsere Stylisten sie sofort verstanden haben. Keine langen Einarbeitungszeiten, alles funktioniert out-of-the-box.',
    company: 'Beauty Salon',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Christian Lange',
    role: 'SALON_OWNER',
    text: 'NICNOA hat uns geholfen, unsere leeren Stühle zu vermieten. Jetzt haben wir eine konstante Auslastung und zusätzliche Einnahmen. Das System zahlt sich jeden Monat aus.',
    company: 'Hair & More',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'Sebastian Hartmann',
    role: 'SALON_OWNER',
    text: 'Die Integration mit unseren bestehenden Systemen war problemlos. NICNOA passt sich an unsere Bedürfnisse an, nicht umgekehrt. Genau das, was wir brauchten.',
    company: 'Salon Modern',
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Oliver Richter',
    role: 'SALON_OWNER',
    text: 'Wir haben jetzt Zugang zu einer größeren Community von Stylisten. Das bringt neue Ideen, neue Techniken und mehr Vielfalt in unseren Salon. Großartig!',
    company: 'Style House',
    isActive: true,
    sortOrder: 9,
  },
  {
    name: 'Jan Neumann',
    role: 'SALON_OWNER',
    text: 'Die Kundenbewertungen und das Feedback-System helfen uns, unsere Qualität kontinuierlich zu verbessern. Transparenz schafft Vertrauen bei allen Beteiligten.',
    company: 'Hair Studio',
    isActive: true,
    sortOrder: 10,
  },
]

async function main() {
  console.log('🌱 Seeding testimonials...')

  for (const testimonial of testimonials) {
    try {
      // Try to find existing testimonial by name and role
      const existing = await prisma.testimonial.findFirst({
        where: {
          name: testimonial.name,
          role: testimonial.role,
        },
      })

      if (existing) {
        await prisma.testimonial.update({
          where: { id: existing.id },
          data: testimonial,
        })
      } else {
        await prisma.testimonial.create({
          data: testimonial,
        })
      }
    } catch (error) {
      console.error(`Error seeding testimonial ${testimonial.name}:`, error)
    }
  }

  console.log('✅ Testimonials seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

