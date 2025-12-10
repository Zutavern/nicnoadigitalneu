'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Clock,
  CreditCard,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Target,
  Lock,
  Bell,
  FileText,
  Globe,
  Layers,
  Package,
  CheckCircle2,
  Star,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { HeroCarousel } from '@/components/sections/hero-carousel'
import { type CategoryAnimationData } from '@/components/sections/category-showcase'

// Icon Mapping - alle verfügbaren Icons
const iconMap: Record<string, React.ElementType> = {
  Calendar,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  CreditCard,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Target,
  Lock,
  Bell,
  FileText,
  Globe,
  Layers,
  Package,
  CheckCircle2,
  Star,
  // Alias für Kompatibilität
  'check-circle-2': CheckCircle2,
  'bar-chart-3': BarChart3,
  'credit-card': CreditCard,
  'message-square': MessageSquare,
}

const categoryLabels: Record<string, string> = {
  core: 'Kernfunktionen',
  communication: 'Kommunikation',
  analytics: 'Analytics & Berichte',
  security: 'Sicherheit & Compliance',
  automation: 'Automatisierung',
}

interface ProductFeature {
  id: string
  title: string
  description: string
  iconName: string
  category: string
  isActive: boolean
  isHighlight: boolean
  sortOrder: number
}

interface ProductPageConfig {
  heroType: string
  heroLayout: string
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroImageOverlay: number
  heroVideoUrl: string | null
  heroAnimationCode: string | null
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText: string | null
  ctaSecondaryLink: string | null
  showSecondaryCta: boolean
  showTrustIndicators: boolean
  trustIndicator1: string | null
  trustIndicator2: string | null
  trustIndicator3: string | null
  animationEnabled: boolean
  particlesEnabled: boolean
  showDashboardPreview: boolean
  useDesignSystemColors: boolean
  animationPrimaryColor: string | null
  animationSecondaryColor: string | null
  animationAccentColor: string | null
  dashboardTitle: string | null
  dashboardSubtitle: string | null
  showScrollIndicator: boolean
  scrollTargetId: string | null
  featuresSectionTitle: string | null
  featuresSectionDescription: string | null
  showFeatureCategories: boolean
  bottomCtaTitle: string | null
  bottomCtaDescription: string | null
  bottomCtaButtonText: string | null
  bottomCtaButtonLink: string | null
  // Category Showcase
  showCategoryShowcase?: boolean
  categoryShowcaseTitle?: string | null
  categoryShowcaseSubtitle?: string | null
  autoPlayEnabled?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
}

// Fallback Config
const fallbackConfig: ProductPageConfig = {
  heroType: 'animated',
  heroLayout: 'split',
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageOverlay: 40,
  heroVideoUrl: null,
  heroAnimationCode: null,
  heroBadgeText: 'Die All-in-One Plattform',
  heroTitle: 'Alles was Ihr Salon-Space braucht',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Eine Plattform für Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics. Entwickelt von Salon-Experten für Salon-Experten.',
  ctaPrimaryText: 'Kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaSecondaryText: 'Preise ansehen',
  ctaSecondaryLink: '/preise',
  showSecondaryCta: true,
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  animationEnabled: true,
  particlesEnabled: true,
  showDashboardPreview: true,
  useDesignSystemColors: true,
  animationPrimaryColor: null,
  animationSecondaryColor: null,
  animationAccentColor: null,
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Produkt Overview',
  showScrollIndicator: true,
  scrollTargetId: 'features',
  featuresSectionTitle: 'Unsere Features',
  featuresSectionDescription: 'Entdecken Sie alle Funktionen, die NICNOA zu Ihrer idealen Lösung machen.',
  showFeatureCategories: true,
  bottomCtaTitle: 'Bereit für die Zukunft Ihres Salons?',
  bottomCtaDescription: 'Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.',
  bottomCtaButtonText: 'Jetzt kostenlos testen',
  bottomCtaButtonLink: '/registrieren',
}

// Fallback Features
const fallbackFeatures: ProductFeature[] = [
  { id: '1', title: 'Digitale Terminbuchung', description: 'Ihre Kunden buchen 24/7 online. Automatische Bestätigungen und Erinnerungen reduzieren No-Shows um bis zu 80%.', iconName: 'Calendar', category: 'core', isActive: true, isHighlight: true, sortOrder: 1 },
  { id: '2', title: 'Team & Stuhlverwaltung', description: 'Verwalten Sie Ihre Mitarbeiter, Stuhlmieter und deren Verfügbarkeiten zentral.', iconName: 'Users', category: 'core', isActive: true, isHighlight: false, sortOrder: 2 },
]

