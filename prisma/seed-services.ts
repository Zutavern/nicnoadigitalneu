import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})

// Standard Friseur-Services kategorisiert
const SERVICE_CATEGORIES = [
  {
    name: 'Schneiden & Styling',
    icon: 'scissors',
    color: 'emerald',
    description: 'Haarschnitte und Stylingservices für alle Zielgruppen',
    services: [
      { name: 'Damenhaarschnitt', description: 'Klassischer Schnitt für Damen' },
      { name: 'Herrenhaarschnitt', description: 'Klassischer Schnitt für Herren' },
      { name: 'Kinderhaarschnitt', description: 'Schnitt für Kinder bis 12 Jahre' },
      { name: 'Pony schneiden', description: 'Pony nachschneiden und stylen' },
      { name: 'Trockenschnitt', description: 'Schnitt ohne Waschen' },
      { name: 'Föhnen & Styling', description: 'Professionelles Föhnen und Styling' },
      { name: 'Locken styling', description: 'Locken und Wellen stylen' },
      { name: 'Glätten', description: 'Haare glätten mit Glätteisen' },
    ],
  },
  {
    name: 'Färben & Colorationen',
    icon: 'palette',
    color: 'violet',
    description: 'Alle Arten von Haarfarben und Techniken',
    services: [
      { name: 'Balayage', description: 'Natürliche Farbverläufe' },
      { name: 'Highlights / Strähnen', description: 'Klassische Strähnen-Technik' },
      { name: 'Lowlights', description: 'Dunkle Akzente setzen' },
      { name: 'Komplettfärbung', description: 'Vollständige Haarfarbe' },
      { name: 'Ansatzfärbung', description: 'Nachwachsende Ansätze nachfärben' },
      { name: 'Color Correction', description: 'Farb-Korrekturen bei Missgeschicken' },
      { name: 'Toning / Glossing', description: 'Farbauffrischung und Glanz' },
      { name: 'Blondierung', description: 'Aufhellung der Haare' },
      { name: 'Fashion Colors', description: 'Kreative Farben (Rot, Blau, etc.)' },
      { name: 'Grauabdeckung', description: 'Natürliche Abdeckung grauer Haare' },
    ],
  },
  {
    name: 'Pflege & Behandlungen',
    icon: 'sparkles',
    color: 'cyan',
    description: 'Haarpflege und Spa-Behandlungen',
    services: [
      { name: 'Olaplex Behandlung', description: 'Bonding-Behandlung für gesundes Haar' },
      { name: 'Keratin Treatment', description: 'Glättung und Anti-Frizz Behandlung' },
      { name: 'Kopfhautbehandlung', description: 'Pflege für empfindliche Kopfhaut' },
      { name: 'Intensiv-Kur', description: 'Tiefenpflege für strapaziertes Haar' },
      { name: 'Haar-Spa', description: 'Entspannende Haarbehandlung mit Massage' },
      { name: 'Protein Behandlung', description: 'Stärkung für brüchiges Haar' },
      { name: 'Feuchtigkeitsbehandlung', description: 'Intensive Hydration' },
    ],
  },
  {
    name: 'Spezialservices',
    icon: 'crown',
    color: 'amber',
    description: 'Besondere Anlässe und Spezialbehandlungen',
    services: [
      { name: 'Hochsteckfrisuren', description: 'Elegante Hochsteckfrisuren' },
      { name: 'Braut-Styling', description: 'Komplett-Styling für Bräute' },
      { name: 'Extensions einarbeiten', description: 'Haarverlängerungen anbringen' },
      { name: 'Extensions entfernen', description: 'Haarverlängerungen entfernen' },
      { name: 'Dauerwelle', description: 'Klassische Dauerwelle' },
      { name: 'Volumenwelle', description: 'Natürliches Volumen durch Wellen' },
      { name: 'Bart-Styling', description: 'Bartschnitt und -pflege' },
      { name: 'Bart färben', description: 'Bartfärbung' },
      { name: 'Brauen zupfen', description: 'Augenbrauen in Form bringen' },
      { name: 'Brauen färben', description: 'Augenbrauen färben' },
    ],
  },
]

async function seedServices() {
  const client = await pool.connect()
  
  try {
    console.log('🌱 Seeding services...\n')

    // Check if services already exist
    const existingResult = await client.query('SELECT COUNT(*) FROM service_categories')
    const existingCount = parseInt(existingResult.rows[0].count)
    
    if (existingCount > 0) {
      console.log(`⚠️  Es existieren bereits ${existingCount} Kategorien. Überspringe Seeding.`)
      console.log('   Um die Services neu zu erstellen, lösche zuerst alle existierenden.')
      return
    }

    let categoryOrder = 1
    for (const category of SERVICE_CATEGORIES) {
      // Create category
      const categorySlug = category.name
        .toLowerCase()
        .replace(/[äöüß]/g, (match: string) => {
          const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
          return map[match] || match
        })
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const categoryResult = await client.query(
        `INSERT INTO service_categories (name, slug, description, icon, color, sort_order, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         RETURNING id`,
        [category.name, categorySlug, category.description, category.icon, category.color, categoryOrder]
      )
      
      const categoryId = categoryResult.rows[0].id
      console.log(`✅ Kategorie erstellt: ${category.name}`)

      // Create services for this category
      let serviceOrder = 1
      for (const service of category.services) {
        const serviceSlug = service.name
          .toLowerCase()
          .replace(/[äöüß]/g, (match: string) => {
            const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
            return map[match] || match
          })
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        await client.query(
          `INSERT INTO services (category_id, name, slug, description, sort_order, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
          [categoryId, service.name, serviceSlug, service.description, serviceOrder]
        )
        
        console.log(`   📌 Service: ${service.name}`)
        serviceOrder++
      }
      
      categoryOrder++
      console.log('')
    }

    console.log('🎉 Services erfolgreich angelegt!')
    console.log(`   ${SERVICE_CATEGORIES.length} Kategorien`)
    console.log(`   ${SERVICE_CATEGORIES.reduce((acc, cat) => acc + cat.services.length, 0)} Services`)
    
  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seedServices()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

