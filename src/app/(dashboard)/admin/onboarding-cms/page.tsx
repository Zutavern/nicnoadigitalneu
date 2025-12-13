'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Save,
  RefreshCw,
  FileText,
  Shield,
  Info,
  Loader2,
  Phone,
  BookOpen,
  CreditCard,
  Tag,
  User,
  FileCheck,
  AlertTriangle,
  Eye,
  Building2,
  Signature,
  HelpCircle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface OnboardingConfig {
  ownPhoneInfo: string
  ownAppointmentBookInfo: string
  ownCashRegisterInfo: string
  ownPriceListInfo: string
  ownBrandingInfo: string
  masterCertificateInfo: string
  businessRegistrationInfo: string
  liabilityInsuranceInfo: string
  statusDeterminationInfo: string
  craftsChamberInfo: string
  step1Title: string
  step1Description: string
  step2Title: string
  step2Description: string
  step3Title: string
  step3Description: string
  step4Title: string
  step4Description: string
}

// Standard-Texte (werden verwendet wenn CMS leer ist)
const DEFAULT_TEXTS = {
  // Schritt-Titel
  step1Title: 'Deine Geschäftsdaten',
  step1Description: 'Diese Daten benötigen wir für die Rechnungsstellung und den Vertrag.',
  step2Title: 'Selbstständigkeits-Check',
  step2Description: 'Diese Kriterien dokumentieren deine Selbstständigkeit und schützen vor Scheinselbstständigkeit.',
  step3Title: 'Dokumente hochladen',
  step3Description: 'Lade alle erforderlichen Nachweise hoch oder markiere, welche dir noch fehlen.',
  step4Title: 'Zusammenfassung & Abschluss',
  step4Description: 'Überprüfe deine Daten und schließe das Onboarding ab.',
  
  // Compliance Info-Texte
  ownPhoneInfo: 'Ein eigenes Telefon zeigt, dass du eigenständig mit Kunden kommunizierst und nicht vom Salonbetreiber abhängig bist. Dies ist ein wichtiges Kriterium zur Vermeidung von Scheinselbstständigkeit.',
  ownAppointmentBookInfo: 'Die eigenständige Terminplanung ohne Weisungsbindung des Salonbetreibers ist essentiell. Du bestimmst selbst, wann du arbeitest und welche Termine du annimmst – ein Kernmerkmal der Selbstständigkeit.',
  ownCashRegisterInfo: 'Eine eigene Kasse und ein eigenes EC-Terminal zeigen, dass du deine Einnahmen selbst verwaltest und direkt mit deinen Kunden abrechnest – nicht über den Salon. Das ist ein klares Zeichen unternehmerischer Eigenständigkeit.',
  ownPriceListInfo: 'Die freie Preisgestaltung ist ein Kernmerkmal der Selbstständigkeit. Du bestimmst deine Preise selbst, ohne Vorgaben des Salonbetreibers. Das unterscheidet dich von einem Angestellten.',
  ownBrandingInfo: 'Ein eigener Markenauftritt (Name, Logo, Visitenkarten) zeigt deine unternehmerische Eigenständigkeit und hilft beim Aufbau deines eigenen Kundenstamms. Das ist wichtig für deine Identität als selbstständige/r Friseur/in.',
  
  // Dokument Info-Texte
  masterCertificateInfo: 'Der Meisterbrief (oder eine Ausnahmebewilligung) ist für den Eintrag in die Handwerksrolle erforderlich. Ohne diesen Nachweis ist eine selbstständige Tätigkeit im Friseurhandwerk nicht zulässig. Falls du keinen Meisterbrief hast, kannst du bei der Handwerkskammer eine Ausnahmebewilligung beantragen.',
  businessRegistrationInfo: 'Die Gewerbeanmeldung ist der offizielle Nachweis deiner selbstständigen Tätigkeit. Du erhältst sie vom zuständigen Gewerbeamt deiner Stadt/Gemeinde. Sie ist Pflicht für jede gewerbliche Tätigkeit in Deutschland.',
  liabilityInsuranceInfo: 'Eine Betriebshaftpflichtversicherung schützt dich vor Schadensersatzansprüchen, die aus deiner beruflichen Tätigkeit entstehen können – z.B. wenn bei einer Behandlung etwas schief geht. Sie ist für Salonbetreiber oft Voraussetzung für die Zusammenarbeit.',
  statusDeterminationInfo: 'Das Statusfeststellungsverfahren (Formular V027) bei der Deutschen Rentenversicherung klärt verbindlich, ob du als selbstständig oder abhängig beschäftigt giltst. Dies schützt dich und den Salonbetreiber vor späteren Nachforderungen der Sozialversicherung.',
  craftsChamberInfo: 'Die Eintragung in die Handwerksrolle bei der zuständigen Handwerkskammer ist für das Friseurhandwerk Pflicht. Sie bestätigt deine Berechtigung zur selbstständigen Ausübung des Handwerks und ist Voraussetzung für die Gewerbeanmeldung.',
}

