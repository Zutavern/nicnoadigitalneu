#!/usr/bin/env tsx
/**
 * Script zur Synchronisation der Production-Datenbank (Neon)
 * Führt db push und alle relevanten Seeds aus
 */

import 'dotenv/config'
import { execSync } from 'child_process'

const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL

if (!DIRECT_DATABASE_URL && !DATABASE_URL) {
  console.error('❌ DATABASE_URL oder DIRECT_DATABASE_URL muss gesetzt sein')
  console.error('💡 Tipp: Setze die Environment-Variable für die Production-Datenbank')
  process.exit(1)
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
console.log(`🔄 Synchronisiere ${isProduction ? 'Production' : 'Development'}-Datenbank...`)

try {
  // Prisma db push (mit --accept-data-loss für Production, da alte Tabellen entfernt werden)
  console.log('📦 Führe prisma db push aus...')
  console.log('⚠️  Hinweis: Alte Tabellen werden entfernt (--accept-data-loss)')
  execSync('pnpm prisma db push --accept-data-loss', { 
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
  process.exit(1)
}

