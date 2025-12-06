'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  Phone,
  Video,
  FileText,
  ExternalLink,
  Search,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Rocket,
  CreditCard,
  Users,
  Building2,
  Settings,
  Shield,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const faqItems = [
  {
    category: 'Erste Schritte',
    icon: Rocket,
    questions: [
      { q: 'Wie richte ich meinen ersten Salon ein?', a: 'Gehen Sie zu "Salons" und klicken Sie auf "Salon hinzufügen". Füllen Sie die erforderlichen Informationen aus und laden Sie Ihre Stylisten ein.' },
      { q: 'Wie lade ich Stylisten zu meinem Salon ein?', a: 'In der Salon-Übersicht können Sie unter "Team" neue Stylisten per E-Mail einladen. Sie erhalten einen Link zur Registrierung.' },
      { q: 'Wie funktioniert die Testphase?', a: 'Jeder neue Salon erhält automatisch 14 Tage kostenlosen Zugang zu allen Pro-Features. Keine Kreditkarte erforderlich.' },
    ],
  },
  {
    category: 'Abrechnung & Zahlungen',
    icon: CreditCard,
    questions: [
      { q: 'Welche Zahlungsmethoden werden akzeptiert?', a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex) sowie SEPA-Lastschrift für monatliche Abonnements.' },
      { q: 'Wie kann ich mein Abonnement ändern?', a: 'Unter Einstellungen > Abrechnung können Sie jederzeit Ihr Abonnement upgraden oder downgraden. Änderungen werden anteilig berechnet.' },
      { q: 'Wie erhalte ich meine Rechnungen?', a: 'Alle Rechnungen werden automatisch per E-Mail versendet und sind auch im Bereich "Abrechnung" als PDF verfügbar.' },
    ],
  },
  {
    category: 'Benutzerverwaltung',
    icon: Users,
    questions: [
      { q: 'Wie setze ich ein Benutzerpasswort zurück?', a: 'Als Admin können Sie in der Benutzerverwaltung auf "Passwort ändern" klicken, um ein neues Passwort für jeden Benutzer zu setzen.' },
      { q: 'Wie deaktiviere ich einen Account?', a: 'In der Benutzerverwaltung können Sie Accounts temporär sperren oder dauerhaft löschen. Gesperrte Accounts können reaktiviert werden.' },
      { q: 'Was sind die verschiedenen Benutzerrollen?', a: 'Es gibt drei Rollen: Admin (voller Zugriff), Salon-Betreiber (Salon-Management) und Stylist (Terminverwaltung).' },
    ],
  },
  {
    category: 'Sicherheit',
    icon: Shield,
    questions: [
      { q: 'Wie aktiviere ich 2FA?', a: 'Unter Einstellungen > Sicherheit können Sie die Zwei-Faktor-Authentifizierung mit einer Authenticator-App einrichten.' },
      { q: 'Wie sind meine Daten geschützt?', a: 'Alle Daten werden verschlüsselt übertragen (TLS 1.3) und gespeichert. Wir sind DSGVO-konform und hosten auf deutschen Servern.' },
      { q: 'Was passiert bei verdächtigen Anmeldeversuchen?', a: 'Bei mehreren fehlgeschlagenen Versuchen wird der Account temporär gesperrt. Sie erhalten eine E-Mail-Benachrichtigung.' },
    ],
  },
]

const quickLinks = [
  { label: 'Dokumentation', href: '#', icon: Book },
  { label: 'API-Referenz', href: '#', icon: FileText },
  { label: 'Video-Tutorials', href: '#', icon: Video },
  { label: 'Changelog', href: '#', icon: Zap },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Erste Schritte')
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({ subject: '', message: '' })

  const filteredFaq = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            Hilfe & Support
          </h1>
          <p className="text-muted-foreground">
            Dokumentation, FAQ und Kontaktmöglichkeiten
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Wie können wir helfen?</h2>
            <p className="text-muted-foreground mb-4">
              Durchsuchen Sie unsere Wissensdatenbank oder kontaktieren Sie den Support
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Suchen Sie nach Antworten..."
                className="pl-12 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Häufig gestellte Fragen
          </h2>
          
          {filteredFaq.map((category) => (
            <Card key={category.category}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedCategory(
                  expandedCategory === category.category ? null : category.category
                )}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.category}
                    <Badge variant="outline">{category.questions.length}</Badge>
                  </CardTitle>
                  {expandedCategory === category.category ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              
              {expandedCategory === category.category && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {category.questions.map((item) => (
                      <motion.div
                        key={item.q}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full p-4 text-left font-medium flex items-center justify-between hover:bg-muted/50"
                          onClick={() => setExpandedQuestion(
                            expandedQuestion === item.q ? null : item.q
                          )}
                        >
                          {item.q}
                          {expandedQuestion === item.q ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                        {expandedQuestion === item.q && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 pb-4 text-muted-foreground"
                          >
                            {item.a}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-6">
          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt aufnehmen</CardTitle>
              <CardDescription>Wir sind für Sie da</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">E-Mail Support</p>
                  <p className="text-sm text-muted-foreground">support@nicnoa.de</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Mo-Fr, 9-18 Uhr</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">+49 30 1234567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Nachricht senden</CardTitle>
              <CardDescription>Wir antworten innerhalb von 24 Stunden</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Betreff</Label>
                  <Input
                    id="subject"
                    placeholder="Wie können wir helfen?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea
                    id="message"
                    placeholder="Beschreiben Sie Ihr Anliegen..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Nachricht senden
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Support-Zeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Montag - Freitag</span>
                  <span className="font-medium">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samstag</span>
                  <span className="font-medium">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sonntag</span>
                  <span className="text-muted-foreground">Geschlossen</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Support ist gerade online
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