const STEP_ICONS = [Building2, Shield, FileCheck, Signature]

const COMPLIANCE_FIELDS = [
  { key: 'ownPhoneInfo', label: 'Eigenes Telefon', icon: Phone, question: 'Ich nutze mein eigenes Telefon.' },
  { key: 'ownAppointmentBookInfo', label: 'Eigenes Terminbuch', icon: BookOpen, question: 'Ich führe ein eigenes Terminbuch und koordiniere Termine selbst.' },
  { key: 'ownCashRegisterInfo', label: 'Eigene Kasse', icon: CreditCard, question: 'Ich nutze meine eigene Kasse und mein eigenes EC-Terminal.' },
  { key: 'ownPriceListInfo', label: 'Eigene Preisliste', icon: Tag, question: 'Ich habe meine eigene Preisliste und bestimme meine Preise selbst.' },
  { key: 'ownBrandingInfo', label: 'Eigenes Branding', icon: User, question: 'Ich trete unter meinem eigenen Namen/Logo auf.' },
]

const DOCUMENT_FIELDS = [
  { key: 'masterCertificateInfo', label: 'Meisterbrief / Ausnahmebewilligung', description: 'Pflicht für Handwerksrolleneintrag' },
  { key: 'businessRegistrationInfo', label: 'Gewerbeanmeldung', description: 'Nachweis vom Gewerbeamt' },
  { key: 'liabilityInsuranceInfo', label: 'Betriebshaftpflichtversicherung', description: 'Kopie der Police' },
  { key: 'statusDeterminationInfo', label: 'Statusfeststellung (V027)', description: 'Bestätigung der Rentenversicherung' },
  { key: 'craftsChamberInfo', label: 'Eintragung Handwerkskammer', description: 'Bestätigung der Handwerksrolle' },
]

