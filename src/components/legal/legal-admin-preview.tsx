'use client'

import { motion } from 'framer-motion'
import { FileText, Shield, Scale, ChevronDown } from 'lucide-react'
import { useState } from 'react'

type LegalPageType = 'IMPRESSUM' | 'DATENSCHUTZ' | 'AGB'

interface LegalSection {
  id: string
  title: string
  content: string
  isActive: boolean
  isCollapsible: boolean
}

interface LegalPageConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  contactEmail?: string | null
  contactPhone?: string | null
}

interface LegalAdminPreviewProps {
  pageType: LegalPageType
  config: LegalPageConfig
  sections: LegalSection[]
}

const pageTypeConfig = {
  IMPRESSUM: {
    label: 'Impressum',
    icon: FileText,
  },
  DATENSCHUTZ: {
    label: 'Datenschutz',
    icon: Shield,
  },
  AGB: {
    label: 'AGB',
    icon: Scale,
  },
}

export function LegalAdminPreview({ pageType, config, sections }: LegalAdminPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const PageIcon = pageTypeConfig[pageType].icon
  const activeSections = sections.filter((s) => s.isActive)

  const toggleSectionExpanded = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="p-6 bg-background">
      {/* Hero Section */}
      <section className="py-8 text-center border-b mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {config.heroBadgeText && (
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-4">
              <PageIcon className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{config.heroBadgeText}</span>
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {config.heroTitle || pageTypeConfig[pageType].label}
          </h1>
          {config.heroDescription && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {config.heroDescription}
            </p>
          )}
        </motion.div>
      </section>

      {/* Sections */}
      <section className="max-w-3xl mx-auto space-y-4">
        {activeSections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <PageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keine aktiven Abschnitte vorhanden</p>
            <p className="text-sm mt-1">Erstellen Sie Abschnitte im Editor links</p>
          </div>
        ) : (
          activeSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg overflow-hidden"
            >
              {section.isCollapsible ? (
                <>
                  <button
                    onClick={() => toggleSectionExpanded(section.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        expandedSections.has(section.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4"
                    >
                      <div 
                        className="legal-content"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                  <div 
                    className="legal-content"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              )}
            </motion.div>
          ))
        )}
      </section>

      {/* Contact Section */}
      {(pageType === 'IMPRESSUM' || pageType === 'DATENSCHUTZ') &&
        (config.contactEmail || config.contactPhone) && (
          <section className="mt-8 max-w-3xl mx-auto">
            <div className="rounded-lg bg-muted p-6">
              <h2 className="text-lg font-semibold mb-3">
                {pageType === 'DATENSCHUTZ' ? 'Kontakt für Datenschutz' : 'Kontakt'}
              </h2>
              <p className="text-muted-foreground text-sm mb-3">
                Bei Fragen wenden Sie sich bitte an:
              </p>
              <div className="space-y-1 text-sm">
                {config.contactEmail && (
                  <p>E-Mail: <span className="text-primary">{config.contactEmail}</span></p>
                )}
                {config.contactPhone && (
                  <p>Telefon: {config.contactPhone}</p>
                )}
              </div>
            </div>
          </section>
        )}
    </div>
  )
}

export default LegalAdminPreview
