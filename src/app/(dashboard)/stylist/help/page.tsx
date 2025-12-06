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
  Calendar,
  Euro,
  Settings,
  Shield,
  ExternalLink,
  Briefcase,
  Building2
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
    question: 'Wie sehe ich meine anstehenden Termine?',
    answer: 'Gehe zum Kalender in deinem Dashboard. Dort siehst du alle deine Termine in der Tages-, Wochen- oder Monatsansicht. Klicke auf einen Termin für Details wie Kundeninfos und gebuchte Services.'
  },
  {
    category: 'Buchungen',
    question: 'Kann ich Zeiten blocken, in denen ich nicht verfügbar bin?',
    answer: 'Ja! Gehe zu "Verfügbarkeit" und klicke auf "Blocker hinzufügen". Du kannst einzelne Zeiträume oder wiederkehrende Auszeiten (z.B. jeden Montag) eintragen.'
  },
  {
    category: 'Verdienst',
    question: 'Wo sehe ich meine Einnahmen?',
    answer: 'Unter "Verdienst" findest du eine detaillierte Übersicht deiner Einnahmen. Du siehst dein Tages-, Wochen- und Monatseinkommen sowie eine Aufschlüsselung nach Salons und Services.'
  },
  {
    category: 'Verdienst',
    question: 'Wann und wie werde ich bezahlt?',
    answer: 'Die Auszahlung erfolgt je nach Vereinbarung mit dem Salon. In der Regel erhältst du deine Einnahmen abzüglich der Stuhlmiete am Monatsende auf dein hinterlegtes Bankkonto.'
  },
  {
    category: 'Salon',
    question: 'Wie finde ich einen Salon für die Stuhlmiete?',
    answer: 'Gehe zu "Salon finden" und nutze die Suchfunktion. Du kannst nach Standort, Ausstattung und Konditionen filtern. Sende eine Anfrage an interessante Salons direkt über die Plattform.'
  },
  {
    category: 'Salon',
    question: 'Kann ich in mehreren Salons gleichzeitig arbeiten?',
    answer: 'Ja, du kannst Vereinbarungen mit mehreren Salons haben. Achte darauf, deine Verfügbarkeit entsprechend zu pflegen, um Überschneidungen zu vermeiden.'
  },
  {
    category: 'Profil',
    question: 'Wie aktualisiere ich mein Profil?',
    answer: 'Unter "Einstellungen" → "Profil" kannst du deine Infos, Bio, Skills und Social-Media-Links bearbeiten. Ein vollständiges Profil hilft dir, mehr Kunden zu gewinnen.'
  },
  {
    category: 'Profil',
    question: 'Wie füge ich Bilder zu meinem Portfolio hinzu?',
    answer: 'Gehe zu "Profil" und scrolle zum Abschnitt "Portfolio". Klicke auf "Bilder hinzufügen" und lade deine besten Arbeiten hoch. Qualitativ hochwertige Bilder sind wichtig für deinen Erfolg!'
  },
  {
    category: 'Compliance',
    question: 'Welche Dokumente brauche ich für die Selbstständigkeit?',
    answer: 'Du benötigst: Meisterbrief/Ausnahmebewilligung, Gewerbeanmeldung, Betriebshaftpflichtversicherung, Statusfeststellung (V027) und Handwerkskammer-Eintragung. Diese lädst du im Onboarding hoch.'
  },
  {
    category: 'Compliance',
    question: 'Was bedeutet "Scheinselbstständigkeit"?',
    answer: 'Scheinselbstständigkeit liegt vor, wenn du rechtlich wie ein Angestellter behandelt wirst, aber als Selbstständiger gemeldet bist. Um das zu vermeiden, nutzt du eigene Tools, bestimmst deine Preise selbst und hast mehrere Auftraggeber.'
  },
  {
    category: 'Sicherheit',
    question: 'Wie schütze ich meinen Account?',
    answer: 'Aktiviere die Zwei-Faktor-Authentifizierung unter "Einstellungen" → "Sicherheit". Verwende ein starkes Passwort und teile deine Zugangsdaten niemals mit anderen.'
  },
]

const categories = [
  { id: 'all', label: 'Alle', icon: HelpCircle },
  { id: 'Buchungen', label: 'Buchungen', icon: Calendar },
  { id: 'Verdienst', label: 'Verdienst', icon: Euro },
  { id: 'Salon', label: 'Salon', icon: Building2 },
  { id: 'Profil', label: 'Profil', icon: Settings },
  { id: 'Compliance', label: 'Compliance', icon: Briefcase },
  { id: 'Sicherheit', label: 'Sicherheit', icon: Shield },
]

const quickLinks = [
  { label: 'Erste Schritte', icon: BookOpen, href: '#' },
  { label: 'Video-Tutorials', icon: FileText, href: '#' },
  { label: 'Stylist Community', icon: MessageCircle, href: '#' },
]

export default function StylistHelpPage() {
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
        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
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
            className="hover:border-pink-500/50 transition-colors cursor-pointer group"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                <link.icon className="h-6 w-6 text-pink-500" />
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
            className={selectedCategory === category.id ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' : ''}
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
                      <Badge variant="outline" className="border-pink-500/30 text-pink-500">
                        {item.category}
                      </Badge>
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

      {/* Compliance Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Briefcase className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500">Compliance-Tipp</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Als selbstständiger Stylist ist es wichtig, alle Dokumente aktuell zu halten. 
                  Prüfe regelmäßig unter &quot;Profil&quot; → &quot;Dokumente&quot;, ob alles vollständig ist.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-pink-500/5 to-rose-500/5 border-pink-500/20">
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
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
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
