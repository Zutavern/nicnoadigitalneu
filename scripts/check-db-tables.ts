#!/usr/bin/env tsx
/**
 * Script zum Prüfen ob alle Tabellen in der Datenbank vorhanden sind
 */

import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function checkTables() {
  try {
    console.log('🔍 Prüfe Tabellen in Neon-Datenbank...\n')
    
    // Hole alle Tabellen aus der Datenbank
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    
    console.log(`✅ Gefundene Tabellen (${tables.length}):\n`)
    tables.forEach(t => console.log(`  - ${t.table_name}`))
    
    // Erwartete Tabellen aus Schema (snake_case)
    const expectedTables = [
      'users', 'accounts', 'sessions', 'verification_tokens',
      'user_profiles', 'salon_profiles', 'stylist_profiles', 'stylist_onboardings',
      'service_categories', 'services', 'stylist_skills',
      'conversations', 'conversation_participants', 'messages', 'message_attachments',
      'notifications', 'salons', 'chairs', 'salon_stylist_connections',
      'salon_invitations', 'chair_rentals', 'customers', 'bookings', 'reviews', 'payments',
      'platform_settings', 'error_messages',
      'job_postings', 'job_applications',
      'partners', 'partner_page_config',
      'testimonials',
      'faqs', 'faq_page_config',
      'about_us_page_config', 'approach_cards',
      'security_logs', 'api_keys', 'active_sessions',
      'subscription_plans',
      'email_templates', 'email_logs',
      'referrals', 'referral_rewards', 'user_referral_profiles',
      'status_incidents', 'status_metrics', 'system_status', 'test'
    ]
    
    console.log(`\n📊 Vergleich:\n`)
    const foundTableNames = tables.map(t => t.table_name)
    const missing = expectedTables.filter(t => !foundTableNames.includes(t))
    const extra = foundTableNames.filter(t => !expectedTables.includes(t))
    
    if (missing.length > 0) {
      console.log(`❌ Fehlende Tabellen (${missing.length}):`)
      missing.forEach(t => console.log(`  - ${t}`))
    } else {
      console.log(`✅ Alle erwarteten Tabellen vorhanden!`)
    }
    
    if (extra.length > 0) {
      console.log(`\n⚠️  Zusätzliche Tabellen (${extra.length}):`)
      extra.forEach(t => console.log(`  - ${t}`))
    }
    
    console.log(`\n📈 Statistik:`)
    console.log(`   Erwartet: ${expectedTables.length}`)
    console.log(`   Gefunden: ${foundTableNames.length}`)
    console.log(`   Fehlend: ${missing.length}`)
    console.log(`   Zusätzlich: ${extra.length}`)
    
    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Fehler:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkTables()



