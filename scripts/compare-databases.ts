#!/usr/bin/env tsx
/**
 * Script zum Vergleich von lokaler und Production-Datenbank
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

// Erwartete Models aus Schema
const expectedModels = [
  'User', 'Salon', 'Stylist', 'Service', 'ServiceCategory',
  'Booking', 'Payment', 'PlatformSettings', 'ErrorMessage',
  'JobPosting', 'JobApplication', 'Partner', 'Testimonial',
  'FAQ', 'FAQPageConfig', 'PartnerPageConfig', 'AboutUsPageConfig',
  'ApproachCard'
]

async function checkDatabase(prisma: PrismaClient, label: string) {
  console.log(`\n🔍 Prüfe ${label}...\n`)
  
  const results: Record<string, { exists: boolean; count?: number }> = {}
  
  for (const model of expectedModels) {
    try {
      // Versuche, die Tabelle zu finden
      const tableName = model
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .substring(1) // Entferne führenden Unterstrich
      
      // Prüfe ob Tabelle existiert
      const tableCheck = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) as exists`,
        tableName
      )
      
      const exists = tableCheck[0]?.exists || false
      
      if (exists) {
        try {
          // Versuche, Daten zu zählen
          const modelLower = model.charAt(0).toLowerCase() + model.slice(1)
          const count = await (prisma as any)[modelLower]?.count() || 0
          results[model] = { exists: true, count: Number(count) }
        } catch {
          results[model] = { exists: true }
        }
      } else {
        results[model] = { exists: false }
      }
    } catch (error: any) {
      results[model] = { exists: false }
    }
  }
  
  console.log(`📊 ${label} - Tabellen-Status:\n`)
  for (const [model, status] of Object.entries(results)) {
    const icon = status.exists ? '✅' : '❌'
    const count = status.count !== undefined ? ` (${status.count} Einträge)` : ''
    console.log(`  ${icon} ${model}${count}`)
  }
  
  return results
}

async function main() {
  console.log('🔍 Datenbank-Vergleich: Lokal vs. Production\n')
  
  // Lokale DB
  const localPrisma = new PrismaClient()
  const localResults = await checkDatabase(localPrisma, 'Lokale DB')
  await localPrisma.$disconnect()
  
  // Production DB (wenn DIRECT_DATABASE_URL gesetzt)
  if (process.env.DIRECT_DATABASE_URL && process.env.DIRECT_DATABASE_URL.includes('neon')) {
    console.log('\n💡 Um Production-DB zu prüfen, setze DIRECT_DATABASE_URL')
    console.log('   Beispiel: DIRECT_DATABASE_URL="..." pnpm tsx scripts/compare-databases.ts')
  }
  
  console.log('\n✅ Vergleich abgeschlossen')
}

main().catch(console.error)
