'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prose prose-gray dark:prose-invert max-w-none"
      >
        <h1 className="mb-8 text-4xl font-bold">Impressum</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Angaben gemäß § 5 TMG</h2>
            <p className="text-muted-foreground">
              NICNOA&CO.online<br />
              Musterstraße 123<br />
              12345 Berlin<br />
              Deutschland
            </p>

            <h3 className="mt-6 text-xl font-semibold">Kontakt</h3>
            <p className="text-muted-foreground">
              Telefon: +49 (0) 123 456789<br />
              E-Mail: info@nicnoa.de
            </p>

            <h3 className="mt-6 text-xl font-semibold">Vertreten durch</h3>
            <p className="text-muted-foreground">
              Geschäftsführer: Max Mustermann
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Registereintrag</h2>
            <p className="text-muted-foreground">
              Eintragung im Handelsregister.<br />
              Registergericht: Amtsgericht Berlin<br />
              Registernummer: HRB 123456
            </p>

            <h3 className="mt-6 text-xl font-semibold">Umsatzsteuer-ID</h3>
            <p className="text-muted-foreground">
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
              DE 123 456 789
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="text-muted-foreground">
              Max Mustermann<br />
              NICNOA&CO.online<br />
              Musterstraße 123<br />
              12345 Berlin
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
            <p className="mt-4 text-muted-foreground">
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Haftung für Inhalte</h2>
            <p className="text-muted-foreground">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </main>
  )
} 