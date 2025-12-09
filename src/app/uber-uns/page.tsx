'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Linkedin,
  Users,
  ShieldCheck,
  Scaling,
  Lightbulb,
  ArrowRight,
  Rocket,
  Target,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  approach1Title: string
  approach1Description: string
  approach2Title: string
  approach2Description: string
  approach3Title: string
  approach3Description: string
  approach4Title: string
  approach4Description: string
  whyTitle: string
  whyDescription: string
  whyButtonText: string
  whyButtonLink: string
}

const approachIcons = [Target, ShieldCheck, Scaling, Sparkles]

export default function UberUnsPage() {
  const [config, setConfig] = useState<AboutUsPageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/about-us-page-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const pageConfig = config || {
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
    approach1Title: 'Praxisnah validiert',
    approach1Description: 'Wir haben unsere Konzepte zunächst offline getestet und bewiesen, dass sie in der realen Welt funktionieren – bevor wir sie digital skaliert haben.',
    approach2Title: 'Rechtssicherheit & Automatisierung',
    approach2Description: 'Automatisierte Verträge und integrierte Compliance-Standards schaffen Sicherheit bei allen Mietprozessen.',
    approach3Title: 'Skalierbarkeit & Flexibilität',
    approach3Description: 'Unsere Plattform passt sich an individuelle Anforderungen an, ob Einzelunternehmer, KMU oder Großunternehmen.',
    approach4Title: 'Benutzerfreundlichkeit',
    approach4Description: 'Ein intuitives Design und durchdachte Workflows machen die Verwaltung und Vermietung von Flächen so einfach wie möglich.',
    whyTitle: 'Warum wir tun, was wir tun',
    whyDescription: 'Wir sind fest davon überzeugt, dass moderne Salon-Spaces und intelligente Ressourcennutzung der Schlüssel zum Erfolg in der Beauty-Branche sind. Gemeinsam gestalten wir die Zukunft des Salon-Managements.',
    whyButtonText: 'Jetzt durchstarten',
    whyButtonLink: '/registrieren',
  }

  const approaches = [
    {
      icon: approachIcons[0],
      title: pageConfig.approach1Title,
      description: pageConfig.approach1Description,
    },
    {
      icon: approachIcons[1],
      title: pageConfig.approach2Title,
      description: pageConfig.approach2Description,
    },
    {
      icon: approachIcons[2],
      title: pageConfig.approach3Title,
      description: pageConfig.approach3Description,
    },
    {
      icon: approachIcons[3],
      title: pageConfig.approach4Title,
      description: pageConfig.approach4Description,
    },
  ].filter(a => a.title && a.description)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {pageConfig.heroBadgeText && (
              <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <Users className="mr-1 h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">{pageConfig.heroBadgeText}</span>
              </span>
            )}
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {pageConfig.heroTitle}
            </h1>
            {pageConfig.heroDescription && (
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {pageConfig.heroDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container py-16">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Daniel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              {pageConfig.team1ImageUrl ? (
                <Image
                  src={pageConfig.team1ImageUrl}
                  alt={pageConfig.team1Name || 'Team Member 1'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              {pageConfig.team1Name && (
                <h2 className="text-2xl font-bold">{pageConfig.team1Name}</h2>
              )}
              {pageConfig.team1Role && (
                <span className="text-primary font-medium">{pageConfig.team1Role}</span>
              )}
              {pageConfig.team1Description && (
                <p className="mt-2 text-muted-foreground min-h-[100px]">
                  {pageConfig.team1Description}
                </p>
              )}
              {pageConfig.team1LinkedInUrl && (
                <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                  <a href={pageConfig.team1LinkedInUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    {pageConfig.team1Name} auf LinkedIn
                  </a>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Nico */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              {pageConfig.team2ImageUrl ? (
                <Image
                  src={pageConfig.team2ImageUrl}
                  alt={pageConfig.team2Name || 'Team Member 2'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              {pageConfig.team2Name && (
                <h2 className="text-2xl font-bold">{pageConfig.team2Name}</h2>
              )}
              {pageConfig.team2Role && (
                <span className="text-primary font-medium">{pageConfig.team2Role}</span>
              )}
              {pageConfig.team2Description && (
                <p className="mt-2 text-muted-foreground min-h-[100px]">
                  {pageConfig.team2Description}
                </p>
              )}
              {pageConfig.team2LinkedInUrl && (
                <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                  <a href={pageConfig.team2LinkedInUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    {pageConfig.team2Name} auf LinkedIn
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="grid gap-16 md:grid-cols-2">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {pageConfig.visionBadgeText && (
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{pageConfig.visionBadgeText}</span>
                </div>
              )}
              {pageConfig.visionTitle && (
                <h2 className="text-3xl font-bold">{pageConfig.visionTitle}</h2>
              )}
              {pageConfig.visionDescription && (
                <p className="text-muted-foreground">
                  {pageConfig.visionDescription}
                </p>
              )}
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {pageConfig.missionBadgeText && (
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{pageConfig.missionBadgeText}</span>
                </div>
              )}
              {pageConfig.missionTitle && (
                <h2 className="text-3xl font-bold">{pageConfig.missionTitle}</h2>
              )}
              {pageConfig.missionDescription && (
                <p className="text-muted-foreground">
                  {pageConfig.missionDescription}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {pageConfig.approachTitle && (
            <h2 className="text-3xl font-bold">{pageConfig.approachTitle}</h2>
          )}
          {pageConfig.approachDescription && (
            <p className="mt-4 text-muted-foreground">
              {pageConfig.approachDescription}
            </p>
          )}
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                  <approach.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-tight">{approach.title}</h3>
                  <p className="text-sm text-muted-foreground">{approach.description}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {pageConfig.whyTitle && (
                <h2 className="text-3xl font-bold mb-4">
                  {pageConfig.whyTitle}
                </h2>
              )}
              {pageConfig.whyDescription && (
                <p className="text-muted-foreground mb-8">
                  {pageConfig.whyDescription}
                </p>
              )}
              {pageConfig.whyButtonText && (
                <Button size="lg" className="group" asChild>
                  <Link href={pageConfig.whyButtonLink || '/registrieren'}>
                    {pageConfig.whyButtonText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 