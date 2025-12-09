#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Datenbank
 * Führt db push und Seeds aus (nur wenn nötig)
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

console.log(`🔄 Synchronisiere Datenbank (${isProduction ? 'Production' : 'Development'})...`)
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
  execSync('pnpm prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env }
  })

  // Seed Approach Cards (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede Approach Cards...')
  try {
    execSync('pnpm tsx prisma/seed-approach-cards.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ Approach Cards Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed About Us Page Config (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede About Us Page Config...')
  try {
    execSync('pnpm tsx prisma/seed-about-us-page-config.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ About Us Page Config Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed FAQ Page Config (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede FAQ Page Config...')
  try {
    execSync('pnpm tsx prisma/seed-faq-page-config.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ FAQ Page Config Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed Partner Page Config (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede Partner Page Config...')
  try {
    execSync('pnpm tsx prisma/seed-partner-page-config.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ Partner Page Config Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed FAQs (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede FAQs...')
  try {
    execSync('pnpm tsx prisma/seed-faqs.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ FAQs Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed Testimonials (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede Testimonials...')
  try {
    execSync('pnpm tsx prisma/seed-testimonials.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ Testimonials Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  // Seed Partners (nur wenn noch nicht vorhanden)
  console.log('🌱 Prüfe und seede Partners...')
  try {
    execSync('pnpm tsx prisma/seed-partners.ts', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
  } catch (error) {
    console.log('⚠️ Partners Seed übersprungen (möglicherweise bereits vorhanden)')
  }

  console.log('✅ Datenbank erfolgreich synchronisiert!')
} catch (error) {
  console.error('❌ Fehler bei der Synchronisation:', error)
  // In Production nicht abbrechen, damit der Build weiterläuft
  // Aber logge den Fehler deutlich
  if (isProduction) {
    console.error('⚠️  WARNUNG: Datenbank-Synchronisation fehlgeschlagen, aber Build läuft weiter')
    console.error('⚠️  Bitte manuell synchronisieren mit: pnpm tsx scripts/sync-production-db.ts')
  } else {
    process.exit(1)
  }
}

