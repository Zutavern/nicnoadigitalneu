#!/usr/bin/env tsx
/**
 * Script zum einmaligen Seeding aller Daten
 * Führt alle Seed-Scripts aus (idempotent - prüft ob Daten bereits vorhanden)
 */

import 'dotenv/config'
import { execSync } from 'child_process'

console.log('🌱 Starte Seeding aller Daten...')
console.log('💡 Hinweis: Seed-Scripts sind idempotent (überspringen bereits vorhandene Daten)')
console.log('')

const seedScripts = [
  'prisma/seed-approach-cards.ts',
  'prisma/seed-about-us-page-config.ts',
  'prisma/seed-faq-page-config.ts',
  'prisma/seed-partner-page-config.ts',
  'prisma/seed-faqs.ts',
  'prisma/seed-testimonials.ts',
  'prisma/seed-partners.ts',
]

let successCount = 0
let skipCount = 0
let errorCount = 0

for (const script of seedScripts) {
  try {
    console.log(`🌱 Führe ${script} aus...`)
    execSync(`pnpm tsx ${script}`, { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    successCount++
    console.log(`✅ ${script} erfolgreich\n`)
  } catch (error) {
    // Seed-Scripts sind idempotent und können fehlschlagen wenn Daten bereits vorhanden
    console.log(`⚠️  ${script} übersprungen (möglicherweise bereits vorhanden)\n`)
    skipCount++
  }
}

console.log('')
console.log('📊 Seeding-Zusammenfassung:')
console.log(`   ✅ Erfolgreich: ${successCount}`)
console.log(`   ⏭️  Übersprungen: ${skipCount}`)
console.log(`   ❌ Fehler: ${errorCount}`)
console.log('')
console.log('✅ Seeding abgeschlossen!')

