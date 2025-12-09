#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Datenbank
 * Führt nur Schema-Sync (db push) aus
 * Seeding wird nicht mehr automatisch ausgeführt, da es nur einmalig nötig ist
 * (Seeding kann manuell mit: pnpm tsx scripts/seed-all.ts ausgeführt werden)
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
  console.log('💡 Hinweis: Seeding wird nicht mehr automatisch ausgeführt.')
  console.log('   Falls nötig, führe manuell aus: pnpm tsx scripts/seed-all.ts')
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

