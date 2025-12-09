import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { UberUnsContent } from './uber-uns-content'

export const metadata: Metadata = {
  title: 'Über uns | nicnoa',
  description: 'Lernen Sie das Team hinter NICNOA&CO.online kennen - Experten für moderne Salon-Spaces',
}

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface AboutUsPageConfig {
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  team1Name: string
  team1Role: string
  team1Description: string
  team1ImageUrl: string | null
  team1LinkedInUrl: string
  team2Name: string
  team2Role: string
  team2Description: string
  team2ImageUrl: string | null
  team2LinkedInUrl: string
  visionBadgeText: string
  visionTitle: string
  visionDescription: string
  missionBadgeText: string
  missionTitle: string
  missionDescription: string
  approachTitle: string
  approachDescription: string
  whyTitle: string
  whyDescription: string
  whyButtonText: string
  whyButtonLink: string
}

interface ApproachCard {
  id: string
  title: string
  description: string
  iconName: string | null
  sortOrder: number
}

async function getAboutUsConfig(): Promise<AboutUsPageConfig> {
  const defaultConfig: AboutUsPageConfig = {
    heroBadgeText: 'Das Team hinter NICNOA&CO.online',
    heroTitle: 'Experten für moderne Salon-Spaces',
    heroDescription: 'Wir sind Daniel und Nico – zwei erfahrene Experten, die mit Leidenschaft die Zukunft des Salon-Managements gestalten. Mit unserer Expertise revolutionieren wir die Art und Weise, wie Salon-Spaces verwaltet werden.',
    team1Name: 'Daniel',
    team1Role: 'Co-Founder',
    team1Description: 'Mit über 20 Jahren Berufserfahrung in Produktentwicklung, Agilität, Daten-Analytics und als Tech- sowie Produkt-Lead hat Daniel bereits zahlreiche branchenübergreifende Projekte erfolgreich geleitet.',
    team1ImageUrl: null,
    team1LinkedInUrl: 'https://linkedin.com',
    team2Name: 'Nico',
    team2Role: 'Co-Founder',
    team2Description: 'Nico ist Industrie-Experte mit 15 Jahren Erfahrung im Wellness- und Beauty-Business und Betreiber von drei sehr erfolgreichen Coworking Spaces.',
    team2ImageUrl: null,
    team2LinkedInUrl: 'https://linkedin.com',
    visionBadgeText: 'Unsere Vision',
    visionTitle: 'Die Zukunft der Salon-Branche gestalten',
    visionDescription: 'Wir glauben an eine Zukunft, in der flexible Salon-Spaces und gemeinsame Ressourcen den Unternehmergeist in der Beauty-Branche beflügeln und nachhaltiges Wachstum fördern.',
    missionBadgeText: 'Unsere Mission',
    missionTitle: 'Innovativ & Effizient',
    missionDescription: 'Unser Antrieb ist es, innovative und effiziente Lösungen zu schaffen, die das Management von Salon-Spaces vereinfachen und die Zusammenarbeit in der Beauty-Branche fördern.',
    approachTitle: 'Unser Ansatz',
    approachDescription: 'Wie wir arbeiten und was uns auszeichnet',
    whyTitle: 'Warum wir tun, was wir tun',
    whyDescription: 'Wir sind fest davon überzeugt, dass moderne Salon-Spaces und intelligente Ressourcennutzung der Schlüssel zum Erfolg in der Beauty-Branche sind. Gemeinsam gestalten wir die Zukunft des Salon-Managements.',
    whyButtonText: 'Jetzt durchstarten',
    whyButtonLink: '/registrieren',
  }

  try {
    const config = await prisma.aboutUsPageConfig.findFirst()
    if (config) {
      return {
        heroBadgeText: config.heroBadgeText || defaultConfig.heroBadgeText,
        heroTitle: config.heroTitle || defaultConfig.heroTitle,
        heroDescription: config.heroDescription || defaultConfig.heroDescription,
        team1Name: config.team1Name || defaultConfig.team1Name,
        team1Role: config.team1Role || defaultConfig.team1Role,
        team1Description: config.team1Description || defaultConfig.team1Description,
        team1ImageUrl: config.team1ImageUrl || defaultConfig.team1ImageUrl,
        team1LinkedInUrl: config.team1LinkedInUrl || defaultConfig.team1LinkedInUrl,
        team2Name: config.team2Name || defaultConfig.team2Name,
        team2Role: config.team2Role || defaultConfig.team2Role,
        team2Description: config.team2Description || defaultConfig.team2Description,
        team2ImageUrl: config.team2ImageUrl || defaultConfig.team2ImageUrl,
        team2LinkedInUrl: config.team2LinkedInUrl || defaultConfig.team2LinkedInUrl,
        visionBadgeText: config.visionBadgeText || defaultConfig.visionBadgeText,
        visionTitle: config.visionTitle || defaultConfig.visionTitle,
        visionDescription: config.visionDescription || defaultConfig.visionDescription,
        missionBadgeText: config.missionBadgeText || defaultConfig.missionBadgeText,
        missionTitle: config.missionTitle || defaultConfig.missionTitle,
        missionDescription: config.missionDescription || defaultConfig.missionDescription,
        approachTitle: config.approachTitle || defaultConfig.approachTitle,
        approachDescription: config.approachDescription || defaultConfig.approachDescription,
        whyTitle: config.whyTitle || defaultConfig.whyTitle,
        whyDescription: config.whyDescription || defaultConfig.whyDescription,
        whyButtonText: config.whyButtonText || defaultConfig.whyButtonText,
        whyButtonLink: config.whyButtonLink || defaultConfig.whyButtonLink,
      }
    }
  } catch (error) {
    console.error('Error fetching about us config:', error)
  }

  return defaultConfig
}

async function getApproachCards(): Promise<ApproachCard[]> {
  try {
    const cards = await prisma.approachCard.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        iconName: true,
        sortOrder: true,
      },
    })

    return cards as ApproachCard[]
  } catch (error) {
    console.error('Error fetching approach cards:', error)
    return []
  }
}

export default async function UberUnsPage() {
  // Daten werden parallel auf dem Server geladen - kein Wasserfall!
  const [config, approachCards] = await Promise.all([
    getAboutUsConfig(),
    getApproachCards(),
  ])

  return <UberUnsContent config={config} approachCards={approachCards} />
}