export default function OnboardingCMSPage() {
  const [config, setConfig] = useState<OnboardingConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboarding/config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    if (!config) return
    
    setIsSaving(true)
    try {
      const res = await fetch('/api/onboarding/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        throw new Error('Fehler beim Speichern')
      }

      toast.success('Onboarding-Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error('Fehler beim Speichern der Konfiguration')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (key: keyof OnboardingConfig, value: string) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
    setHasChanges(true)
  }

  const resetToDefault = (key: keyof OnboardingConfig) => {
    updateConfig(key, DEFAULT_TEXTS[key])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Onboarding CMS</h1>
            <p className="text-muted-foreground">
              Verwalte alle Texte und Info-Bubbles im Stylist-Onboarding
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchConfig}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Neu laden
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Du hast ungespeicherte Änderungen
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="steps" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="steps" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schritt-Texte
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dokumente
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vorschau
            </TabsTrigger>
          </TabsList>

          {/* Schritt-Texte Tab */}
          <TabsContent value="steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Schritt-Überschriften & Beschreibungen
                </CardTitle>
                <CardDescription>
                  Diese Texte werden als Überschriften in den einzelnen Onboarding-Schritten angezeigt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((step) => {
                  const Icon = STEP_ICONS[step - 1]
                  const titleKey = `step${step}Title` as keyof OnboardingConfig
                  const descKey = `step${step}Description` as keyof OnboardingConfig
                  return (
                    <div key={step} className="grid gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Schritt {step}</h4>
                          <p className="text-xs text-muted-foreground">
                            {step === 1 && 'Geschäftsdaten'}
                            {step === 2 && 'Compliance-Check'}
                            {step === 3 && 'Dokumenten-Upload'}
                            {step === 4 && 'Zusammenfassung'}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={titleKey}>Titel</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => resetToDefault(titleKey)}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Auf Standard zurücksetzen</TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id={titleKey}
                            value={config?.[titleKey] || ''}
                            onChange={(e) => updateConfig(titleKey, e.target.value)}
                            placeholder={DEFAULT_TEXTS[titleKey]}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={descKey}>Beschreibung</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => resetToDefault(descKey)}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Auf Standard zurücksetzen</TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id={descKey}
                            value={config?.[descKey] || ''}
                            onChange={(e) => updateConfig(descKey, e.target.value)}
                            placeholder={DEFAULT_TEXTS[descKey]}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Info-Bubbles Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Compliance Info-Bubble Texte
                </CardTitle>
                <CardDescription>
                  Diese Texte erscheinen im Info-Icon (?) neben jeder Compliance-Frage.
                  Sie erklären dem Stylist, warum diese Punkte für die Selbstständigkeit wichtig sind.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {COMPLIANCE_FIELDS.map((field) => {
                  const Icon = field.icon
                  const key = field.key as keyof OnboardingConfig
                  return (
                    <div key={field.key} className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Frage: &quot;{field.question}&quot;
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => resetToDefault(key)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Auf Standard zurücksetzen</TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id={field.key}
                        value={config?.[key] || ''}
                        onChange={(e) => updateConfig(key, e.target.value)}
                        placeholder={DEFAULT_TEXTS[key]}
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(config?.[key] || '').length} / empfohlen max. 300 Zeichen
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dokument Info-Bubbles Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-500" />
                  Dokument Info-Bubble Texte
                </CardTitle>
                <CardDescription>
                  Diese Texte erscheinen im Info-Icon (?) neben jedem Dokument.
                  Sie erklären dem Stylist, warum dieses Dokument benötigt wird.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {DOCUMENT_FIELDS.map((field) => {
                  const key = field.key as keyof OnboardingConfig
                  return (
                    <div key={field.key} className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => resetToDefault(key)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Auf Standard zurücksetzen</TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id={field.key}
                        value={config?.[key] || ''}
                        onChange={(e) => updateConfig(key, e.target.value)}
                        placeholder={DEFAULT_TEXTS[key]}
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(config?.[key] || '').length} / empfohlen max. 350 Zeichen
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vorschau Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Live-Vorschau
                </CardTitle>
                <CardDescription>
                  So werden die Texte im Onboarding angezeigt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Schritt-Vorschau */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Schritt-Überschriften</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((step) => {
                      const Icon = STEP_ICONS[step - 1]
                      const titleKey = `step${step}Title` as keyof OnboardingConfig
                      const descKey = `step${step}Description` as keyof OnboardingConfig
                      return (
                        <div key={step} className="p-4 rounded-lg bg-[#0a0a0f] border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">
                                {config?.[titleKey] || DEFAULT_TEXTS[titleKey]}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {config?.[descKey] || DEFAULT_TEXTS[descKey]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Compliance-Vorschau */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Compliance Info-Bubbles</h3>
                  <div className="space-y-3">
                    {COMPLIANCE_FIELDS.slice(0, 2).map((field) => {
                      const Icon = field.icon
                      const key = field.key as keyof OnboardingConfig
                      return (
                        <div key={field.key} className="p-4 rounded-lg bg-[#0a0a0f] border border-white/10">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-400" />
                            <span className="text-white font-medium flex-1">{field.question}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1.5 rounded-full bg-white/5 hover:bg-white/10">
                                  <HelpCircle className="h-4 w-4 text-gray-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <p className="text-sm">{config?.[key] || DEFAULT_TEXTS[key]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-sm text-muted-foreground">
                      Hover über das ? um den Info-Text zu sehen
                    </p>
                  </div>
                </div>

                {/* Dokument-Vorschau */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Dokument Info-Bubbles</h3>
                  <div className="space-y-3">
                    {DOCUMENT_FIELDS.slice(0, 2).map((field) => {
                      const key = field.key as keyof OnboardingConfig
                      return (
                        <div key={field.key} className="p-4 rounded-lg bg-[#0a0a0f] border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{field.label}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-white/10">
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <p className="text-sm">{config?.[key] || DEFAULT_TEXTS[key]}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm text-gray-500">{field.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-sm text-muted-foreground">
                      Hover über das ? um den Info-Text zu sehen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
