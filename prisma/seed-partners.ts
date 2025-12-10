import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const partners = [
  {
    name: 'WELLA DEAL',
    slug: 'wella-deal',
    category: 'tools',
    description: 'Exklusive Vorteile für NICNOA Co:Worker:innen bei WELLA – deiner Quelle für professionelle Haarpflegeprodukte.',
    offer: '40% Rechnungsrabatt + 4% Bonus + 5% Entwicklungsbonus + 3% Skonto bei Bankeinzug',
    code: 'NICNOA',
    instructions: JSON.stringify([
      'Besuche die WELLA DEAL Website',
      'Wähle deine gewünschten Produkte aus',
      'Gib bei der Bestellung den Code NICNOA ein',
      'Die Rabatte werden automatisch angewendet',
    ]),
    link: 'https://wella.deal',
    isHighlight: true,
    sortOrder: 1,
  },
  {
    name: 'ANOTHER COMB',
    slug: 'another-comb',
    category: 'tools',
    description: 'Premium-Tools für Profis: Hochwertige Kämme & Salon-Zubehör "Made in Japan & beyond".',
    offer: '10% Rabatt exklusiv für NICNOA Mitglieder',
    code: 'NICNOA10',
    instructions: JSON.stringify([
      'Besuche die ANOTHER COMB Website',
      'WICHTIG: Trage bei der Bestellung die E-Mail deal@nicnoa.com ein',
      'Gib den Code NICNOA10 im Bestellprozess ein',
      'Für kostenlosen Versand in München verwende zusätzlich den Code NICNOA',
    ]),
    link: 'https://anothercomb.com',
    isHighlight: false,
    sortOrder: 2,
  },
  {
    name: 'FOIL ME',
    slug: 'foil-me',
    category: 'tools',
    description: 'Professionelle Farbprodukte und Salon-Zubehör für deinen Salonalltag.',
    offer: '15% Rabatt auf deine Bestellung',
    code: 'NICNOA',
    instructions: JSON.stringify([
      'Besuche die FOIL ME Website',
      'Wähle deine gewünschten Produkte aus',
      'Gib bei der Bestellung den Code NICNOA ein',
      'Der Rabatt wird automatisch angewendet',
      'Jetzt shoppen und Farbe, Style & Qualität in den Salon bringen!',
    ]),
    link: 'https://foilme.com',
    isHighlight: false,
    sortOrder: 3,
  },
  {
    name: 'GOODS FOR HAIRDRESSERS',
    slug: 'goods-for-hairdressers',
    category: 'tools',
    description: 'Top-Tools, Kasho-Scheren & Maschinen direkt für deinen Salonalltag.',
    offer: '10% Rabatt auf deine Bestellung',
    code: 'NICNOA10',
    instructions: JSON.stringify([
      'Besuche die GOODS FOR HAIRDRESSERS Website',
      'Wähle deine gewünschten Tools aus',
      'Gib bei der Bestellung den Code NICNOA10 ein',
      'Der Rabatt wird automatisch angewendet',
    ]),
    link: 'https://goodsforhairdressers.com',
    isHighlight: false,
    sortOrder: 4,
  },
  {
    name: 'BELBO',
    slug: 'belbo',
    category: 'booking',
    description: 'Onlinebuchung & Kassensystem – Alles aus einer Hand für deinen Salon.',
    offer: '199€ Einrichtungsgebühr geschenkt!',
    code: null,
    instructions: JSON.stringify([
      'Klicke auf den Link unten, um zu BELBO zu gelangen',
      'Registriere dich über unseren speziellen Link',
      'Die Einrichtungsgebühr von 199€ wird automatisch erlassen',
      'Starte direkt mit deinem neuen Buchungs- und Kassensystem',
    ]),
    link: 'https://belbo.com',
    isHighlight: true,
    sortOrder: 1,
  },
  {
    name: 'SHORE',
    slug: 'shore',
    category: 'booking',
    description: 'Buchungs- & Kassensystem speziell für Friseur:innen entwickelt.',
    offer: '20% Rabatt auf die monatliche Rechnung',
    code: null,
    instructions: JSON.stringify([
      'Kontaktiere SHORE über unseren exklusiven Link',
      'Erwähne, dass du NICNOA Mitglied bist',
      'Der Rabatt wird auf deine monatliche Rechnung angewendet',
      'Exklusiv über NICNOA & Co.',
    ]),
    link: 'https://shore.com',
    isHighlight: false,
    sortOrder: 2,
  },
  {
    name: 'STRATEGIE',
    slug: 'strategie',
    category: 'finance',
    description: 'Spezialist für steueroptimierte Finanz-Architektur: Wir helfen dir, Steuern zu sparen, staatliche Zuschüsse zu nutzen und deine Finanzen sicher aufzustellen.',
    offer: 'Exklusive Beratung für NICNOA Mitglieder',
    code: 'NICNOA & Co',
    instructions: JSON.stringify([
      'Kontaktiere STRATEGIE für eine kostenlose Erstberatung',
      'Erwähne den Code "NICNOA & Co" bei deiner Anfrage',
      'Dein Ansprechpartner: Matthias Futo',
      'Erhalte eine maßgeschneiderte Finanzberatung',
    ]),
    link: 'https://strategie.com',
    isHighlight: false,
    sortOrder: 1,
  },
  {
    name: 'WÜRTTEMBERGISCHE VERSICHERUNG',
    slug: 'wuerttembergische',
    category: 'finance',
    description: 'Spezialkonditionen bei der Betriebshaftpflicht – optimaler Schutz für dich und deinen Salonalltag.',
    offer: 'Spezialkonditionen bei Betriebshaftpflicht',
    code: 'NICNOA',
    instructions: JSON.stringify([
      'Kontaktiere die WÜRTTEMBERGISCHE VERSICHERUNG',
      'Erwähne den Code NICNOA bei deiner Anfrage',
      'Dein Ansprechpartner: Markus Borowski',
      'Erhalte exklusive Konditionen für deine Betriebshaftpflicht',
    ]),
    link: 'https://wuerttembergische.de',
    isHighlight: false,
    sortOrder: 2,
  },
]

async function main() {
  console.log('🌱 Seeding partners...')

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { slug: partner.slug },
      update: partner,
      create: {
        ...partner,
        isActive: true,
      },
    })
  }

  console.log('✅ Partners seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



