'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Newspaper,
  ExternalLink,
  Calendar,
  Star,
  ArrowRight,
  Download,
  Mail,
  Phone,
  User,
  TrendingUp,
  Award,
  Loader2,
  Sparkles,
  FileText,
  Quote,
  Globe,
  ChevronRight,
  BookOpen,
  Mic,
  Megaphone,
} from 'lucide-react'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface PressArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  source: string
  sourceUrl: string
  sourceLogo: string | null
  coverImage: string | null
  publishedAt: string
  category: string
  isFeatured: boolean
}

interface PressPageConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  showStats: boolean
  stat1Label: string | null
  stat1Value: string | null
  stat2Label: string | null
  stat2Value: string | null
  stat3Label: string | null
  stat3Value: string | null
  showPressKit: boolean
  pressKitTitle: string | null
  pressKitDescription: string | null
  pressKitDownloadUrl: string | null
  contactTitle: string | null
  contactDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactPerson: string | null
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  news: { label: 'Nachrichten', icon: Newspaper, color: 'bg-primary/10 text-primary border-primary/20' },
  feature: { label: 'Feature', icon: BookOpen, color: 'bg-primary/10 text-primary border-primary/20' },
  interview: { label: 'Interview', icon: Mic, color: 'bg-primary/10 text-primary border-primary/20' },
  announcement: { label: 'Ankündigung', icon: Megaphone, color: 'bg-primary/10 text-primary border-primary/20' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PressePage() {
  const [articles, setArticles] = useState<PressArticle[]>([])
  const [config, setConfig] = useState<PressPageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [articlesRes, configRes] = await Promise.all([
        fetch('/api/press'),
        fetch('/api/press-page-config'),
      ])

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json()
        setArticles(articlesData)
      }

      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredArticles =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const featuredArticles = articles.filter((a) => a.isFeatured)

  // Statistiken
  const stats = [
    { label: config?.stat1Label, value: config?.stat1Value, icon: Newspaper },
    { label: config?.stat2Label, value: config?.stat2Value, icon: TrendingUp },
    { label: config?.stat3Label, value: config?.stat3Value, icon: Award },
  ].filter((s) => s.label && s.value)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Presse-Bereich...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />

      {/* Hero Section - Dunkles Design */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Premium Dark Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-background">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Gradient Orbs */}
          <div 
            className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse"
            style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }}
          />
          <div 
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[130px] animate-pulse"
            style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', animationDelay: '1s' }}
          />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            {config?.heroBadgeText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
                style={{
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  borderWidth: '1px',
                  borderColor: 'hsl(var(--primary) / 0.2)',
                }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{config.heroBadgeText}</span>
              </motion.div>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
              {config?.heroTitle || 'NICNOA in den Medien'}
            </h1>

            {/* Description */}
            {config?.heroDescription && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                {config.heroDescription}
              </motion.p>
            )}

            {/* Stats */}
            {config?.showStats && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center gap-8 md:gap-16"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="text-center group"
                  >
                    <div 
                      className="mb-3 mx-auto w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: 'hsl(var(--primary) / 0.2)',
                        borderWidth: '1px',
                        borderColor: 'hsl(var(--primary) / 0.3)'
                      }}
                    >
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-20 relative bg-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: 'hsl(var(--primary) / 0.15)',
                    borderWidth: '1px',
                    borderColor: 'hsl(var(--primary) / 0.2)'
                  }}
                >
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Highlights</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ausgewählte Artikel</h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {featuredArticles.slice(0, 3).map((article) => {
                const catConfig = categoryConfig[article.category] || categoryConfig.news
                const CategoryIcon = catConfig.icon

                return (
                  <motion.div key={article.id} variants={itemVariants}>
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block h-full"
                    >
                      <Card className="h-full overflow-hidden bg-card/50 border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                        {/* Cover Image */}
                        <div className="relative h-56 overflow-hidden bg-muted">
                          {article.coverImage ? (
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Newspaper className="h-16 w-16 text-primary/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Featured Badge */}
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                              <Star className="w-3 h-3 mr-1.5 fill-current" />
                              Featured
                            </Badge>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className={`${catConfig.color} backdrop-blur-sm`}>
                              <CategoryIcon className="w-3 h-3 mr-1.5" />
                              {catConfig.label}
                            </Badge>
                          </div>

                          {/* Source */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-2">
                              {article.sourceLogo ? (
                                <Image
                                  src={article.sourceLogo}
                                  alt={article.source}
                                  width={24}
                                  height={24}
                                  className="rounded bg-white p-0.5"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                                  <Globe className="w-3.5 h-3.5 text-white/70" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-white/90">{article.source}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 text-foreground">
                            {article.title}
                          </h3>
                          
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                              {article.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatShortDate(article.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                              Artikel lesen
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'hsl(var(--primary) / 0.15)',
                      borderWidth: '1px',
                      borderColor: 'hsl(var(--primary) / 0.2)'
                    }}
                  >
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Archiv</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Alle Presse-Artikel</h2>
              </div>

              {/* Category Filter - Modernere Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeCategory === 'all'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Alle
                </button>
                {Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeCategory === key
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <Newspaper className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Keine Artikel gefunden</h3>
              <p className="text-muted-foreground">
                In dieser Kategorie gibt es noch keine Artikel.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {filteredArticles.map((article) => {
                const catConfig = categoryConfig[article.category] || categoryConfig.news
                const CategoryIcon = catConfig.icon

                return (
                  <motion.div key={article.id} variants={itemVariants}>
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                        <CardContent className="p-0">
                          <div className="flex items-stretch">
                            {/* Thumbnail */}
                            <div className="relative w-48 shrink-0 hidden md:block bg-muted">
                              {article.coverImage ? (
                                <Image
                                  src={article.coverImage}
                                  alt={article.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Newspaper className="h-8 w-8 text-primary/30" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  {/* Badges */}
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <Badge variant="outline" className={catConfig.color}>
                                      <CategoryIcon className="w-3 h-3 mr-1.5" />
                                      {catConfig.label}
                                    </Badge>
                                    {article.isFeatured && (
                                      <Badge className="bg-primary/10 text-primary border-primary/20">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        Featured
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors text-foreground">
                                    {article.title}
                                  </h3>

                                  {/* Excerpt */}
                                  {article.excerpt && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                      {article.excerpt}
                                    </p>
                                  )}

                                  {/* Meta */}
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                      {article.sourceLogo ? (
                                        <Image
                                          src={article.sourceLogo}
                                          alt={article.source}
                                          width={16}
                                          height={16}
                                          className="rounded"
                                        />
                                      ) : (
                                        <Globe className="w-4 h-4" />
                                      )}
                                      {article.source}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4" />
                                      {formatShortDate(article.publishedAt)}
                                    </span>
                                  </div>
                                </div>

                                {/* CTA */}
                                <div className="shrink-0 hidden lg:flex items-center">
                                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <span className="text-sm font-medium">Lesen</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Press Kit & Contact Section */}
      {(config?.showPressKit || config?.contactEmail || config?.contactPhone || config?.contactPerson) && (
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Für Medienvertreter</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ressourcen & Kontakt</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Alles was Sie für Ihre Berichterstattung über NICNOA benötigen
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
              {/* Press Kit Card */}
              {config?.showPressKit && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="h-full overflow-hidden bg-card/50 border-primary/10 hover:border-primary/30 transition-colors duration-500 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div 
                          className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-primary"
                        >
                          <Download className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {config.pressKitTitle || 'Presse-Kit'}
                          </h3>
                          {config.pressKitDescription && (
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                              {config.pressKitDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-3 mb-6">
                        {[
                          'Logo in verschiedenen Formaten (SVG, PNG)',
                          'Hochauflösende Produktbilder',
                          'Unternehmensprofil & Factsheet',
                          'Gründer-Biografien & Fotos',
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                              <ChevronRight className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>

                      {config.pressKitDownloadUrl && (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                          size="lg"
                          asChild
                        >
                          <a href={config.pressKitDownloadUrl} download>
                            <Download className="mr-2 h-5 w-5" />
                            Presse-Kit herunterladen
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Contact Card */}
              {(config?.contactEmail || config?.contactPhone || config?.contactPerson) && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="h-full overflow-hidden bg-card/50 border-primary/10 hover:border-primary/30 transition-colors duration-500 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-primary">
                          <Mail className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {config?.contactTitle || 'Presse-Kontakt'}
                          </h3>
                          {config?.contactDescription && (
                            <p className="text-muted-foreground leading-relaxed">
                              {config.contactDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-5">
                        {/* Contact Person */}
                        {config?.contactPerson && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Ansprechpartner</p>
                              <p className="font-semibold text-foreground">{config.contactPerson}</p>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        {config?.contactEmail && (
                          <a
                            href={`mailto:${config.contactEmail}`}
                            className="flex items-center gap-4 group"
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 group-hover:scale-110 transition-transform">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">E-Mail</p>
                              <p className="font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                {config.contactEmail}
                              </p>
                            </div>
                          </a>
                        )}

                        {/* Phone */}
                        {config?.contactPhone && (
                          <a
                            href={`tel:${config.contactPhone.replace(/\s/g, '')}`}
                            className="flex items-center gap-4 group"
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 group-hover:scale-110 transition-transform">
                              <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Telefon</p>
                              <p className="font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                {config.contactPhone}
                              </p>
                            </div>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Premium Background with Primary Color */}
        <div className="absolute inset-0 bg-primary">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] bg-white/10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] bg-white/10" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
              <Quote className="h-4 w-4" />
              <span className="text-sm font-medium">Medienpartnerschaften</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Sie möchten über NICNOA berichten?
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              Wir freuen uns über Ihr Interesse und unterstützen Sie gerne mit Informationen, 
              Interviews und exklusiven Einblicken.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {config?.contactEmail && (
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8"
                  asChild
                >
                  <a href={`mailto:${config.contactEmail}`}>
                    <Mail className="mr-2 h-5 w-5" />
                    Kontakt aufnehmen
                  </a>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8"
                asChild
              >
                <Link href="/ueber-uns">
                  Mehr über NICNOA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
