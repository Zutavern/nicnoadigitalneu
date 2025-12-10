'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Shield,
  Scale,
  ArrowRight,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const legalPages = [
  {
    title: 'Impressum',
    description: 'Pflichtangaben und Kontaktinformationen gemäß TMG',
    icon: FileText,
    href: '/admin/legal/impressum',
    color: 'blue',
    route: '/impressum',
  },
  {
    title: 'Datenschutz',
    description: 'Datenschutzerklärung gemäß DSGVO',
    icon: Shield,
    href: '/admin/legal/datenschutz',
    color: 'green',
    route: '/datenschutz',
  },
  {
    title: 'AGB',
    description: 'Allgemeine Geschäftsbedingungen',
    icon: Scale,
    href: '/admin/legal/agb',
    color: 'purple',
    route: '/agb',
  },
]

export default function LegalOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rechtliche Seiten</h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Impressum, Datenschutz und AGB
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {legalPages.map((page, index) => {
          const Icon = page.icon
          return (
            <motion.div
              key={page.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        page.color === 'blue'
                          ? 'bg-blue-500/10 text-blue-500'
                          : page.color === 'green'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-purple-500/10 text-purple-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button asChild className="flex-1">
                      <Link href={page.href}>
                        <Settings className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={page.route} target="_blank">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hinweise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Impressum:</strong> Enthält alle Pflichtangaben nach § 5 TMG
          </p>
          <p>
            • <strong>Datenschutz:</strong> Datenschutzerklärung gemäß DSGVO Art. 13/14
          </p>
          <p>
            • <strong>AGB:</strong> Allgemeine Geschäftsbedingungen für Ihre Dienste
          </p>
          <p className="mt-4 text-xs">
            Tipp: Jede Seite hat einen Split-Screen-Editor mit Live-Vorschau
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
