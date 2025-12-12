import { prisma } from '../src/lib/prisma'

async function setPosthogConfig() {
  const result = await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {
      posthogApiKey: 'phc_vMxqqjRjH0CaqcZuWrzdI6RTulW4adn1IV5WFvIoBUK',
      posthogHost: 'https://us.i.posthog.com',
      posthogProjectId: '265038',
      posthogEnabled: true,
    },
    create: {
      id: 'default',
      posthogApiKey: 'phc_vMxqqjRjH0CaqcZuWrzdI6RTulW4adn1IV5WFvIoBUK',
      posthogHost: 'https://us.i.posthog.com',
      posthogProjectId: '265038',
      posthogEnabled: true,
    },
  })
  
  console.log('✅ PostHog-Config gespeichert!')
  console.log('API Key:', result.posthogApiKey?.substring(0, 15) + '...')
  console.log('Host:', result.posthogHost)
  console.log('Project ID:', result.posthogProjectId)
  console.log('Enabled:', result.posthogEnabled)
}

setPosthogConfig()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
