import { prisma } from '../src/lib/prisma'

async function check() {
  const settings = await prisma.platformSettings.findFirst({
    select: {
      posthogApiKey: true,
      posthogPersonalApiKey: true,
      posthogHost: true,
      posthogProjectId: true,
      posthogEnabled: true,
    }
  });
  
  console.log('=== PostHog Konfiguration in DB ===');
  console.log('API Key (Client):', settings?.posthogApiKey ? settings.posthogApiKey.substring(0, 15) + '...' : 'NICHT GESETZT');
  console.log('Personal API Key:', settings?.posthogPersonalApiKey ? settings.posthogPersonalApiKey.substring(0, 15) + '...' : 'NICHT GESETZT');
  console.log('Host:', settings?.posthogHost || 'NICHT GESETZT');
  console.log('Project ID:', settings?.posthogProjectId || 'NICHT GESETZT');
  console.log('Enabled:', settings?.posthogEnabled);
}

check().catch(console.error);
