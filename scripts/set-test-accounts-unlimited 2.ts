/**
 * Script: Set Test Accounts to Unlimited Credits
 * 
 * Setzt die drei Quick-Login Test-Accounts auf Unlimited Credits
 * 
 * Ausführen: npx tsx scripts/set-test-accounts-unlimited.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const TEST_ACCOUNTS = [
  'admin@nicnoa.de',
  'salon@nicnoa.de',
  'stylist@nicnoa.de',
]

async function main() {
  console.log('🚀 Setting test accounts to unlimited credits...\n')

  for (const email of TEST_ACCOUNTS) {
    try {
      // Finde den User
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      })

      if (!user) {
        console.log(`❌ User not found: ${email}`)
        continue
      }

      // Erstelle oder aktualisiere UserCredits mit isUnlimited = true
      const userCredits = await prisma.userCredits.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: 0,
          lifetimeUsed: 0,
          lifetimeBought: 0,
          isUnlimited: true,
        },
        update: {
          isUnlimited: true,
        },
      })

      console.log(`✅ ${user.name || user.email}: Unlimited activated (ID: ${userCredits.id})`)
    } catch (error) {
      console.error(`❌ Error for ${email}:`, error)
    }
  }

  console.log('\n✨ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

