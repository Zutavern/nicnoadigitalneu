'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Type,
  Layout,
  Search,
  MessageSquare,
  Star,
  Shield,
  Settings,
  Sparkles,
  Check,
  Scissors,
  Building2,
  Crown,
  Zap,
  Bot,
  Gift,
  ArrowRight,
  Users,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PricingPageConfig {
  id?: string
  // Stuhlmieter Hero
  stylistBadgeText: string | null
  stylistTitle: string
  stylistDescription: string | null
  // Salonbesitzer Hero
  salonBadgeText: string | null
  salonTitle: string
  salonDescription: string | null
  // CTA Section
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonUrl: string | null
  // Trust Elements
  showTrustElements: boolean
  trustElement1Text: string | null
  trustElement2Text: string | null
  trustElement3Text: string | null
  trustElement4Text: string | null
  // FAQ Section
  showFAQ: boolean
  faqTitle: string | null
  faqDescription: string | null
  // Testimonials
  showTestimonials: boolean
  testimonialsTitle: string | null
  // SEO
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  ogImage: string | null
}

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  planType: 'STYLIST' | 'SALON_OWNER'
  priceMonthly: number
  priceQuarterly: number
  priceSixMonths: number
  priceYearly: number
  features: string[]
  isPopular: boolean
  trialDays: number
  includedAiCreditsEur: number
}

interface BillingConfig {
  pricingPageDesign: 'compact' | 'expanded' | 'modern'
  currencySign: string
  defaultInterval: string
}

const defaultConfig: PricingPageConfig = {
  stylistBadgeText: 'Für Stuhlmieter',
  stylistTitle: 'Der perfekte Plan für deinen Erfolg',
  stylistDescription: 'Starte jetzt durch mit NICNOA – alle Tools für moderne Stylisten',
  salonBadgeText: 'Für Salonbesitzer',
  salonTitle: 'Dein Salon, dein Erfolg, deine Plattform',
  salonDescription: 'Verwalte dein Team, optimiere Abläufe und steigere deinen Umsatz',
  ctaTitle: 'Bereit für den nächsten Schritt?',
  ctaDescription: 'Starte jetzt kostenlos und überzeuge dich selbst',
  ctaButtonText: 'Jetzt kostenlos testen',
  ctaButtonUrl: '/register',
  showTrustElements: true,
  trustElement1Text: '14 Tage kostenlos',
  trustElement2Text: 'Jederzeit kündbar',
  trustElement3Text: 'Keine Kreditkarte nötig',
  trustElement4Text: '30 Tage Geld-zurück-Garantie',
  showFAQ: true,
  faqTitle: 'Häufige Fragen',
  faqDescription: 'Alles was du über unsere Preise wissen musst',
  showTestimonials: true,
  testimonialsTitle: 'Das sagen unsere Kunden',
  metaTitle: 'Preise & Pläne | NICNOA',
  metaDescription: 'Finde den perfekten Plan für dein Salon-Business. Flexible Preise, kostenlose Testphase und jederzeit kündbar.',
  metaKeywords: null,
  ogImage: null,
}

