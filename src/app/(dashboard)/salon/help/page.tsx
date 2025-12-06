'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  Calendar,
  Euro,
  Settings,
  Shield,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  {
    category: 'Buchungen',
    question: 'Wie kann ich eine neue Buchung erstellen?',
    answer: 'Gehe zum Kalender und klicke auf "Neuer Termin". Wähle den Kunden, den Stylisten, den Service und die gewünschte Zeit aus. Bestätige die Buchung und der Kunde erhält automatisch eine Bestätigung.'
  },
  {
    category: 'Buchungen',
    question: 'Wie storniere ich einen Termin?',
    answer: 'Öffne die Buchungsübersicht, finde den entsprechenden Termin und klicke auf das Drei-Punkte-Menü. Wähle "Stornieren" und bestätige. Der Kunde wird automatisch über die Stornierung informiert.'
  },
  {
    category: 'Stylisten',
    question: 'Wie füge ich einen neuen Stylisten hinzu?',
    answer: 'Gehe zu "Stylisten" und klicke auf "Stylist einladen". Gib die E-Mail-Adresse des Stylisten ein. Der Stylist erhält eine Einladung und kann sich nach Abschluss des Onboardings deinem Salon anschließen.'
  },
  {
    category: 'Stylisten',
    question: 'Wie verwalte ich die Stuhlmiete?',
    answer: 'Unter "Stylisten" findest du bei jedem Stylisten die aktuelle Mietvereinbarung. Du kannst dort die monatliche Miete, den Zeitraum und die Konditionen einsehen und bei Bedarf anpassen.'
  },
  {
    category: 'Finanzen',
    question: 'Wie erstelle ich eine Rechnung?',
    answer: 'Gehe zu "Rechnungen" und klicke auf "Neue Rechnung". Wähle den Empfänger aus, füge die Positionen hinzu und erstelle die Rechnung. Du kannst sie direkt als PDF herunterladen oder per E-Mail versenden.'
  },
  {
    category: 'Finanzen',
    question: 'Wo finde ich meine Umsatzübersicht?',
    answer: 'Unter "Umsatz" findest du eine detaillierte Übersicht deiner Einnahmen. Du kannst nach Zeiträumen, Stylisten und Services filtern und die Daten als Bericht exportieren.'
  },
  {
    category: 'Einstellungen',
    question: 'Wie ändere ich meine Salon-Öffnungszeiten?',
    answer: 'Gehe zu "Einstellungen" und dann zu "Öffnungszeiten". Dort kannst du für jeden Wochentag die Start- und Endzeit festlegen sowie Pausen und Feiertage eintragen.'
  },
  {
    category: 'Einstellungen',
    question: 'Wie aktualisiere ich meine Kontaktdaten?',
    answer: 'Unter "Einstellungen" findest du den Bereich "Kontaktdaten". Dort kannst du Adresse, Telefonnummer, E-Mail und Website aktualisieren.'
  },
  {
    category: 'Kunden',
    question: 'Wie kann ich Kundendaten exportieren?',
    answer: 'Gehe zu "Kunden" und klicke auf "Exportieren". Du kannst wählen, welche Daten exportiert werden sollen (DSGVO-konform) und erhältst eine CSV-Datei.'
  },
  {
    category: 'Sicherheit',
    question: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?',
    answer: 'Gehe zu "Einstellungen" > "Sicherheit" und aktiviere die Zwei-Faktor-Authentifizierung. Folge den Anweisungen, um eine Authenticator-App zu verknüpfen.'
  },
]

const categories = [
  { id: 'all', label: 'Alle', icon: HelpCircle },
  { id: 'Buchungen', label: 'Buchungen', icon: Calendar },
  { id: 'Stylisten', label: 'Stylisten', icon: Users },
  { id: 'Finanzen', label: 'Finanzen', icon: Euro },
  { id: 'Einstellungen', label: 'Einstellungen', icon: Settings },
  { id: 'Kunden', label: 'Kunden', icon: Users },
  { id: 'Sicherheit', label: 'Sicherheit', icon: Shield },
]

const quickLinks = [
  { label: 'Dokumentation', icon: BookOpen, href: '#' },
  { label: 'Video-Tutorials', icon: FileText, href: '#' },
  { label: 'Community Forum', icon: MessageCircle, href: '#' },
]

export default function SalonHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Hilfe & Support</h1>
        <p className="text-muted-foreground">
          Finde Antworten auf deine Fragen
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-semibold mb-4">Wie können wir dir helfen?</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Themen, Fragen oder Begriffen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {quickLinks.map((link, index) => (
          <Card 
            key={link.label}
            className="hover:border-blue-500/50 transition-colors cursor-pointer group"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <link.icon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{link.label}</div>
                <div className="text-sm text-muted-foreground">Mehr erfahren</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={selectedCategory === category.id ? 'bg-blue-500 hover:bg-blue-600' : ''}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </motion.div>

      {/* FAQ List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Häufig gestellte Fragen</CardTitle>
            <CardDescription>
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredFAQs.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="font-medium">{item.question}</span>
                    </div>
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedItems.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 pt-0 text-muted-foreground border-t bg-muted/30">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Ergebnisse für "{searchQuery}"</p>
                  <p className="text-sm mt-2">Versuche es mit anderen Suchbegriffen</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Noch Fragen?</h3>
              <p className="text-muted-foreground mb-6">
                Unser Support-Team hilft dir gerne weiter
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  support@nicnoa.de
                </Button>
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  +49 30 12345678
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live-Chat starten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
