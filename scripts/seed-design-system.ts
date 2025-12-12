import { prisma } from '../src/lib/prisma'

async function seedDesignSystem() {
  try {
    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        designSystemPreset: 'nicnoa-classic',
        designTokens: null, // Verwendet Preset-Defaults
      },
      create: {
        id: 'default',
        designSystemPreset: 'nicnoa-classic',
        designTokens: null,
      },
    })
    console.log('✅ Design-System Preset gesetzt: nicnoa-classic')
  } catch (error) {
    console.error('❌ Fehler beim Seeden des Design-Systems:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDesignSystem()





