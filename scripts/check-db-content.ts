#!/usr/bin/env tsx
/**
 * Script zum Prüfen ob alle Inhalte/Daten in der Datenbank vorhanden sind
 */

import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function checkContent() {
  try {
    console.log('🔍 Prüfe Datenbank-Inhalte...\n')
    
    // Wichtige CMS-Tabellen prüfen
    const checks = [
      { name: 'Approach Cards', model: 'approachCard', table: 'approach_cards' },
      { name: 'About Us Page Config', model: 'aboutUsPageConfig', table: 'about_us_page_config' },
      { name: 'FAQ Page Config', model: null, table: 'faq_page_config' }, // Direkt SQL, kein Model
      { name: 'Partner Page Config', model: 'partnerPageConfig', table: 'partner_page_config' },
      { name: 'FAQs', model: null, table: 'faqs' }, // Direkt SQL
      { name: 'Testimonials', model: 'testimonial', table: 'testimonials' },
      { name: 'Partners', model: 'partner', table: 'partners' },
      { name: 'Error Messages', model: 'errorMessage', table: 'error_messages' },
      { name: 'Job Postings', model: 'jobPosting', table: 'job_postings' },
      { name: 'Platform Settings', model: 'platformSettings', table: 'platform_settings' },
    ]
    
    const results: Array<{ name: string; count: number; status: string }> = []
    
    for (const check of checks) {
      try {
        // Versuche über Prisma Model oder direkt SQL
        let count = 0
        if (check.model) {
          try {
            const model = (prisma as any)[check.model]
            if (model) {
              count = await model.count()
            }
          } catch {
            // Fallback: Direkte SQL-Query
            const result = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
              `SELECT COUNT(*)::int as count FROM ${check.table}`
            )
            count = Number(result[0]?.count || 0)
          }
        } else {
          // Direkt SQL-Query
          const result = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
            `SELECT COUNT(*)::int as count FROM ${check.table}`
          )
          count = Number(result[0]?.count || 0)
        }
        
        const status = count > 0 ? '✅' : '⚠️'
        results.push({ name: check.name, count, status })
      } catch (error: any) {
        results.push({ name: check.name, count: 0, status: '❌' })
      }
    }
    
    console.log('📊 Datenbank-Inhalte:\n')
    results.forEach(r => {
      const countText = r.count > 0 ? `${r.count} Einträge` : 'keine Daten'
      console.log(`${r.status} ${r.name}: ${countText}`)
    })
    
    // Zusammenfassung
    const withData = results.filter(r => r.count > 0).length
    const withoutData = results.filter(r => r.count === 0).length
    
    console.log(`\n📈 Zusammenfassung:`)
    console.log(`   ✅ Mit Daten: ${withData}/${results.length}`)
    console.log(`   ⚠️  Ohne Daten: ${withoutData}/${results.length}`)
    
    if (withoutData > 0) {
      console.log(`\n💡 Fehlende Daten:`)
      results.filter(r => r.count === 0).forEach(r => {
        console.log(`   - ${r.name}`)
      })
      console.log(`\n🔧 Um fehlende Daten hinzuzufügen:`)
      console.log(`   pnpm tsx scripts/seed-all.ts`)
    }
    
    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Fehler:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkContent()

