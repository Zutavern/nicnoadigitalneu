'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, FileText, Shield, Scale } from 'lucide-react'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'

type LegalPageType = 'IMPRESSUM' | 'DATENSCHUTZ' | 'AGB'

interface LegalSection {
  id: string
  title: string
  content: string
  sortOrder: number
  isActive: boolean
  isCollapsible: boolean
}

interface LegalPageConfig {
  pageType: LegalPageType
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  metaTitle: string | null
  metaDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  lastUpdated: string | null
  sections: LegalSection[]
}

interface CollapsibleSectionProps {
  title: string
  content: string
  isCollapsible: boolean
  index: number
}

const CollapsibleSection = ({ title, content, isCollapsible, index }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(!isCollapsible)

  // Konvertiere Markdown-ähnlichen Text in HTML-Elemente
  const formatContent = (text: string) => {
    // Ersetze **text** mit <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Ersetze Links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    return formatted
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      {isCollapsible ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-xl font-semibold">{title}</h2>
            <ChevronDown
              className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <motion.div
            initial={false}
            animate={{ height: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div 
              className="px-4 pb-4 text-muted-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          </motion.div>
        </>
      ) : (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-3">{title}</h2>
          <div 
            className="text-muted-foreground whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </div>
      )}
    </motion.div>
  )
}

const pageIcons = {
  IMPRESSUM: FileText,
  DATENSCHUTZ: Shield,
  AGB: Scale,
}

interface LegalPageContentProps {
  pageType: LegalPageType
}

export function LegalPageContent({ pageType }: LegalPageContentProps) {
  const [pageData, setPageData] = useState<LegalPageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const PageIcon = pageIcons[pageType]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/legal-page-config/${pageType.toLowerCase()}`)
        if (res.ok) {
          const data = await res.json()
          setPageData(data)
        } else {
          setError('Fehler beim Laden der Seite')
        }
      } catch (err) {
        console.error('Error fetching legal page:', err)
        setError('Fehler beim Laden der Seite')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pageType])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 py-12 pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !pageData) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="text-center py-16">
            <p className="text-muted-foreground">{error || 'Seite nicht gefunden'}</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const activeSections = pageData.sections?.filter((s) => s.isActive) || []

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <section className="text-center mb-12">
            {pageData.heroBadgeText && (
              <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-4">
                <PageIcon className="mr-1.5 h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">{pageData.heroBadgeText}</span>
              </span>
            )}
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {pageData.heroTitle}
            </h1>
            {pageData.heroDescription && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {pageData.heroDescription}
              </p>
            )}
          </section>

          {/* Content Sections */}
          <section className="space-y-4">
            {activeSections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Inhalte werden noch erstellt.</p>
              </div>
            ) : (
              activeSections.map((section, index) => (
                <CollapsibleSection
                  key={section.id}
                  title={section.title}
                  content={section.content}
                  isCollapsible={section.isCollapsible}
                  index={index}
                />
              ))
            )}
          </section>

          {/* Contact Section */}
          {(pageType === 'IMPRESSUM' || pageType === 'DATENSCHUTZ') &&
            (pageData.contactEmail || pageData.contactPhone) && (
              <section className="mt-12">
                <div className="rounded-lg bg-muted p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {pageType === 'DATENSCHUTZ' ? 'Kontakt für Datenschutz' : 'Kontakt'}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {pageType === 'DATENSCHUTZ'
                      ? 'Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten wenden Sie sich bitte an:'
                      : 'Bei Fragen wenden Sie sich bitte an:'}
                  </p>
                  <div className="space-y-1">
                    {pageData.contactEmail && (
                      <p>
                        E-Mail:{' '}
                        <a
                          href={`mailto:${pageData.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {pageData.contactEmail}
                        </a>
                      </p>
                    )}
                    {pageData.contactPhone && (
                      <p>
                        Telefon:{' '}
                        <a
                          href={`tel:${pageData.contactPhone.replace(/\s/g, '')}`}
                          className="text-primary hover:underline"
                        >
                          {pageData.contactPhone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

          {/* Last Updated */}
          {pageData.lastUpdated && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Stand: {new Date(pageData.lastUpdated).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </motion.div>
      </div>
      <Footer />
    </main>
  )
}
