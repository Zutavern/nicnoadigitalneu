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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

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

const COMPLIANCE_FIELDS = [
  { key: 'ownPhoneInfo', label: 'Eigenes Telefon', icon: Phone, description: 'Info-Text für die Eigenständigkeit bei Telefonkommunikation' },
  { key: 'ownAppointmentBookInfo', label: 'Eigenes Terminbuch', icon: BookOpen, description: 'Info-Text für die eigenständige Terminplanung' },
  { key: 'ownCashRegisterInfo', label: 'Eigene Kasse', icon: CreditCard, description: 'Info-Text für die eigenständige Abrechnung' },
  { key: 'ownPriceListInfo', label: 'Eigene Preisliste', icon: Tag, description: 'Info-Text für die freie Preisgestaltung' },
  { key: 'ownBrandingInfo', label: 'Eigenes Branding', icon: User, description: 'Info-Text für die eigene Markenidentität' },
]

const DOCUMENT_FIELDS = [
  { key: 'masterCertificateInfo', label: 'Meisterbrief', description: 'Info-Text warum der Meisterbrief wichtig ist' },
  { key: 'businessRegistrationInfo', label: 'Gewerbeanmeldung', description: 'Info-Text zur Gewerbeanmeldung' },
  { key: 'liabilityInsuranceInfo', label: 'Haftpflichtversicherung', description: 'Info-Text zur Betriebshaftpflicht' },
  { key: 'statusDeterminationInfo', label: 'Statusfeststellung', description: 'Info-Text zum V027-Formular' },
  { key: 'craftsChamberInfo', label: 'Handwerkskammer', description: 'Info-Text zur Handwerksrolle' },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding CMS</h1>
          <p className="text-muted-foreground">
            Verwalte die Texte und Info-Bubbles im Stylist-Onboarding
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
        <TabsList>
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schritt-Texte
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance Info-Bubbles
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dokument Info-Bubbles
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
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="grid gap-4 p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium">Schritt {step}</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`step${step}Title`}>Titel</Label>
                      <Input
                        id={`step${step}Title`}
                        value={config?.[`step${step}Title` as keyof OnboardingConfig] || ''}
                        onChange={(e) => updateConfig(`step${step}Title` as keyof OnboardingConfig, e.target.value)}
                        placeholder={`Titel für Schritt ${step}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`step${step}Description`}>Beschreibung</Label>
                      <Input
                        id={`step${step}Description`}
                        value={config?.[`step${step}Description` as keyof OnboardingConfig] || ''}
                        onChange={(e) => updateConfig(`step${step}Description` as keyof OnboardingConfig, e.target.value)}
                        placeholder={`Beschreibung für Schritt ${step}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                Diese Texte werden in den Info-Bubbles (ℹ️) neben den Compliance-Fragen angezeigt.
                Sie erklären dem User, warum jeder Punkt wichtig ist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {COMPLIANCE_FIELDS.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.key} className="space-y-2 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                    <Textarea
                      id={field.key}
                      value={config?.[field.key as keyof OnboardingConfig] || ''}
                      onChange={(e) => updateConfig(field.key as keyof OnboardingConfig, e.target.value)}
                      placeholder={`Info-Text für "${field.label}"`}
                      rows={3}
                    />
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
                Diese Texte werden in den Info-Bubbles (ℹ️) neben den Dokumenten angezeigt.
                Sie erklären dem User, warum jedes Dokument benötigt wird.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {DOCUMENT_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2 p-4 rounded-lg bg-muted/50">
                  <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                  <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                  <Textarea
                    id={field.key}
                    value={config?.[field.key as keyof OnboardingConfig] || ''}
                    onChange={(e) => updateConfig(field.key as keyof OnboardingConfig, e.target.value)}
                    placeholder={`Info-Text für "${field.label}"`}
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

