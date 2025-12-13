import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// Alle europäischen Sprachen
const europeanLanguages = [
  { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isDefault: true, isActive: true, sortOrder: 1 },
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isDefault: false, isActive: true, sortOrder: 2 },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isDefault: false, isActive: false, sortOrder: 3 },
  { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isDefault: false, isActive: false, sortOrder: 4 },
  { id: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isDefault: false, isActive: false, sortOrder: 5 },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isDefault: false, isActive: false, sortOrder: 6 },
  { id: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', isDefault: false, isActive: false, sortOrder: 7 },
  { id: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', isDefault: false, isActive: false, sortOrder: 8 },
  { id: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', isDefault: false, isActive: false, sortOrder: 9 },
  { id: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', isDefault: false, isActive: false, sortOrder: 10 },
  { id: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', isDefault: false, isActive: false, sortOrder: 11 },
  { id: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', isDefault: false, isActive: false, sortOrder: 12 },
  { id: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', isDefault: false, isActive: false, sortOrder: 13 },
  { id: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', isDefault: false, isActive: false, sortOrder: 14 },
  { id: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', isDefault: false, isActive: false, sortOrder: 15 },
  { id: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', isDefault: false, isActive: false, sortOrder: 16 },
  { id: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', isDefault: false, isActive: false, sortOrder: 17 },
  { id: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', isDefault: false, isActive: false, sortOrder: 18 },
  { id: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', isDefault: false, isActive: false, sortOrder: 19 },
  { id: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', isDefault: false, isActive: false, sortOrder: 20 },
  { id: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', isDefault: false, isActive: false, sortOrder: 21 },
  { id: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', isDefault: false, isActive: false, sortOrder: 22 },
  { id: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', isDefault: false, isActive: false, sortOrder: 23 },
]

async function seedLanguages() {
  console.log('🌍 Seeding European languages...')
  
  for (const lang of europeanLanguages) {
    await prisma.language.upsert({
      where: { id: lang.id },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        flag: lang.flag,
        sortOrder: lang.sortOrder,
        isActive: lang.isActive, // Aktivierungsstatus auch beim Update setzen
      },
      create: lang,
    })
    console.log(`  ✓ ${lang.flag} ${lang.nativeName} (${lang.id}) ${lang.isActive ? '✓' : '○'}`)
  }
  
  console.log(`\n✅ ${europeanLanguages.length} languages seeded successfully!`)
}

seedLanguages()
  .catch((e) => {
    console.error('Error seeding languages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



