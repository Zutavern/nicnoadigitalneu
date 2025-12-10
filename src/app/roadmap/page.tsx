'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'

interface RoadmapConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  showCta: boolean
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
}

interface RoadmapItem {
  id: string
  quarter: string
  title: string
  description: string
  icon: string
  status: string
  statusColor: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
}

// Dynamic Icon Component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  // Mapping von icon names zu Lucide components
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    sparkles: LucideIcons.Sparkles,
    smartphone: LucideIcons.Smartphone,
    brain: LucideIcons.Brain,
    share2: LucideIcons.Share2,
    layout: LucideIcons.Layout,
    calendar: LucideIcons.Calendar,
    rocket: LucideIcons.Rocket,
    target: LucideIcons.Target,
    zap: LucideIcons.Zap,
    shield: LucideIcons.Shield,
    users: LucideIcons.Users,
    barChart: LucideIcons.BarChart,
    globe: LucideIcons.Globe,
    settings: LucideIcons.Settings,
    bell: LucideIcons.Bell,
    megaphone: LucideIcons.Megaphone,
  }
  
  const IconComponent = iconMap[name] || LucideIcons.Sparkles
  return <IconComponent className={className} />
}

export default function RoadmapPage() {
  const [config, setConfig] = useState<RoadmapConfig | null>(null)
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, itemsRes] = await Promise.all([
          fetch('/api/roadmap-config'),
          fetch('/api/roadmap-items'),
        ])
        
        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig(configData)
        }
        
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setItems(itemsData)
        }
      } catch (error) {
        console.error('Error fetching roadmap data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Render title with highlight
  const renderTitle = () => {
    if (!config) return null
    
    if (config.heroTitleHighlight && config.heroTitle.includes(config.heroTitleHighlight)) {
      const parts = config.heroTitle.split(config.heroTitleHighlight)
      return (
        <>
          {parts[0]}
          <span className="text-primary">{config.heroTitleHighlight}</span>
          {parts[1]}
        </>
      )
    }
    
    return config.heroTitle
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="container py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {config?.heroBadgeText && (
              <Badge 
                variant="outline" 
                className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5"
              >
                <LucideIcons.Sparkles className="mr-2 h-4 w-4" />
                {config.heroBadgeText}
              </Badge>
            )}
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {renderTitle()}
            </h1>
            
            {config?.heroDescription && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {config.heroDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="container pb-16">
        {items.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <div className="rounded-xl border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {item.quarter}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <DynamicIcon name={item.icon} className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                      </div>
                      <p className="mt-4 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Point */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-lg md:mx-auto">
                    <div className="h-4 w-4 rounded-full bg-primary" />
                  </div>

                  {/* Empty Space for Layout */}
                  <div className="hidden flex-1 md:block" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <LucideIcons.MapIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Roadmap wird bald verfügbar sein.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      {config?.showCta && (
        <section className="border-t bg-muted/50">
          <div className="container py-16">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {config.ctaTitle && (
                  <h2 className="mb-4 text-3xl font-bold">
                    {config.ctaTitle}
                  </h2>
                )}
                {config.ctaDescription && (
                  <p className="mb-8 text-muted-foreground">
                    {config.ctaDescription}
                  </p>
                )}
                {config.ctaButtonText && (
                  <Link href={config.ctaButtonLink || '/beta-programm'}>
                    <Button size="lg" className="group">
                      {config.ctaButtonText}
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
