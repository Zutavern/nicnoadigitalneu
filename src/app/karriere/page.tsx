'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Code,
  Users,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Rocket,
  Heart,
  Palette,
  Target,
  Megaphone,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  slug: string
  category: string
  location: string
  type: string
  description: string
}

interface CareerConfig {
  glowEffectEnabled?: boolean
  glowEffectSpread?: number
  glowEffectProximity?: number
  glowEffectBorderWidth?: number
  glowUseDesignSystem?: boolean
  glowUseGradient?: boolean
  glowCustomPrimary?: string | null
  glowCustomSecondary?: string | null
}

const categories = [
  {
    value: 'IT-Development',
    label: 'IT & Development',
    icon: Code,
    color: 'blue',
  },
  {
    value: 'Design',
    label: 'Design',
    icon: Palette,
    color: 'pink',
  },
  {
    value: 'Product',
    label: 'Product',
    icon: Target,
    color: 'orange',
  },
  {
    value: 'Operations',
    label: 'Operations',
    icon: Users,
    color: 'green',
  },
  {
    value: 'Marketing',
    label: 'Marketing',
    icon: Megaphone,
    color: 'yellow',
  },
  {
    value: 'Sales',
    label: 'Sales',
    icon: TrendingUp,
    color: 'purple',
  },
]

export default function KarrierePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('IT-Development')
  const [config, setConfig] = useState<CareerConfig>({
    glowEffectEnabled: true,
    glowEffectSpread: 40,
    glowEffectProximity: 64,
    glowEffectBorderWidth: 3,
    glowUseDesignSystem: true,
    glowUseGradient: true,
  })

  useEffect(() => {
    fetchJobs()
    fetchConfig()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/career-page-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const getJobsByCategory = (category: string) => {
    return jobs.filter((job) => job.category === category)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-32 pb-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Wir suchen dich!</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Werde Teil unseres Teams
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Wir sind ein junges, dynamisches Startup in München und suchen talentierte Menschen, 
              die mit uns die Zukunft der Salon-Branche gestalten wollen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>München, Remote-First</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Coole Kultur</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span>Wachsendes Startup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">Warum NICNOA?</h2>
              <p className="text-muted-foreground mb-4">
                Wir sind ein junges Startup im Herzen von München, das die Salon-Branche revolutioniert. 
                Unser Büro ist schön, aber wir arbeiten hauptsächlich remote – flexibel, modern und effizient.
              </p>
              <p className="text-muted-foreground mb-4">
                Bei uns findest du eine super coole Kultur, flache Hierarchien und die Möglichkeit, 
                echten Impact zu haben. Wir glauben an Work-Life-Balance, persönliche Entwicklung 
                und daran, dass die beste Arbeit entsteht, wenn man Spaß daran hat.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Badge variant="secondary">Remote-First</Badge>
                <Badge variant="secondary">Flexible Arbeitszeiten</Badge>
                <Badge variant="secondary">Modernes Tech-Stack</Badge>
                <Badge variant="secondary">Team-Events</Badge>
                <Badge variant="secondary">Weiterbildung</Badge>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">100%</div>
                  <div className="text-muted-foreground">Remote-First</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Aktuelle Stellenangebote</h2>
            <p className="text-muted-foreground text-lg">
              Schau dir unsere offenen Positionen an und werde Teil unseres Teams
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8 h-auto gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const jobCount = getJobsByCategory(category.value).length
                  return (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                      {jobCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {jobCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {categories.map((category) => {
                const categoryJobs = getJobsByCategory(category.value)
                return (
                  <TabsContent key={category.value} value={category.value}>
                    {categoryJobs.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <p className="text-muted-foreground">
                            Derzeit keine offenen Stellen in dieser Kategorie.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {categoryJobs.map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                          >
                            <div className="relative h-full rounded-2xl">
                              {/* Outer container for glow effect */}
                              <div className="relative h-full rounded-[1.25rem] p-0.5 md:p-1">
                                <GlowingEffect
                                  spread={config.glowEffectSpread ?? 40}
                                  glow={config.glowEffectEnabled ?? true}
                                  disabled={!config.glowEffectEnabled}
                                  proximity={config.glowEffectProximity ?? 64}
                                  borderWidth={config.glowEffectBorderWidth ?? 3}
                                  glowColor={config.glowUseDesignSystem ? undefined : config.glowCustomPrimary || undefined}
                                  glowColorSecondary={config.glowUseDesignSystem ? undefined : config.glowCustomSecondary || undefined}
                                  useGradient={config.glowUseGradient ?? true}
                                />
                                <Card className="h-full hover:shadow-lg transition-shadow group flex flex-col bg-background/80 backdrop-blur-sm">
                                  <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                        {job.title}
                                      </h3>
                                      <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {job.location}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {job.type}
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                      {job.description.replace(/[#*]/g, '').substring(0, 150)}...
                                    </p>
                                    <Button asChild className="w-full group-hover:bg-primary/90 mt-auto">
                                      <Link href={`/karriere/${job.slug}`}>
                                        Mehr erfahren
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                      </Link>
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Nichts Passendes dabei?</h2>
            <p className="text-muted-foreground mb-6">
              Wir sind immer auf der Suche nach talentierten Menschen. 
              Schick uns einfach eine Initiativbewerbung!
            </p>
            <Button size="lg" asChild>
              <Link href="/karriere/initiativ">
                Initiativbewerbung senden
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


