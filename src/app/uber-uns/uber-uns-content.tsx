'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Linkedin,
  Users,
  Lightbulb,
  ArrowRight,
  Target,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getIconComponent } from '@/lib/icon-mapping'

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

interface UberUnsContentProps {
  config: AboutUsPageConfig
  approachCards: ApproachCard[]
}

export function UberUnsContent({ config, approachCards }: UberUnsContentProps) {
  // Kacheln mit Icons filtern und sortieren
  const approaches = approachCards
    .filter((card) => card.iconName)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((card) => ({
      icon: getIconComponent(card.iconName),
      title: card.title,
      description: card.description,
    }))

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
            {config.heroBadgeText && (
              <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <Users className="mr-1 h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">{config.heroBadgeText}</span>
              </span>
            )}
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {config.heroTitle}
            </h1>
            {config.heroDescription && (
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {config.heroDescription}
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
              {config.team1ImageUrl ? (
                <Image
                  src={config.team1ImageUrl}
                  alt={config.team1Name || 'Team Member 1'}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              {config.team1Name && (
                <h2 className="text-2xl font-bold">{config.team1Name}</h2>
              )}
              {config.team1Role && (
                <span className="text-primary font-medium">{config.team1Role}</span>
              )}
              {config.team1Description && (
                <p className="mt-2 text-muted-foreground min-h-[100px]">
                  {config.team1Description}
                </p>
              )}
              {config.team1LinkedInUrl && (
                <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                  <a href={config.team1LinkedInUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    {config.team1Name} auf LinkedIn
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
              {config.team2ImageUrl ? (
                <Image
                  src={config.team2ImageUrl}
                  alt={config.team2Name || 'Team Member 2'}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              {config.team2Name && (
                <h2 className="text-2xl font-bold">{config.team2Name}</h2>
              )}
              {config.team2Role && (
                <span className="text-primary font-medium">{config.team2Role}</span>
              )}
              {config.team2Description && (
                <p className="mt-2 text-muted-foreground min-h-[100px]">
                  {config.team2Description}
                </p>
              )}
              {config.team2LinkedInUrl && (
                <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                  <a href={config.team2LinkedInUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    {config.team2Name} auf LinkedIn
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
              {config.visionBadgeText && (
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{config.visionBadgeText}</span>
                </div>
              )}
              {config.visionTitle && (
                <h2 className="text-3xl font-bold">{config.visionTitle}</h2>
              )}
              {config.visionDescription && (
                <p className="text-muted-foreground">
                  {config.visionDescription}
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
              {config.missionBadgeText && (
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{config.missionBadgeText}</span>
                </div>
              )}
              {config.missionTitle && (
                <h2 className="text-3xl font-bold">{config.missionTitle}</h2>
              )}
              {config.missionDescription && (
                <p className="text-muted-foreground">
                  {config.missionDescription}
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
          {config.approachTitle && (
            <h2 className="text-3xl font-bold">{config.approachTitle}</h2>
          )}
          {config.approachDescription && (
            <p className="mt-4 text-muted-foreground">
              {config.approachDescription}
            </p>
          )}
        </motion.div>
        {approaches.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Kacheln verfügbar</p>
          </div>
        )}
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
              {config.whyTitle && (
                <h2 className="text-3xl font-bold mb-4">
                  {config.whyTitle}
                </h2>
              )}
              {config.whyDescription && (
                <p className="text-muted-foreground mb-8">
                  {config.whyDescription}
                </p>
              )}
              {config.whyButtonText && (
                <Button size="lg" className="group" asChild>
                  <Link href={config.whyButtonLink || '/registrieren'}>
                    {config.whyButtonText}
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


