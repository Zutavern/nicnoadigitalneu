'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'

interface SectionProps {
  title: string
  children: React.ReactNode
}

const Section = ({ title, children }: SectionProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <ChevronDown
          className={`h-5 w-5 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pb-6 text-muted-foreground">{children}</div>
      </motion.div>
    </div>
  )
}

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-4xl font-bold">Datenschutzerklärung</h1>
        <p className="mb-8 text-muted-foreground">
          Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir
          verarbeiten Ihre Daten daher ausschließlich auf Grundlage der
          gesetzlichen Bestimmungen (DSGVO, TKG 2003).
        </p>

        <div className="space-y-4">
          <Section title="1. Verantwortlicher">
            <p>
              NICNOA & CO. DIGITAL<br />
              Musterstraße 123<br />
              12345 Berlin<br />
              Deutschland<br />
              E-Mail: info@nicnoa.de
            </p>
          </Section>

          <Section title="2. Erhebung und Verarbeitung von Daten">
            <p>
              Bei der Nutzung unserer Plattform werden verschiedene
              personenbezogene Daten erhoben. Personenbezogene Daten sind Daten,
              mit denen Sie persönlich identifiziert werden können. Diese
              Datenschutzerklärung erläutert, welche Daten wir erheben und wofür
              wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das
              geschieht.
            </p>
          </Section>

          <Section title="3. Ihre Rechte">
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
              gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger
              und den Zweck der Datenverarbeitung sowie ein Recht auf
              Berichtigung, Sperrung oder Löschung dieser Daten.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Recht auf Auskunft</li>
              <li>Recht auf Berichtigung</li>
              <li>Recht auf Löschung</li>
              <li>Recht auf Einschränkung der Verarbeitung</li>
              <li>Recht auf Datenübertragbarkeit</li>
              <li>Widerspruchsrecht</li>
            </ul>
          </Section>

          <Section title="4. Datensicherheit">
            <p>
              Wir verwenden innerhalb des Website-Besuchs das verbreitete
              SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils
              höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt
              wird. Ob eine einzelne Seite unseres Internetauftrittes
              verschlüsselt übertragen wird, erkennen Sie an der geschlossenen
              Darstellung des Schüssel- beziehungsweise Schloss-Symbols in der
              unteren Statusleiste Ihres Browsers.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              Unsere Website verwendet Cookies. Das sind kleine Textdateien, die
              es möglich machen, auf dem Endgerät des Nutzers spezifische, auf
              den Nutzer bezogene Informationen zu speichern, während er die
              Website nutzt. Cookies ermöglichen es, insbesondere
              Nutzungshäufigkeit und Nutzeranzahl der Seiten zu ermitteln,
              Verhaltensweisen der Seitennutzung zu analysieren, aber auch unser
              Angebot kundenfreundlicher zu gestalten.
            </p>
          </Section>

          <Section title="6. Analytische Tools">
            <p>
              Zur Verbesserung unseres Angebots und der Benutzerfreundlichkeit
              verwenden wir Analysedienste. Diese helfen uns zu verstehen, wie
              Besucher mit unserer Website interagieren. Alle gesammelten Daten
              werden anonymisiert verarbeitet.
            </p>
          </Section>

          <Section title="7. Kontaktformular">
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden
              Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
              angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den
              Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir
              nicht ohne Ihre Einwilligung weiter.
            </p>
          </Section>
        </div>

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h2 className="mb-4 text-xl font-semibold">Kontakt für Datenschutz</h2>
          <p className="text-muted-foreground">
            Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer
            personenbezogenen Daten, bei Auskünften, Berichtigung, Sperrung oder
            Löschung von Daten wenden Sie sich bitte an:
          </p>
          <p className="mt-4">
            E-Mail: datenschutz@nicnoa.de<br />
            Telefon: +49 (0) 123 456789
          </p>
        </div>
      </motion.div>
      </div>
      <Footer />
    </main>
  )
} 