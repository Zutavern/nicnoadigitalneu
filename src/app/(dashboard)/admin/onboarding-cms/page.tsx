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
  Building2,
  Signature,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Clock,
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
import { ScrollArea } from '@/components/ui/scroll-area'

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
const DEFAULT_TEXTS: OnboardingConfig = {
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

// Preview-Komponente für das Onboarding
function OnboardingPreview({ config, activeTab }: { config: OnboardingConfig | null; activeTab: string }) {
  const [previewStep, setPreviewStep] = useState(1)
  
  // Wenn Tab wechselt, wechsle auch den Preview-Step
  useEffect(() => {
    if (activeTab === 'steps') setPreviewStep(1)
    if (activeTab === 'compliance') setPreviewStep(2)
    if (activeTab === 'documents') setPreviewStep(3)
  }, [activeTab])
  
  const getConfigValue = (key: keyof OnboardingConfig) => {
    return config?.[key] || DEFAULT_TEXTS[key]
  }

  return (
    <div className="h-full bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden">
      {/* Preview Header */}
      <div className="p-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">Live-Vorschau</span>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-56px)]">
        <div className="p-6">
          {/* Step Navigation Preview */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((step) => {
              const Icon = STEP_ICONS[step - 1]
              const isActive = previewStep === step
              const isCompleted = previewStep > step
              return (
                <button
                  key={step}
                  onClick={() => setPreviewStep(step)}
                  className="flex flex-col items-center"
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${isActive 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-gray-500'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-[10px] mt-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    Schritt {step}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Step 1: Business Data Preview */}
          {previewStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{getConfigValue('step1Title')}</h2>
                <p className="text-sm text-gray-400 mt-1">{getConfigValue('step1Description')}</p>
              </div>
              
              <div className="space-y-3">
                {['Firmenname', 'Straße', 'PLZ', 'Ort'].map((field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs text-gray-500">{field}</Label>
                    <div className="h-9 bg-white/5 rounded-lg border border-white/10" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Compliance Preview */}
          {previewStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{getConfigValue('step2Title')}</h2>
                <p className="text-sm text-gray-400 mt-1">{getConfigValue('step2Description')}</p>
              </div>
              
              <div className="space-y-3">
                {COMPLIANCE_FIELDS.map((field) => {
                  const Icon = field.icon
                  return (
                    <div key={field.key} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-white flex-1">{field.question}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs bg-zinc-900 border-white/10">
                              <p className="text-xs">{getConfigValue(field.key as keyof OnboardingConfig)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex gap-2 mt-3 ml-8">
                        <button className="px-3 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Ja</button>
                        <button className="px-3 py-1 rounded-lg text-xs bg-white/5 text-gray-400">Nein</button>
                        <button className="px-3 py-1 rounded-lg text-xs bg-white/5 text-gray-400">In Arbeit</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: Documents Preview */}
          {previewStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{getConfigValue('step3Title')}</h2>
                <p className="text-sm text-gray-400 mt-1">{getConfigValue('step3Description')}</p>
              </div>
              
              <div className="space-y-3">
                {DOCUMENT_FIELDS.map((field) => (
                  <div key={field.key} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{field.label}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                  <HelpCircle className="h-4 w-4 text-gray-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs bg-zinc-900 border-white/10">
                                <p className="text-xs">{getConfigValue(field.key as keyof OnboardingConfig)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                        <div className="mt-3 h-16 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500">Datei hochladen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Summary Preview */}
          {previewStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">{getConfigValue('step4Title')}</h2>
                <p className="text-sm text-gray-400 mt-1">{getConfigValue('step4Description')}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white">Fast geschafft!</h3>
                <p className="text-sm text-gray-400 mt-1">Überprüfe deine Eingaben und schließe ab.</p>
              </div>
            </motion.div>
          )}

          {/* Hinweis */}
          <div className="mt-8 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400 flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              Hover über die ? Icons, um die Info-Texte zu sehen
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default function OnboardingCMSPage() {
  const [config, setConfig] = useState<OnboardingConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('steps')

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
    } catch {
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

        {/* Splitscreen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Editor */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
              </TabsList>

              {/* Schritt-Texte Tab */}
              <TabsContent value="steps" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      Schritt-Überschriften
                    </CardTitle>
                    <CardDescription>
                      Diese Texte werden als Überschriften angezeigt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((step) => {
                          const Icon = STEP_ICONS[step - 1]
                          const titleKey = `step${step}Title` as keyof OnboardingConfig
                          const descKey = `step${step}Description` as keyof OnboardingConfig
                          return (
                            <div key={step} className="p-4 rounded-lg bg-muted/50 border space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">Schritt {step}</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Titel</Label>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => resetToDefault(titleKey)}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={config?.[titleKey] || ''}
                                  onChange={(e) => updateConfig(titleKey, e.target.value)}
                                  placeholder={DEFAULT_TEXTS[titleKey]}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Beschreibung</Label>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => resetToDefault(descKey)}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={config?.[descKey] || ''}
                                  onChange={(e) => updateConfig(descKey, e.target.value)}
                                  placeholder={DEFAULT_TEXTS[descKey]}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compliance Info-Bubbles Tab */}
              <TabsContent value="compliance" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      Compliance Info-Texte
                    </CardTitle>
                    <CardDescription>
                      Diese Texte erscheinen bei den ? Icons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {COMPLIANCE_FIELDS.map((field) => {
                          const Icon = field.icon
                          const key = field.key as keyof OnboardingConfig
                          return (
                            <div key={field.key} className="p-4 rounded-lg bg-muted/50 border space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Label className="font-medium">{field.label}</Label>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    &quot;{field.question}&quot;
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 flex-shrink-0"
                                  onClick={() => resetToDefault(key)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                              <Textarea
                                value={config?.[key] || ''}
                                onChange={(e) => updateConfig(key, e.target.value)}
                                placeholder={DEFAULT_TEXTS[key]}
                                rows={3}
                                className="resize-none text-sm"
                              />
                              <p className="text-xs text-muted-foreground text-right">
                                {(config?.[key] || '').length} / 300
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dokument Info-Bubbles Tab */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-500" />
                      Dokument Info-Texte
                    </CardTitle>
                    <CardDescription>
                      Diese Texte erscheinen bei den ? Icons der Dokumente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {DOCUMENT_FIELDS.map((field) => {
                          const key = field.key as keyof OnboardingConfig
                          return (
                            <div key={field.key} className="p-4 rounded-lg bg-muted/50 border space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Label className="font-medium">{field.label}</Label>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">{field.description}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 flex-shrink-0"
                                  onClick={() => resetToDefault(key)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                              <Textarea
                                value={config?.[key] || ''}
                                onChange={(e) => updateConfig(key, e.target.value)}
                                placeholder={DEFAULT_TEXTS[key]}
                                rows={3}
                                className="resize-none text-sm"
                              />
                              <p className="text-xs text-muted-foreground text-right">
                                {(config?.[key] || '').length} / 350
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side: Preview */}
          <div className="lg:sticky lg:top-6 h-[700px]">
            <OnboardingPreview config={config} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