export default function ProduktPage() {
  const [features, setFeatures] = useState<ProductFeature[]>(fallbackFeatures)
  const [config, setConfig] = useState<ProductPageConfig>(fallbackConfig)
  const [categoryAnimations, setCategoryAnimations] = useState<CategoryAnimationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuresRes, configRes, animationsRes] = await Promise.all([
          fetch('/api/product-features'),
          fetch('/api/product-page-config'),
          fetch('/api/category-animations'),
        ])

        if (featuresRes.ok) {
          const featuresData = await featuresRes.json()
          if (featuresData.length > 0) {
            setFeatures(featuresData)
          }
        }

        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig({ ...fallbackConfig, ...configData })
        }

        if (animationsRes.ok) {
          const animationsData = await animationsRes.json()
          setCategoryAnimations(animationsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Package
  }

  // Farben-Helper - nutzt CSS Variablen oder Custom Colors
  const getPrimaryColor = () => {
    if (!config.useDesignSystemColors && config.animationPrimaryColor) {
      return config.animationPrimaryColor
    }
    return 'hsl(var(--primary))'
  }

  const getSecondaryColor = () => {
    if (!config.useDesignSystemColors && config.animationSecondaryColor) {
      return config.animationSecondaryColor
    }
    return 'hsl(var(--secondary))'
  }

  const getAccentColor = () => {
    if (!config.useDesignSystemColors && config.animationAccentColor) {
      return config.animationAccentColor
    }
    return 'hsl(var(--accent))'
  }

  // Kategorien aus Features extrahieren
  const categories = config.showFeatureCategories 
    ? [...new Set(features.map(f => f.category))]
    : []

  const filteredFeatures = activeCategory === 'all'
    ? features
    : features.filter(f => f.category === activeCategory)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Carousel - Main Hero + Category Animations */}
      <HeroCarousel
        heroBadgeText={config.heroBadgeText}
        heroTitle={config.heroTitle}
        heroTitleHighlight={config.heroTitleHighlight}
        heroDescription={config.heroDescription}
        ctaPrimaryText={config.ctaPrimaryText}
        ctaPrimaryLink={config.ctaPrimaryLink}
        ctaSecondaryText={config.ctaSecondaryText}
        ctaSecondaryLink={config.ctaSecondaryLink}
        showSecondaryCta={config.showSecondaryCta}
        showTrustIndicators={config.showTrustIndicators}
        trustIndicator1={config.trustIndicator1}
        trustIndicator2={config.trustIndicator2}
        trustIndicator3={config.trustIndicator3}
        animationEnabled={config.animationEnabled}
        particlesEnabled={config.particlesEnabled}
        showDashboardPreview={config.showDashboardPreview}
        dashboardTitle={config.dashboardTitle}
        primaryColor={getPrimaryColor()}
        secondaryColor={getSecondaryColor()}
        accentColor={getAccentColor()}
        categoryAnimations={categoryAnimations}
        autoPlayInterval={config.autoPlayInterval ?? 5000}
        showDots={config.showDots ?? true}
        showArrows={config.showArrows ?? true}
        onCategoryChange={(categoryKey, isManual) => {
          // Nur bei manuellem Klick die Feature-Kategorie synchronisieren
          if (isManual && categoryKey) {
            setActiveCategory(categoryKey)
          }
        }}
      />

      {/* Features Section */}
      <section id={config.scrollTargetId || 'features'} className="container pt-2 pb-12">
        {/* Section Header */}
        {(config.featuresSectionTitle || config.featuresSectionDescription) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            {config.featuresSectionTitle && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{config.featuresSectionTitle}</h2>
            )}
            {config.featuresSectionDescription && (
              <p className="text-muted-foreground max-w-2xl mx-auto">{config.featuresSectionDescription}</p>
            )}
          </motion.div>
        )}

        {/* Category Filter */}
        {config.showFeatureCategories && categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex p-1.5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Alle
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature, index) => {
            const IconComponent = getIconComponent(feature.iconName)
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                {/* Outer container for glow effect */}
                <div className={`group relative h-full rounded-2xl transition-all hover:shadow-lg ${
                  feature.isHighlight ? 'ring-1 ring-primary/10' : ''
                }`}>
                  {/* Glowing Effect - Follows mouse cursor, uses design system colors */}
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
                  
                  {/* Inner content container */}
                  <div className={`relative h-full rounded-2xl border bg-card/80 backdrop-blur-sm p-6 ${
                    feature.isHighlight ? 'border-primary/20' : 'border-border/50'
                  }`}>
                    {feature.isHighlight && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Highlight
                        </Badge>
                      </div>
                    )}
                    
                    <div
                      className="mb-4 inline-flex rounded-lg p-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${getPrimaryColor()}15` }}
                    >
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    
                    <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    
                    {config.showFeatureCategories && (
                      <Badge variant="outline" className="mt-4 text-xs">
                        {categoryLabels[feature.category] || feature.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">
              {config.bottomCtaTitle}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {config.bottomCtaDescription}
            </p>
            <Link href={config.bottomCtaButtonLink || '/registrieren'}>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {config.bottomCtaButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
