#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Datenbank
 * Führt Schema-Sync (db push) und automatisches Seeding aus
 * Seeding ist idempotent - prüft ob Daten bereits vorhanden sind
 */

import 'dotenv/config'
import { execSync } from 'child_process'

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Prüfe ob DATABASE_URL gesetzt ist
const hasDatabaseUrl = !!(process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)
if (!hasDatabaseUrl) {
  console.error('❌ DATABASE_URL oder DIRECT_DATABASE_URL nicht gesetzt!')
  if (isProduction) {
    console.error('⚠️  Build läuft weiter, aber Datenbank-Synchronisation wird übersprungen')
  } else {
    process.exit(1)
  }
}

console.log(`🔄 Synchronisiere Datenbank-Schema (${isProduction ? 'Production' : 'Development'})...`)
if (hasDatabaseUrl) {
  console.log('✅ DATABASE_URL gefunden')
} else {
  console.log('⚠️  Keine DATABASE_URL - überspringe Synchronisation')
  process.exit(0)
}

try {
  // Prisma db push (nur Schema-Änderungen anwenden)
  // generate wird bereits im Build-Script vorher ausgeführt
  console.log('📦 Führe prisma db push aus...')
  try {
    execSync('pnpm prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    // Falls db push wegen Datenverlust-Warnung fehlschlägt, mit Flag wiederholen
    console.log('⚠️  db push fehlgeschlagen, versuche mit --accept-data-loss...')
    try {
      execSync('pnpm prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
    } catch (retryError) {
      console.error('❌ db push auch mit --accept-data-loss fehlgeschlagen')
      throw retryError
    }
  }

  console.log('✅ Datenbank-Schema erfolgreich synchronisiert!')

  // Automatisches Seeding - Scripts sind idempotent (überspringen vorhandene Daten)
  console.log('')
  console.log('🌱 Führe automatisches Seeding aus (idempotent)...')
  
  const seedScripts = [
    'prisma/seed-approach-cards.ts',
    'prisma/seed-about-us-page-config.ts',
    'prisma/seed-faq-page-config.ts',
    'prisma/seed-partner-page-config.ts',
    'prisma/seed-faqs.ts',
    'prisma/seed-testimonials.ts',
    'prisma/seed-partners.ts',
  ]

  let seedSuccess = 0
  let seedSkipped = 0

  for (const script of seedScripts) {
    try {
      // Extrahiere Seed-Namen für bessere Logs
      const seedName = script.replace('prisma/seed-', '').replace('.ts', '')
      process.stdout.write(`   🌱 ${seedName}... `)
      
      execSync(`pnpm tsx ${script}`, { 
        stdio: 'pipe', // Unterdrücke Output für sauberere Logs
        env: { ...process.env }
      })
      console.log('✅')
      seedSuccess++
    } catch (error) {
      // Seed-Scripts können fehlschlagen wenn Daten bereits vorhanden
      // oder bei anderen nicht-kritischen Fehlern
      console.log('⏭️  (übersprungen)')
      seedSkipped++
    }
  }

  console.log('')
  console.log(`📊 Seeding: ${seedSuccess} erfolgreich, ${seedSkipped} übersprungen`)
  console.log('✅ Datenbank-Synchronisation abgeschlossen!')

} catch (error) {
  console.error('❌ Fehler bei der Schema-Synchronisation:', error)
  // In Production nicht abbrechen, damit der Build weiterläuft
  // Aber logge den Fehler deutlich
  if (isProduction) {
    console.error('⚠️  WARNUNG: Datenbank-Schema-Synchronisation fehlgeschlagen, aber Build läuft weiter')
    console.error('⚠️  Bitte manuell synchronisieren mit: pnpm prisma db push')
  } else {
    process.exit(1)
  }
}