export default function PricingCMSPage() {
  const [config, setConfig] = useState<PricingPageConfig>(defaultConfig)
  const [billingConfig, setBillingConfig] = useState<BillingConfig>({
    pricingPageDesign: 'compact',
    currencySign: '€',
    defaultInterval: 'sixMonths'
  })
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [previewRole, setPreviewRole] = useState<'stylist' | 'salon'>('stylist')
  const [previewInterval, setPreviewInterval] = useState<'monthly' | 'quarterly' | 'sixMonths' | 'yearly'>('sixMonths')

  // Daten laden
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [configRes, plansRes, billingRes] = await Promise.all([
        fetch('/api/admin/pricing-page-config'),
        fetch('/api/admin/plans?includeInactive=true'),
        fetch('/api/billing-config')
      ])

      if (configRes.ok) {
        const data = await configRes.json()
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config })
        }
      }

      if (plansRes.ok) {
        const data = await plansRes.json()
        setPlans(data.plans || [])
      }

      if (billingRes.ok) {
        const data = await billingRes.json()
        setBillingConfig({
          pricingPageDesign: data.pricingPageDesign || 'compact',
          currencySign: data.currencySign || '€',
          defaultInterval: data.defaultInterval || 'sixMonths'
        })
        setPreviewInterval((data.defaultInterval || 'sixMonths') as typeof previewInterval)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Config aktualisieren
  const updateConfig = <K extends keyof PricingPageConfig>(key: K, value: PricingPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Speichern
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/pricing-page-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!res.ok) throw new Error('Speichern fehlgeschlagen')

      toast.success('Änderungen gespeichert')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Gefilterte Pläne für Vorschau
  const filteredPlans = plans.filter(plan => {
    if (previewRole === 'stylist' && plan.planType === 'STYLIST') return true
    if (previewRole === 'salon' && plan.planType === 'SALON_OWNER') return true
    return false
  })

  // Preis für Intervall
  const getPriceForInterval = (plan: Plan) => {
    switch (previewInterval) {
      case 'quarterly': return plan.priceQuarterly
      case 'sixMonths': return plan.priceSixMonths
      case 'yearly': return plan.priceYearly
      default: return plan.priceMonthly
    }
  }

  const getMonthsForInterval = () => {
    switch (previewInterval) {
      case 'quarterly': return 3
      case 'sixMonths': return 6
      case 'yearly': return 12
      default: return 1
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Preisseite CMS
          </h1>
          <p className="text-muted-foreground mt-1">
            Bearbeite Texte und SEO für die öffentliche Preisseite
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/preise" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live ansehen
            </Link>
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            className="bg-gradient-to-r from-primary to-primary/80"
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

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="capitalize">
          Design: {billingConfig.pricingPageDesign === 'compact' ? 'Kompakt' : billingConfig.pricingPageDesign === 'modern' ? 'Modern' : 'Erweitert'}
        </Badge>
        <Badge variant="outline">
          {plans.filter(p => p.planType === 'STYLIST').length} Stuhlmieter-Pläne
        </Badge>
        <Badge variant="outline">
          {plans.filter(p => p.planType === 'SALON_OWNER').length} Salonbesitzer-Pläne
        </Badge>
        {hasChanges && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Ungespeicherte Änderungen
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className={cn("grid gap-6", showPreview ? "lg:grid-cols-2" : "grid-cols-1")}>
        {/* Editor */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                <Type className="mr-1 h-4 w-4 hidden sm:inline" />
                Texte
              </TabsTrigger>
              <TabsTrigger value="sections" className="text-xs sm:text-sm">
                <Layout className="mr-1 h-4 w-4 hidden sm:inline" />
                Sektionen
              </TabsTrigger>
              <TabsTrigger value="trust" className="text-xs sm:text-sm">
                <Shield className="mr-1 h-4 w-4 hidden sm:inline" />
                Trust
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                <Search className="mr-1 h-4 w-4 hidden sm:inline" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Texte Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              {/* Stuhlmieter Texte */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    Stuhlmieter Texte
                  </CardTitle>
                  <CardDescription>
                    Diese Texte werden angezeigt wenn "Stuhlmieter" ausgewählt ist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.stylistBadgeText || ''}
                      onChange={(e) => updateConfig('stylistBadgeText', e.target.value)}
                      placeholder="z.B. Für Stuhlmieter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Überschrift</Label>
                    <Textarea
                      value={config.stylistTitle}
                      onChange={(e) => updateConfig('stylistTitle', e.target.value)}
                      placeholder="Hauptüberschrift"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.stylistDescription || ''}
                      onChange={(e) => updateConfig('stylistDescription', e.target.value)}
                      placeholder="Kurze Beschreibung"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Salonbesitzer Texte */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Salonbesitzer Texte
                  </CardTitle>
                  <CardDescription>
                    Diese Texte werden angezeigt wenn "Salonbesitzer" ausgewählt ist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.salonBadgeText || ''}
                      onChange={(e) => updateConfig('salonBadgeText', e.target.value)}
                      placeholder="z.B. Für Salonbesitzer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Überschrift</Label>
                    <Textarea
                      value={config.salonTitle}
                      onChange={(e) => updateConfig('salonTitle', e.target.value)}
                      placeholder="Hauptüberschrift"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.salonDescription || ''}
                      onChange={(e) => updateConfig('salonDescription', e.target.value)}
                      placeholder="Kurze Beschreibung"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Call-to-Action Bereich
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>CTA Überschrift</Label>
                    <Input
                      value={config.ctaTitle || ''}
                      onChange={(e) => updateConfig('ctaTitle', e.target.value)}
                      placeholder="z.B. Bereit für den nächsten Schritt?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Beschreibung</Label>
                    <Textarea
                      value={config.ctaDescription || ''}
                      onChange={(e) => updateConfig('ctaDescription', e.target.value)}
                      placeholder="Kurze Beschreibung"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={config.ctaButtonText || ''}
                        onChange={(e) => updateConfig('ctaButtonText', e.target.value)}
                        placeholder="z.B. Jetzt starten"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input
                        value={config.ctaButtonUrl || ''}
                        onChange={(e) => updateConfig('ctaButtonUrl', e.target.value)}
                        placeholder="/register"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sektionen Tab */}
            <TabsContent value="sections" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sektionen ein-/ausblenden</CardTitle>
                  <CardDescription>
                    Welche Bereiche sollen auf der Preisseite sichtbar sein?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trust Elements */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Trust-Elemente</Label>
                      <p className="text-sm text-muted-foreground">Vertrauenssignale unter den Preisen</p>
                    </div>
                    <Switch
                      checked={config.showTrustElements}
                      onCheckedChange={(v) => updateConfig('showTrustElements', v)}
                    />
                  </div>

                  <Separator />

                  {/* FAQ */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">FAQ-Bereich</Label>
                        <p className="text-sm text-muted-foreground">Häufig gestellte Fragen</p>
                      </div>
                      <Switch
                        checked={config.showFAQ}
                        onCheckedChange={(v) => updateConfig('showFAQ', v)}
                      />
                    </div>
                    {config.showFAQ && (
                      <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                        <div className="space-y-2">
                          <Label>FAQ Überschrift</Label>
                          <Input
                            value={config.faqTitle || ''}
                            onChange={(e) => updateConfig('faqTitle', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>FAQ Beschreibung</Label>
                          <Textarea
                            value={config.faqDescription || ''}
                            onChange={(e) => updateConfig('faqDescription', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Testimonials */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Testimonials</Label>
                        <p className="text-sm text-muted-foreground">Kundenbewertungen</p>
                      </div>
                      <Switch
                        checked={config.showTestimonials}
                        onCheckedChange={(v) => updateConfig('showTestimonials', v)}
                      />
                    </div>
                    {config.showTestimonials && (
                      <div className="pl-4 border-l-2 border-primary/20">
                        <div className="space-y-2">
                          <Label>Testimonials Überschrift</Label>
                          <Input
                            value={config.testimonialsTitle || ''}
                            onChange={(e) => updateConfig('testimonialsTitle', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Link zu anderen Einstellungen */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Weitere Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Design-Variante, Intervalle und Rabatte werden in den Billing-Einstellungen konfiguriert.
                    Preispläne werden separat verwaltet.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/billing-settings">
                        Billing-Einstellungen
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/plans">
                        Preispläne
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trust Tab */}
            <TabsContent value="trust" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Trust-Elemente
                  </CardTitle>
                  <CardDescription>
                    Vertrauenssignale die unter den Preisen angezeigt werden
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {i}
                      </div>
                      <Input
                        value={(config as Record<string, unknown>)[`trustElement${i}Text`] as string || ''}
                        onChange={(e) => updateConfig(`trustElement${i}Text` as keyof PricingPageConfig, e.target.value)}
                        placeholder={`Trust-Element ${i}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    SEO-Einstellungen
                  </CardTitle>
                  <CardDescription>
                    Optimiere die Preisseite für Suchmaschinen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta-Titel</Label>
                    <Input
                      value={config.metaTitle || ''}
                      onChange={(e) => updateConfig('metaTitle', e.target.value)}
                      placeholder="Seitentitel für Suchmaschinen"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(config.metaTitle || '').length}/60 Zeichen
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta-Beschreibung</Label>
                    <Textarea
                      value={config.metaDescription || ''}
                      onChange={(e) => updateConfig('metaDescription', e.target.value)}
                      placeholder="Beschreibung für Suchmaschinen"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(config.metaDescription || '').length}/160 Zeichen
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords</Label>
                    <Textarea
                      value={config.metaKeywords || ''}
                      onChange={(e) => updateConfig('metaKeywords', e.target.value)}
                      placeholder="Kommagetrennte Keywords"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Open Graph Bild</Label>
                    <Input
                      value={config.ogImage || ''}
                      onChange={(e) => updateConfig('ogImage', e.target.value)}
                      placeholder="URL zum Vorschaubild"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird beim Teilen in sozialen Medien angezeigt
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Live-Vorschau
                  </CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {billingConfig.pricingPageDesign === 'compact' ? 'Kompakt' : billingConfig.pricingPageDesign === 'modern' ? 'Modern' : 'Erweitert'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    variant={previewRole === 'stylist' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewRole('stylist')}
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    Stuhlmieter
                  </Button>
                  <Button
                    variant={previewRole === 'salon' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewRole('salon')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Salonbesitzer
                  </Button>
                </div>

                {/* Interval Toggle */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  {(['monthly', 'quarterly', 'sixMonths', 'yearly'] as const).map((interval) => (
                    <Button
                      key={interval}
                      variant={previewInterval === interval ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewInterval(interval)}
                      className="flex-1 text-xs px-2"
                    >
                      {interval === 'monthly' ? '1M' : interval === 'quarterly' ? '3M' : interval === 'sixMonths' ? '6M' : '12M'}
                    </Button>
                  ))}
                </div>

                {/* Preview Content */}
                <div className="border rounded-xl p-4 bg-gradient-to-b from-background to-muted/30 space-y-4">
                  {/* Hero Preview */}
                  <div className="text-center space-y-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {previewRole === 'stylist' ? config.stylistBadgeText : config.salonBadgeText}
                    </Badge>
                    <h2 className="text-2xl font-bold leading-tight">
                      {previewRole === 'stylist' ? config.stylistTitle : config.salonTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {previewRole === 'stylist' ? config.stylistDescription : config.salonDescription}
                    </p>
                  </div>

                  <Separator />

                  {/* Plans Preview */}
                  <div className="space-y-3">
                    {filteredPlans.slice(0, 3).map((plan) => {
                      const price = getPriceForInterval(plan)
                      const months = getMonthsForInterval()
                      const monthlyEquivalent = Math.round(price / months)

                      return (
                        <div
                          key={plan.id}
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            plan.isPopular ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{plan.name}</span>
                                {plan.isPopular && (
                                  <Crown className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              {plan.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {plan.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold">
                                {billingConfig.currencySign}{monthlyEquivalent}
                              </span>
                              <span className="text-xs text-muted-foreground">/Monat</span>
                            </div>
                          </div>
                          
                          {/* Features & AI Credits */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {plan.features.slice(0, 2).map((feature, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {feature.substring(0, 20)}...
                              </Badge>
                            ))}
                            {plan.includedAiCreditsEur > 0 && (
                              <Badge className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/30">
                                <Bot className="h-2.5 w-2.5 mr-1" />
                                {billingConfig.currencySign}{plan.includedAiCreditsEur} AI
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {filteredPlans.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Keine {previewRole === 'stylist' ? 'Stuhlmieter' : 'Salonbesitzer'}-Pläne vorhanden
                      </p>
                    )}
                  </div>

                  {/* Trust Elements Preview */}
                  {config.showTrustElements && (
                    <>
                      <Separator />
                      <div className="flex flex-wrap justify-center gap-3">
                        {[1, 2, 3, 4].map((i) => {
                          const text = (config as Record<string, unknown>)[`trustElement${i}Text`] as string
                          if (!text) return null
                          return (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-emerald-500" />
                              {text}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Links */}
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/preise" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live-Seite öffnen
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

