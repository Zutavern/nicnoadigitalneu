'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Twitter, Linkedin } from 'lucide-react'

interface FooterConfig {
  footerDescription: string
  footerProductTitle: string
  footerCompanyTitle: string
  footerResourcesTitle: string
  footerFeaturesLabel: string
  footerPricingLabel: string
  footerRoadmapLabel: string
  footerUpdatesLabel: string
  footerBetaLabel: string
  footerAboutLabel: string
  footerPartnerLabel: string
  footerCareerLabel: string
  footerBlogLabel: string
  footerPressLabel: string
  footerDocsLabel: string
  footerSupportLabel: string
  footerApiLabel: string
  footerFaqLabel: string
  footerStatusLabel: string
  footerPrivacyLabel: string
  footerImprintLabel: string
  footerTermsLabel: string
  footerCopyright: string
}

const defaultConfig: FooterConfig = {
  footerDescription: 'Revolutionieren Sie die Art und Weise, wie Salon-Spaces verwaltet werden. Wir machen Coworking im Beauty-Bereich einfach, effizient und profitabel.',
  footerProductTitle: 'PRODUKT',
  footerCompanyTitle: 'UNTERNEHMEN',
  footerResourcesTitle: 'RESSOURCEN',
  footerFeaturesLabel: 'Features',
  footerPricingLabel: 'Preise',
  footerRoadmapLabel: 'Roadmap',
  footerUpdatesLabel: 'Updates',
  footerBetaLabel: 'Beta-Programm',
  footerAboutLabel: 'Über uns',
  footerPartnerLabel: 'Partner',
  footerCareerLabel: 'Karriere',
  footerBlogLabel: 'Blog',
  footerPressLabel: 'Presse',
  footerDocsLabel: 'Dokumentation',
  footerSupportLabel: 'Support',
  footerApiLabel: 'API',
  footerFaqLabel: 'FAQ',
  footerStatusLabel: 'Status',
  footerPrivacyLabel: 'Datenschutz',
  footerImprintLabel: 'Impressum',
  footerTermsLabel: 'AGB',
  footerCopyright: '© 2025 NICNOA&CO.online. Alle Rechte vorbehalten.',
}

export function Footer() {
  const [config, setConfig] = useState<FooterConfig>(defaultConfig)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/global-ui-config')
        if (res.ok) {
          const data = await res.json()
          setConfig({ ...defaultConfig, ...data })
        }
      } catch (error) {
        console.error('Failed to load footer config:', error)
      }
    }
    loadConfig()
  }, [])

  return (
    <footer className="border-t bg-background">
      <div className="container py-16">
        {/* Top Section */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">
                NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.footerDescription}
            </p>
            <div className="flex space-x-4">
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{config.footerProductTitle}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground">{config.footerFeaturesLabel}</Link></li>
              <li><Link href="/preise" className="hover:text-foreground">{config.footerPricingLabel}</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground">{config.footerRoadmapLabel}</Link></li>
              <li><Link href="/updates" className="hover:text-foreground">{config.footerUpdatesLabel}</Link></li>
              <li><Link href="/beta-programm" className="hover:text-foreground">{config.footerBetaLabel}</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{config.footerCompanyTitle}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/uber-uns" className="hover:text-foreground">{config.footerAboutLabel}</Link></li>
              <li><Link href="/partner" className="hover:text-foreground">{config.footerPartnerLabel}</Link></li>
              <li><Link href="/karriere" className="hover:text-foreground">{config.footerCareerLabel}</Link></li>
              <li><Link href="/blog" className="hover:text-foreground">{config.footerBlogLabel}</Link></li>
              <li><Link href="/presse" className="hover:text-foreground">{config.footerPressLabel}</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="font-medium">{config.footerResourcesTitle}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/dokumentation" className="hover:text-foreground">{config.footerDocsLabel}</Link></li>
              <li><Link href="/support" className="hover:text-foreground">{config.footerSupportLabel}</Link></li>
              <li><Link href="/api" className="hover:text-foreground">{config.footerApiLabel}</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">{config.footerFaqLabel}</Link></li>
              <li><Link href="/status" className="hover:text-foreground">{config.footerStatusLabel}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/datenschutz" className="hover:text-foreground">{config.footerPrivacyLabel}</Link>
            <Link href="/impressum" className="hover:text-foreground">{config.footerImprintLabel}</Link>
            <Link href="/agb" className="hover:text-foreground">{config.footerTermsLabel}</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {config.footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
