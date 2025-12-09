#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Datenbank
 * Führt db push und Seeds aus (nur wenn nötig)
 */

import 'dotenv/config'
import { execSync } from 'child_process'

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

console.log(`🔄 Synchronisiere Datenbank (${isProduction ? 'Production' : 'Development'})...`)

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

  console.log('✅ Datenbank erfolgreich synchronisiert!')
} catch (error) {
  console.error('❌ Fehler bei der Synchronisation:', error)
  // In Production nicht abbrechen, damit der Build weiterläuft
  if (!isProduction) {
    process.exit(1)
  }
}

