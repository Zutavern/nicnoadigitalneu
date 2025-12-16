'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Settings,
  CreditCard,
  Clock,
  Percent,
  Tag,
  Shield,
  Zap,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Calendar,
  Ticket,
  RefreshCw,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillingSettings {
  id: string
  monthlyEnabled: boolean
  quarterlyEnabled: boolean
  sixMonthsEnabled: boolean
  yearlyEnabled: boolean
  monthlyDiscount: number
  quarterlyDiscount: number
  sixMonthsDiscount: number
  yearlyDiscount: number
  defaultInterval: string
  defaultTrialDays: number
  trialEnabled: boolean
  trialRequiresCard: boolean
  currency: string
  currencySign: string
  couponsEnabled: boolean
  showCouponOnPricing: boolean
  moneyBackEnabled: boolean
  moneyBackDays: number
  webhookStatus: string
  webhookLastPing: string | null
}

const intervals = [
  { id: 'monthly', label: '1 Monat', key: 'monthlyEnabled', discountKey: 'monthlyDiscount' },
  { id: 'quarterly', label: '3 Monate', key: 'quarterlyEnabled', discountKey: 'quarterlyDiscount' },
  { id: 'sixMonths', label: '6 Monate', key: 'sixMonthsEnabled', discountKey: 'sixMonthsDiscount' },
  { id: 'yearly', label: '12 Monate', key: 'yearlyEnabled', discountKey: 'yearlyDiscount' },
]

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [stripeConfigured, setStripeConfigured] = useState(false)
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/billing-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setStripeConfigured(data.stripeConfigured)
        setStripeMode(data.stripeMode)
      } else {
        toast.error('Fehler beim Laden der Einstellungen')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Netzwerkfehler')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = <K extends keyof BillingSettings>(key: K, value: BillingSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    setHasChanges(true)
  }

  const saveSettings = async () => {
    if (!settings) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/billing-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        toast.success('Einstellungen erfolgreich gespeichert')
        setHasChanges(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Netzwerkfehler')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Keine Einstellungen gefunden</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing-Einstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Konfigurieren Sie Ihre SaaS-Preise, Intervalle und Stripe-Integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stripe Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "border-2",
          stripeConfigured ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
        )}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stripeConfigured ? "bg-emerald-500/20" : "bg-amber-500/20"
              )}>
                <CreditCard className={cn(
                  "w-6 h-6",
                  stripeConfigured ? "text-emerald-500" : "text-amber-500"
                )} />
              </div>
              <div>
                <p className="font-semibold">Stripe Integration</p>
                <p className="text-sm text-muted-foreground">
                  {stripeConfigured ? (
                    <>Status: Verbunden ({stripeMode === 'live' ? 'Live-Modus' : 'Test-Modus'})</>
                  ) : (
                    'Nicht konfiguriert - Bitte Stripe API-Keys in .env hinterlegen'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stripeConfigured ? (
                <Badge className="bg-emerald-500 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {stripeMode === 'live' ? 'Live' : 'Test'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Nicht verbunden
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="intervals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="intervals" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Laufzeiten</span>
          </TabsTrigger>
          <TabsTrigger value="trial" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Testphase</span>
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Coupons</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Allgemein</span>
          </TabsTrigger>
        </TabsList>

        {/* Laufzeiten Tab */}
        <TabsContent value="intervals">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Billing-Intervalle
                </CardTitle>
                <CardDescription>
                  Aktivieren oder deaktivieren Sie Laufzeit-Optionen und legen Sie Rabatte fest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {intervals.map((interval, index) => (
                    <motion.div
                      key={interval.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        settings[interval.key as keyof BillingSettings] 
                          ? "bg-card border-border" 
                          : "bg-muted/30 border-muted"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={settings[interval.key as keyof BillingSettings] as boolean}
                          onCheckedChange={(checked) => updateSetting(interval.key as keyof BillingSettings, checked as never)}
                        />
                        <div>
                          <p className="font-medium">{interval.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {interval.id === 'monthly' && 'Monatliche Abrechnung'}
                            {interval.id === 'quarterly' && 'Vierteljährliche Abrechnung'}
                            {interval.id === 'sixMonths' && 'Halbjährliche Abrechnung'}
                            {interval.id === 'yearly' && 'Jährliche Abrechnung'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">Rabatt</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              max={99}
                              value={settings[interval.discountKey as keyof BillingSettings] as number}
                              onChange={(e) => updateSetting(interval.discountKey as keyof BillingSettings, Number(e.target.value) as never)}
                              className="w-20 pr-6"
                              disabled={!(settings[interval.key as keyof BillingSettings] as boolean)}
                            />
                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        {settings.defaultInterval === interval.id && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Standard
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Standard-Intervall</Label>
                    <p className="text-sm text-muted-foreground">
                      Dieses Intervall wird auf der Preisseite vorausgewählt
                    </p>
                  </div>
                  <Select
                    value={settings.defaultInterval}
                    onValueChange={(value) => updateSetting('defaultInterval', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {intervals
                        .filter(i => settings[i.key as keyof BillingSettings])
                        .map(interval => (
                          <SelectItem key={interval.id} value={interval.id}>
                            {interval.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trial Tab */}
        <TabsContent value="trial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Testphasen-Einstellungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie die kostenlose Testphase für neue Nutzer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Testphase aktiviert</p>
                    <p className="text-sm text-muted-foreground">
                      Neue Nutzer können den Service kostenlos testen
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.trialEnabled}
                  onCheckedChange={(checked) => updateSetting('trialEnabled', checked)}
                />
              </div>

              {settings.trialEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Anzahl Testtage</Label>
                      <Input
                        type="number"
                        min={1}
                        max={90}
                        value={settings.defaultTrialDays}
                        onChange={(e) => updateSetting('defaultTrialDays', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Empfohlen: 7-14 Tage
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Kreditkarte erforderlich</Label>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">Für Trial-Start</span>
                        <Switch
                          checked={settings.trialRequiresCard}
                          onCheckedChange={(checked) => updateSetting('trialRequiresCard', checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {settings.trialRequiresCard 
                          ? 'Nutzer müssen Zahlungsdaten angeben'
                          : 'Keine Zahlungsdaten für Trial nötig'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Coupon-Einstellungen
                </CardTitle>
                <CardDescription>
                  Aktivieren Sie Promo-Codes und Rabattaktionen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Coupons aktiviert</p>
                      <p className="text-sm text-muted-foreground">
                        Nutzer können Promo-Codes beim Checkout eingeben
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.couponsEnabled}
                    onCheckedChange={(checked) => updateSetting('couponsEnabled', checked)}
                  />
                </div>

                {settings.couponsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Coupon-Feld auf Preisseite</p>
                        <p className="text-sm text-muted-foreground">
                          Zeigt ein Eingabefeld für Codes auf der öffentlichen Preisseite
                        </p>
                      </div>
                      <Switch
                        checked={settings.showCouponOnPricing}
                        onCheckedChange={(checked) => updateSetting('showCouponOnPricing', checked)}
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Coupons verwalten</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Erstellen und verwalten Sie Promo-Codes in der Coupon-Verwaltung.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/admin/coupons">
                          Zur Coupon-Verwaltung
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid gap-6">
            {/* Währung */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Währung
                </CardTitle>
                <CardDescription>
                  Legen Sie die Standardwährung für alle Preise fest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Währungscode</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => {
                        updateSetting('currency', value)
                        if (value === 'EUR') updateSetting('currencySign', '€')
                        if (value === 'USD') updateSetting('currencySign', '$')
                        if (value === 'GBP') updateSetting('currencySign', '£')
                        if (value === 'CHF') updateSetting('currencySign', 'CHF')
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="GBP">GBP - Britisches Pfund</SelectItem>
                        <SelectItem value="CHF">CHF - Schweizer Franken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Währungszeichen</Label>
                    <Input
                      value={settings.currencySign}
                      onChange={(e) => updateSetting('currencySign', e.target.value)}
                      maxLength={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Geld-zurück-Garantie
                </CardTitle>
                <CardDescription>
                  Bieten Sie Ihren Kunden eine Zufriedenheitsgarantie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">Garantie aktiviert</p>
                      <p className="text-sm text-muted-foreground">
                        Wird auf der Preisseite angezeigt
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.moneyBackEnabled}
                    onCheckedChange={(checked) => updateSetting('moneyBackEnabled', checked)}
                  />
                </div>

                {settings.moneyBackEnabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <Label>Anzahl Garantie-Tage</Label>
                    <Input
                      type="number"
                      min={7}
                      max={365}
                      value={settings.moneyBackDays}
                      onChange={(e) => updateSetting('moneyBackDays', Number(e.target.value))}
                      className="max-w-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Empfohlen: 30 Tage
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

