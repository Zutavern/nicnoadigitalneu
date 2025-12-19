/**
 * Seed-Script für V0 AI-Modelle
 * 
 * Erstellt die AIModelConfig Einträge für V0 Homepage-Builder
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const V0_MODELS = [
  {
    provider: 'V0' as const,
    modelId: 'v0/homepage-generate',
    modelKey: 'v0-homepage-generate',
    name: 'V0 Homepage Generator',
    description: 'Generiert eine komplette Homepage mit allen Seiten über Vercel V0',
    category: 'GENERATION' as const,
    subcategory: 'homepage',
    // Einkaufskosten (geschätzt basierend auf V0 API)
    costPerRun: 0.50, // $0.50 pro Generation
    // Verkaufspreis
    pricePerRun: 3.00, // €3.00 pro Generation
    marginPercent: 500, // 500% Marge
    avgDurationMs: 30000, // ca. 30 Sekunden
    isFree: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    provider: 'V0' as const,
    modelId: 'v0/homepage-prompt',
    modelKey: 'v0-homepage-prompt',
    name: 'V0 Seiten-Änderung',
    description: 'Ändert eine einzelne Seite basierend auf einem Prompt über Vercel V0',
    category: 'GENERATION' as const,
    subcategory: 'homepage',
    // Einkaufskosten
    costPerRun: 0.05, // $0.05 pro Prompt
    // Verkaufspreis
    pricePerRun: 0.20, // €0.20 pro Prompt
    marginPercent: 300, // 300% Marge
    avgDurationMs: 15000, // ca. 15 Sekunden
    isFree: false,
    isActive: true,
    sortOrder: 2,
  },
]

async function seedV0Models() {
  console.log('🚀 Starte V0 Models Seed...')

  for (const model of V0_MODELS) {
    const existing = await prisma.aIModelConfig.findUnique({
      where: { modelKey: model.modelKey },
    })

    if (existing) {
      console.log(`  ⏭️  ${model.name} existiert bereits, überspringe...`)
      continue
    }

    await prisma.aIModelConfig.create({
      data: model,
    })
    console.log(`  ✅ ${model.name} erstellt`)
  }

  console.log('✨ V0 Models Seed abgeschlossen!')
}

async function main() {
  try {
    await seedV0Models()
  } catch (error) {
    console.error('❌ Fehler beim Seeden:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
    process.exit(0)
  }
}

main()



