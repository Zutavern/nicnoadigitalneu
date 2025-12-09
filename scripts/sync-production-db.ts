#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Production-Datenbank (Neon)
 * Führt db push und Seeds aus
 */

import 'dotenv/config'
import { execSync } from 'child_process'

const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL

if (!DIRECT_DATABASE_URL && !DATABASE_URL) {
  console.error('❌ DATABASE_URL oder DIRECT_DATABASE_URL muss gesetzt sein')
  process.exit(1)
}

console.log('🔄 Synchronisiere Production-Datenbank...')

try {
  // Prisma db push
  console.log('📦 Führe prisma db push aus...')
  execSync('pnpm prisma db push', { stdio: 'inherit' })

  // Seed Approach Cards
  console.log('🌱 Seede Approach Cards...')
  execSync('pnpm tsx prisma/seed-approach-cards.ts', { stdio: 'inherit' })

  // Seed About Us Page Config (nur wenn noch nicht vorhanden)
  console.log('🌱 Seede About Us Page Config...')
  execSync('pnpm tsx prisma/seed-about-us-page-config.ts', { stdio: 'inherit' })

  console.log('✅ Datenbank erfolgreich synchronisiert!')
} catch (error) {
  console.error('❌ Fehler bei der Synchronisation:', error)
  process.exit(1)
}

