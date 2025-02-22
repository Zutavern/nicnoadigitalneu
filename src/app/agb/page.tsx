'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

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

export default function AGBPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-4xl font-bold">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="mb-8 text-muted-foreground">
          Stand: Februar 2024
        </p>

        <div className="space-y-4">
          <Section title="§1 Geltungsbereich">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
              Geschäftsbeziehungen zwischen NICNOA & CO. DIGITAL (nachfolgend
              "Anbieter") und seinen Kunden (nachfolgend "Nutzer"). Die AGB
              regeln insbesondere die Nutzung der digitalen Plattform zur
              Verwaltung von Salon-Coworking-Spaces.
            </p>
          </Section>

          <Section title="§2 Vertragsgegenstand">
            <p>
              Der Anbieter stellt eine digitale Plattform zur Verfügung, die es
              Nutzern ermöglicht, Salon-Coworking-Spaces zu verwalten,
              einschließlich der Buchung, Abrechnung und Verwaltung von
              Arbeitsplätzen. Die genauen Leistungsmerkmale ergeben sich aus der
              jeweiligen Produktbeschreibung.
            </p>
          </Section>

          <Section title="§3 Vertragsschluss">
            <p>
              Der Vertrag kommt durch die Registrierung des Nutzers auf der
              Plattform und die Annahme durch den Anbieter zustande. Der Anbieter
              behält sich das Recht vor, Registrierungen ohne Angabe von Gründen
              abzulehnen.
            </p>
          </Section>

          <Section title="§4 Pflichten des Nutzers">
            <p>
              Der Nutzer verpflichtet sich:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Wahrheitsgemäße und vollständige Angaben bei der Registrierung zu machen</li>
              <li>Seine Zugangsdaten geheim zu halten und vor Missbrauch zu schützen</li>
              <li>Die Plattform nur im Rahmen der geltenden Gesetze zu nutzen</li>
              <li>Keine Rechte Dritter zu verletzen</li>
              <li>Die vereinbarten Entgelte fristgerecht zu zahlen</li>
            </ul>
          </Section>

          <Section title="§5 Preise und Zahlungsbedingungen">
            <p>
              Die Preise für die Nutzung der Plattform richten sich nach der
              jeweils aktuellen Preisliste. Alle Preise verstehen sich zzgl. der
              gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt per
              Lastschriftverfahren oder Kreditkarte.
            </p>
          </Section>

          <Section title="§6 Laufzeit und Kündigung">
            <p>
              Der Vertrag wird auf unbestimmte Zeit geschlossen und kann von
              beiden Seiten mit einer Frist von 30 Tagen zum Monatsende gekündigt
              werden. Das Recht zur außerordentlichen Kündigung aus wichtigem
              Grund bleibt unberührt.
            </p>
          </Section>

          <Section title="§7 Gewährleistung und Haftung">
            <p>
              Der Anbieter gewährleistet eine Verfügbarkeit der Plattform von
              99% im Jahresmittel. Die Haftung des Anbieters ist auf Vorsatz und
              grobe Fahrlässigkeit beschränkt. Dies gilt nicht für die Verletzung
              von Leben, Körper und Gesundheit.
            </p>
          </Section>

          <Section title="§8 Datenschutz">
            <p>
              Der Anbieter verarbeitet personenbezogene Daten der Nutzer gemäß
              der Datenschutzerklärung und unter Beachtung der geltenden
              Datenschutzgesetze.
            </p>
          </Section>

          <Section title="§9 Änderungen der AGB">
            <p>
              Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Die
              Nutzer werden über Änderungen rechtzeitig informiert. Widerspricht
              der Nutzer nicht innerhalb von vier Wochen nach Zugang der
              Änderungsmitteilung, gelten die geänderten AGB als angenommen.
            </p>
          </Section>

          <Section title="§10 Schlussbestimmungen">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
              des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten ist
              Berlin, soweit der Nutzer Kaufmann ist.
            </p>
          </Section>
        </div>

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h2 className="mb-4 text-xl font-semibold">Kontakt</h2>
          <p className="text-muted-foreground">
            Bei Fragen zu unseren AGB stehen wir Ihnen gerne zur Verfügung:
          </p>
          <p className="mt-4">
            NICNOA & CO. DIGITAL<br />
            E-Mail: info@nicnoa.de<br />
            Telefon: +49 (0) 123 456789
          </p>
        </div>
      </motion.div>
    </div>
  )
} 