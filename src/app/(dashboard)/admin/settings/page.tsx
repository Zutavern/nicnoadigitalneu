'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Bell,
  Save,
  RefreshCw,
  Upload,
  ExternalLink,
  Zap,
  Check,
  Copy,
  Loader2,
  FlaskConical,
  AlertTriangle,
  Lock,
  Shield,
  Languages,
  Eye,
  EyeOff,
  Bot,
  TrendingUp,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquareQuote,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Code2,
} from 'lucide-react'
import { POPULAR_MODELS } from '@/lib/openrouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { DesignSystemSection } from '@/components/admin/design-system-section'

interface PlatformSettings {
  id: string
  companyName: string
  supportEmail: string
  supportPhone: string | null
  defaultLanguage: string
  timezone: string
  currency: string
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string | null
  trialDays: number
  smtpHost: string | null
  smtpPort: number | null
  smtpUser: string | null
  smtpPassword: string | null
  smtpFrom: string | null
  smtpSecure: boolean
  googleAnalyticsId: string | null
  useDemoMode: boolean
  demoModeMessage: string | null
  passwordProtectionEnabled: boolean
  // Übersetzungs-API
  deeplApiKey: string | null
  openaiApiKey: string | null
  translationProvider: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Form state
  const [companyName, setCompanyName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')
  const [defaultLanguage, setDefaultLanguage] = useState('de')
  const [timezone, setTimezone] = useState('Europe/Berlin')
  const [currency, setCurrency] = useState('EUR')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [trialDays, setTrialDays] = useState('14')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFrom, setSmtpFrom] = useState('')
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [useDemoMode, setUseDemoMode] = useState(true)
  const [demoModeMessage, setDemoModeMessage] = useState('Demo-Modus aktiv - Es werden Beispieldaten angezeigt')
  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(true)
  // Übersetzungs-API
  const [deeplApiKey, setDeeplApiKey] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [translationProvider, setTranslationProvider] = useState('auto')
  const [showDeeplKey, setShowDeeplKey] = useState(false)
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  
  // OpenRouter
  const [openRouterApiKey, setOpenRouterApiKey] = useState('')
  const [openRouterEnabled, setOpenRouterEnabled] = useState(false)
  const [openRouterDefaultModel, setOpenRouterDefaultModel] = useState('openai/gpt-4o-mini')
  const [openRouterSiteUrl, setOpenRouterSiteUrl] = useState('https://nicnoa.de')
  const [openRouterSiteName, setOpenRouterSiteName] = useState('NICNOA Platform')
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)
  const [isTestingOpenRouter, setIsTestingOpenRouter] = useState(false)
  const [openRouterUsage, setOpenRouterUsage] = useState<{
    today: { totalCostUsd: number; totalRequests: number }
    thisMonth: { totalCostUsd: number; totalRequests: number }
  } | null>(null)
  
  // Tone of Voice
  const [blogToneOfVoice, setBlogToneOfVoice] = useState('')
  const [blogToneOfVoicePrompt, setBlogToneOfVoicePrompt] = useState('')
  const [blogArticleSystemPrompt, setBlogArticleSystemPrompt] = useState('')
  const [defaultArticlePrompt, setDefaultArticlePrompt] = useState('')
  const [showArticlePrompt, setShowArticlePrompt] = useState(false)
  const [isSavingTone, setIsSavingTone] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchOpenRouterConfig()
    fetchToneOfVoice()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data)
      
      // Set form values
      setCompanyName(data.companyName || '')
      setSupportEmail(data.supportEmail || '')
      setSupportPhone(data.supportPhone || '')
      setDefaultLanguage(data.defaultLanguage || 'de')
      setTimezone(data.timezone || 'Europe/Berlin')
      setCurrency(data.currency || 'EUR')
      setPrimaryColor(data.primaryColor || '#6366f1')
      setTrialDays(String(data.trialDays || 14))
      setSmtpHost(data.smtpHost || '')
      setSmtpPort(data.smtpPort ? String(data.smtpPort) : '')
      setSmtpUser(data.smtpUser || '')
      setSmtpPassword(data.smtpPassword || '')
      setSmtpFrom(data.smtpFrom || '')
      setGoogleAnalyticsId(data.googleAnalyticsId || '')
      setUseDemoMode(data.useDemoMode ?? true)
      setDemoModeMessage(data.demoModeMessage || 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt')
      setPasswordProtectionEnabled(data.passwordProtectionEnabled ?? true)
      // Übersetzungs-API - nur Masken anzeigen wenn vorhanden
      setDeeplApiKey(data.deeplApiKey ? '••••••••••••••••' : '')
      setOpenaiApiKey(data.openaiApiKey ? '••••••••••••••••' : '')
      setTranslationProvider(data.translationProvider || 'auto')
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Fehler beim Laden der Einstellungen')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOpenRouterConfig = async () => {
    try {
      const [configRes, usageRes] = await Promise.all([
        fetch('/api/admin/openrouter'),
        fetch('/api/admin/openrouter/usage?period=month'),
      ])
      
      if (configRes.ok) {
        const config = await configRes.json()
        setOpenRouterApiKey(config.hasApiKey ? '••••••••••••••••' : '')
        setOpenRouterEnabled(config.openRouterEnabled)
        setOpenRouterDefaultModel(config.openRouterDefaultModel || 'openai/gpt-4o-mini')
        setOpenRouterSiteUrl(config.openRouterSiteUrl || 'https://nicnoa.de')
        setOpenRouterSiteName(config.openRouterSiteName || 'NICNOA Platform')
      }
      
      if (usageRes.ok) {
        const usage = await usageRes.json()
        setOpenRouterUsage({
          today: usage.today,
          thisMonth: usage.thisMonth,
        })
      }
    } catch (error) {
      console.error('Error fetching OpenRouter config:', error)
    }
  }

  const saveOpenRouterConfig = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/openrouter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openRouterApiKey: openRouterApiKey !== '••••••••••••••••' ? openRouterApiKey : undefined,
          openRouterEnabled,
          openRouterDefaultModel,
          openRouterSiteUrl,
          openRouterSiteName,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save')
      
      const data = await res.json()
      setOpenRouterApiKey(data.hasApiKey ? '••••••••••••••••' : '')
      toast.success('OpenRouter-Einstellungen gespeichert!')
    } catch (error) {
      console.error('Error saving OpenRouter config:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const testOpenRouterKey = async () => {
    if (!openRouterApiKey || openRouterApiKey === '••••••••••••••••') {
      toast.error('Bitte gib einen API Key ein')
      return
    }

    setIsTestingOpenRouter(true)
    try {
      const res = await fetch('/api/admin/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openRouterApiKey }),
      })

      const data = await res.json()

      if (data.valid) {
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Ungültiger API Key')
      }
    } catch (error) {
      toast.error('Verbindungsfehler')
    } finally {
      setIsTestingOpenRouter(false)
    }
  }

  const fetchToneOfVoice = async () => {
    try {
      const res = await fetch('/api/admin/tone-of-voice')
      if (res.ok) {
        const data = await res.json()
        setBlogToneOfVoice(data.blogToneOfVoice || '')
        setBlogToneOfVoicePrompt(data.blogToneOfVoicePrompt || '')
        setBlogArticleSystemPrompt(data.blogArticleSystemPrompt || '')
        setDefaultArticlePrompt(data.defaultArticlePrompt || '')
      }
    } catch (error) {
      console.error('Error fetching tone of voice:', error)
    }
  }

  const saveToneOfVoice = async () => {
    setIsSavingTone(true)
    try {
      const res = await fetch('/api/admin/tone-of-voice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogToneOfVoice,
          blogToneOfVoicePrompt,
          blogArticleSystemPrompt,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success('Tone of Voice gespeichert!')
    } catch (error) {
      console.error('Error saving tone of voice:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingTone(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          supportEmail,
          supportPhone: supportPhone || null,
          defaultLanguage,
          timezone,
          currency,
          primaryColor,
          trialDays: parseInt(trialDays),
          smtpHost: smtpHost || null,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser: smtpUser || null,
          smtpPassword: smtpPassword !== '••••••••' ? smtpPassword : undefined,
          smtpFrom: smtpFrom || null,
          googleAnalyticsId: googleAnalyticsId || null,
          useDemoMode,
          demoModeMessage: demoModeMessage || null,
          passwordProtectionEnabled,
          // Nur senden wenn geändert (nicht die Maske)
          deeplApiKey: deeplApiKey !== '••••••••••••••••' ? deeplApiKey : undefined,
          openaiApiKey: openaiApiKey !== '••••••••••••••••' ? openaiApiKey : undefined,
          translationProvider,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save settings')
      
      const data = await res.json()
      setSettings(data)
      toast.success('Einstellungen gespeichert!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Einstellungen
          </h1>
          <p className="text-muted-foreground">
            Plattform-Konfiguration und Systemeinstellungen
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Änderungen speichern
        </Button>
      </div>

      {/* Demo Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`border-2 ${useDemoMode ? 'border-amber-500/50 bg-amber-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${useDemoMode ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                  {useDemoMode ? (
                    <FlaskConical className="h-6 w-6 text-amber-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {useDemoMode ? 'Demo-Modus aktiv' : 'Live-Modus aktiv'}
                    {useDemoMode && (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Testdaten
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    {useDemoMode ? (
                      'Es werden überall Demo-Daten angezeigt. Dashboard-Statistiken, Subscriptions und Revenue-Daten sind simuliert. Schalte auf Live-Modus um, sobald Stripe konfiguriert ist.'
                    ) : (
                      'Echte Daten werden angezeigt. Dashboard zeigt reale Statistiken und Stripe-Daten.'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium">
                    {useDemoMode ? 'Demo' : 'Live'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Daten-Modus
                  </span>
                </div>
                <Switch
                  checked={!useDemoMode}
                  onCheckedChange={(checked) => setUseDemoMode(!checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
            {useDemoMode && (
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <Label htmlFor="demoMessage" className="text-sm text-muted-foreground">
                  Hinweistext für Benutzer
                </Label>
                <Input
                  id="demoMessage"
                  value={demoModeMessage}
                  onChange={(e) => setDemoModeMessage(e.target.value)}
                  placeholder="Demo-Modus aktiv - Es werden Beispieldaten angezeigt"
                  className="mt-1.5 bg-background/50"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
          <TabsTrigger value="email">E-Mail</TabsTrigger>
          <TabsTrigger value="translations">Übersetzungen</TabsTrigger>
          <TabsTrigger value="openrouter" className="gap-1">
            <Bot className="h-3.5 w-3.5" />
            OpenRouter
          </TabsTrigger>
          <TabsTrigger value="tone" className="gap-1">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Tone
          </TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Einstellungen</CardTitle>
                <CardDescription>Grundlegende Plattform-Konfiguration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmenname</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support E-Mail</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Telefon</Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Standardsprache</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zeitzone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Berlin">Europe/Berlin (MEZ)</SelectItem>
                        <SelectItem value="Europe/Vienna">Europe/Vienna (MEZ)</SelectItem>
                        <SelectItem value="Europe/Zurich">Europe/Zurich (MEZ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Währung</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>System-URLs</CardTitle>
                <CardDescription>Wichtige Endpunkte Ihrer Plattform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'App URL', value: typeof window !== 'undefined' ? window.location.origin : 'https://app.nicnoa.de' },
                  { label: 'API Endpoint', value: typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://app.nicnoa.de/api' },
                  { label: 'Webhook URL', value: typeof window !== 'undefined' ? `${window.location.origin}/api/stripe/webhook` : 'https://app.nicnoa.de/api/stripe/webhook' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <code className="text-sm text-muted-foreground">{item.value}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(item.value, item.label)}
                    >
                      {copied === item.label ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <DesignSystemSection />
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Abrechnungseinstellungen</CardTitle>
                <CardDescription>Stripe-Integration und Preiskonfiguration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-medium">Stripe-Verbindung</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Verbunden' : 'Nicht konfiguriert'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                      ? 'Ihr Stripe-Konto ist erfolgreich verbunden. Alle Zahlungen werden über Stripe abgewickelt.'
                      : 'Stripe ist noch nicht konfiguriert. Fügen Sie STRIPE_SECRET_KEY zu Ihren Umgebungsvariablen hinzu.'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Stripe Dashboard
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="trialDays">Testphase (Tage)</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      max="90"
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Standardmäßige Testphase für neue Abonnements
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Webhook-Endpunkt</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-sm">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/stripe/webhook` : '/api/stripe/webhook'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(
                        typeof window !== 'undefined' ? `${window.location.origin}/api/stripe/webhook` : '/api/stripe/webhook',
                        'webhook'
                      )}
                    >
                      {copied === 'webhook' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Einstellungen</CardTitle>
                <CardDescription>SMTP-Konfiguration für System-E-Mails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input 
                      id="smtpHost"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.example.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Benutzername</Label>
                    <Input 
                      id="smtpUser"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="noreply@nicnoa.de" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Passwort</Label>
                    <Input 
                      id="smtpPassword"
                      type="password" 
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpFrom">Absender-Adresse</Label>
                  <Input 
                    id="smtpFrom"
                    type="email"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    placeholder="noreply@nicnoa.de"
                  />
                </div>

                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Test-E-Mail senden
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Translation Settings */}
        <TabsContent value="translations" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  Übersetzungs-API
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie die API-Schlüssel für automatische Übersetzungen. 
                  DeepL wird bevorzugt, OpenAI dient als Fallback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status-Übersicht */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`p-4 rounded-lg border ${deeplApiKey ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">DeepL</span>
                      <Badge className={deeplApiKey ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                        {deeplApiKey ? 'Konfiguriert' : 'Nicht konfiguriert'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hochwertige Übersetzungen für die meisten europäischen Sprachen
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border ${openaiApiKey ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">OpenAI</span>
                      <Badge className={openaiApiKey ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                        {openaiApiKey ? 'Konfiguriert' : 'Nicht konfiguriert'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fallback für Sprachen, die DeepL nicht unterstützt (z.B. Kroatisch)
                    </p>
                  </div>
                </div>

                {/* Provider-Auswahl */}
                <div className="space-y-2">
                  <Label>Bevorzugter Übersetzungsdienst</Label>
                  <Select value={translationProvider} onValueChange={setTranslationProvider}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatisch (DeepL bevorzugt)</SelectItem>
                      <SelectItem value="deepl">Nur DeepL</SelectItem>
                      <SelectItem value="openai">Nur OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    &quot;Automatisch&quot; nutzt DeepL wenn verfügbar, sonst OpenAI
                  </p>
                </div>

                {/* DeepL API Key */}
                <div className="space-y-2">
                  <Label htmlFor="deeplApiKey">DeepL API-Schlüssel</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="deeplApiKey"
                        type={showDeeplKey ? 'text' : 'password'}
                        value={deeplApiKey}
                        onChange={(e) => setDeeplApiKey(e.target.value)}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowDeeplKey(!showDeeplKey)}
                      >
                        {showDeeplKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.deepl.com/pro-api', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      API Key holen
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Free-Keys enden mit &quot;:fx&quot;, Pro-Keys ohne Suffix
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API-Schlüssel</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="openaiApiKey"
                        type={showOpenaiKey ? 'text' : 'password'}
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      >
                        {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      API Key holen
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verwendet GPT-4o-mini für kostengünstige Übersetzungen
                  </p>
                </div>

                {/* Hinweis wenn keine Keys */}
                {!deeplApiKey && !openaiApiKey && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-500">Keine API-Schlüssel konfiguriert</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Für automatische Übersetzungen benötigen Sie mindestens einen API-Schlüssel 
                          (DeepL oder OpenAI). Ohne konfigurierte Keys können keine Übersetzungen 
                          durchgeführt werden.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* OpenRouter Settings */}
        <TabsContent value="openrouter" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status-Karten */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {openRouterEnabled && openRouterApiKey ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">
                        {openRouterEnabled && openRouterApiKey ? 'Aktiv' : 'Inaktiv'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Heute</p>
                      <p className="font-semibold">
                        ${openRouterUsage?.today.totalCostUsd.toFixed(4) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dieser Monat</p>
                      <p className="font-semibold">
                        ${openRouterUsage?.thisMonth.totalCostUsd.toFixed(4) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Anfragen (Monat)</p>
                      <p className="font-semibold">
                        {openRouterUsage?.thisMonth.totalRequests || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Konfiguration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  OpenRouter Konfiguration
                </CardTitle>
                <CardDescription>
                  OpenRouter ist ein KI-Gateway, das Zugriff auf verschiedene LLM-Modelle bietet.
                  Nutzer können so auf einem gemeinsamen Gateway KI-Funktionen nutzen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-base">OpenRouter aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Aktiviert den OpenRouter-Gateway für AI-Funktionen
                    </p>
                  </div>
                  <Switch
                    checked={openRouterEnabled}
                    onCheckedChange={setOpenRouterEnabled}
                  />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="openRouterApiKey">API-Schlüssel</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="openRouterApiKey"
                        type={showOpenRouterKey ? 'text' : 'password'}
                        value={openRouterApiKey}
                        onChange={(e) => setOpenRouterApiKey(e.target.value)}
                        placeholder="sk-or-v1-..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                      >
                        {showOpenRouterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={testOpenRouterKey}
                      disabled={isTestingOpenRouter}
                    >
                      {isTestingOpenRouter ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      Testen
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      API Key holen
                    </Button>
                  </div>
                </div>

                {/* Default Model */}
                <div className="space-y-2">
                  <Label>Standard-Modell</Label>
                  <Select value={openRouterDefaultModel} onValueChange={setOpenRouterDefaultModel}>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">({model.provider})</span>
                            {model.recommended && (
                              <Badge variant="secondary" className="text-xs">Empfohlen</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wird für Übersetzungen und AI-Funktionen verwendet
                  </p>
                </div>

                {/* Site Attribution */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openRouterSiteUrl">Site URL</Label>
                    <Input
                      id="openRouterSiteUrl"
                      value={openRouterSiteUrl}
                      onChange={(e) => setOpenRouterSiteUrl(e.target.value)}
                      placeholder="https://nicnoa.de"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird als HTTP-Referer an OpenRouter gesendet
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openRouterSiteName">Site Name</Label>
                    <Input
                      id="openRouterSiteName"
                      value={openRouterSiteName}
                      onChange={(e) => setOpenRouterSiteName(e.target.value)}
                      placeholder="NICNOA Platform"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird als X-Title Header an OpenRouter gesendet
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-500">Über OpenRouter</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        OpenRouter bietet Zugang zu verschiedenen KI-Modellen über eine einheitliche API.
                        Die Kosten werden pro Anfrage berechnet und hier nachverfolgt.
                        Stuhlmieter und Salonbesitzer können über diesen Gateway AI-Funktionen nutzen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={saveOpenRouterConfig} disabled={isSaving} className="w-full">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              OpenRouter-Einstellungen speichern
            </Button>
          </motion.div>
        </TabsContent>

        {/* Tone of Voice Settings */}
        <TabsContent value="tone" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-primary" />
                  Tone of Voice für Blog-Artikel
                </CardTitle>
                <CardDescription>
                  Definiere den Schreibstil und die Tonalität für KI-generierte Blog-Artikel.
                  Diese Einstellungen werden beim Generieren von Artikeln verwendet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tone Templates */}
                <div className="space-y-3">
                  <Label>Schnellauswahl (Template)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'professional', label: 'Professionell', desc: 'Sachlich, kompetent, vertrauenswürdig' },
                      { id: 'friendly', label: 'Freundlich', desc: 'Warm, einladend, zugänglich' },
                      { id: 'expert', label: 'Experte', desc: 'Fachkundig, detailliert, tiefgehend' },
                      { id: 'casual', label: 'Locker', desc: 'Entspannt, modern, nahbar' },
                    ].map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          const templates: Record<string, { voice: string; prompt: string }> = {
                            professional: {
                              voice: 'Professionell und sachlich',
                              prompt: 'Schreibe in einem professionellen, sachlichen Ton. Verwende klare, präzise Sprache. Vermeide übertriebene Adjektive. Fokussiere auf Fakten und Mehrwert für den Leser. Nutze eine formelle, aber zugängliche Ansprache.',
                            },
                            friendly: {
                              voice: 'Freundlich und einladend',
                              prompt: 'Schreibe in einem warmen, freundlichen Ton. Sprich den Leser direkt an (Du-Form). Verwende eine einladende Sprache und schaffe eine persönliche Verbindung. Erkläre komplexe Themen einfach und verständlich.',
                            },
                            expert: {
                              voice: 'Fachkundig und detailliert',
                              prompt: 'Schreibe als Branchenexperte mit tiefem Fachwissen. Verwende Fachbegriffe (aber erkläre sie). Gehe ins Detail und liefere fundierte Einblicke. Unterstütze Aussagen mit Beispielen und Best Practices.',
                            },
                            casual: {
                              voice: 'Locker und modern',
                              prompt: 'Schreibe in einem lockeren, modernen Stil. Verwende eine ungezwungene Sprache und aktuelle Ausdrücke. Bring gerne etwas Humor ein. Halte Sätze kurz und knackig. Sprich den Leser direkt an.',
                            },
                          }
                          const selected = templates[template.id]
                          setBlogToneOfVoice(selected.voice)
                          setBlogToneOfVoicePrompt(selected.prompt)
                        }}
                        className="p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium text-sm">{template.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Description */}
                <div className="space-y-2">
                  <Label htmlFor="blogToneOfVoice">Tone of Voice Beschreibung</Label>
                  <Input
                    id="blogToneOfVoice"
                    value={blogToneOfVoice}
                    onChange={(e) => setBlogToneOfVoice(e.target.value)}
                    placeholder="z.B. Professionell, aber zugänglich"
                  />
                  <p className="text-xs text-muted-foreground">
                    Eine kurze Beschreibung des gewünschten Schreibstils
                  </p>
                </div>

                {/* System Prompt Extension */}
                <div className="space-y-2">
                  <Label htmlFor="blogToneOfVoicePrompt">
                    System-Prompt für KI
                    <span className="text-muted-foreground font-normal ml-2">(Detaillierte Anweisungen)</span>
                  </Label>
                  <Textarea
                    id="blogToneOfVoicePrompt"
                    value={blogToneOfVoicePrompt}
                    onChange={(e) => setBlogToneOfVoicePrompt(e.target.value)}
                    placeholder="Schreibe in einem professionellen, aber zugänglichen Ton. Verwende klare, präzise Sprache..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Diese Anweisungen werden dem KI-System mitgegeben, um den Schreibstil zu definieren
                  </p>
                </div>

                {/* Preview */}
                {blogToneOfVoicePrompt && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Vorschau: So wird die KI instruiert</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{blogToneOfVoicePrompt}&quot;
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquareQuote className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-500">Tipps für gute Ergebnisse</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>Beschreibe den gewünschten Stil konkret und mit Beispielen</li>
                        <li>Definiere die Zielgruppe (z.B. &quot;für Salon-Besitzer&quot;)</li>
                        <li>Gib an, welche Sprache verwendet werden soll (Du/Sie)</li>
                        <li>Erwähne, ob Fachbegriffe erklärt werden sollen</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vollständiger Artikel-Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  Vollständiger System-Prompt
                </CardTitle>
                <CardDescription>
                  Dieser Prompt wird für die KI-Artikelgenerierung verwendet. 
                  Wenn du ihn hier speicherst, wird er immer angewendet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Collapsible open={showArticlePrompt} onOpenChange={setShowArticlePrompt}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>System-Prompt {blogArticleSystemPrompt ? '(angepasst)' : '(Standard)'}</span>
                      {showArticlePrompt ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>System-Prompt für Artikelgenerierung</Label>
                        {blogArticleSystemPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBlogArticleSystemPrompt('')}
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Auf Standard zurücksetzen
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={blogArticleSystemPrompt || defaultArticlePrompt}
                        onChange={(e) => setBlogArticleSystemPrompt(e.target.value)}
                        rows={16}
                        className="font-mono text-xs"
                        placeholder={defaultArticlePrompt}
                      />
                    </div>
                    
                    {/* Platzhalter-Erklärung */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Verfügbare Platzhalter:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 font-mono">
                        <li><code className="bg-muted px-1 rounded">{'{{TONE_OF_VOICE}}'}</code> - Dein Tone of Voice Prompt</li>
                        <li><code className="bg-muted px-1 rounded">{'{{ARTICLE_TYPE}}'}</code> - Gewählter Artikeltyp</li>
                        <li><code className="bg-muted px-1 rounded">{'{{LENGTH_WORDS}}'}</code> - Wortanzahl</li>
                        <li><code className="bg-muted px-1 rounded">{'{{LENGTH_PARAGRAPHS}}'}</code> - Absatzanzahl</li>
                        <li><code className="bg-muted px-1 rounded">{'{{QUOTES}}'}</code> - Zitat-Anweisung</li>
                        <li><code className="bg-muted px-1 rounded">{'{{STATISTICS}}'}</code> - Statistik-Anweisung</li>
                        <li><code className="bg-muted px-1 rounded">{'{{CATEGORY}}'}</code> - Kategoriename</li>
                      </ul>
                    </div>

                    {blogArticleSystemPrompt && blogArticleSystemPrompt !== defaultArticlePrompt && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✓ Ein angepasster Prompt ist aktiv und wird bei jeder Generierung verwendet.
                        </p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={saveToneOfVoice} disabled={isSavingTone} className="w-full">
              {isSavingTone ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Tone of Voice speichern
            </Button>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Sicherheitseinstellungen
                </CardTitle>
                <CardDescription>Plattform-weite Sicherheitskonfiguration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Passwort-Schutz</h3>
                      <p className="text-sm text-muted-foreground">
                        Aktiviert einen Session-basierten Passwort-Schutz für alle Benutzer beim ersten Seitenaufruf.
                        Das Passwort muss einmalig pro Browser-Session eingegeben werden.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium">
                        {passwordProtectionEnabled ? 'Aktiviert' : 'Deaktiviert'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Session-Schutz
                      </span>
                    </div>
                    <Switch
                      checked={passwordProtectionEnabled}
                      onCheckedChange={setPasswordProtectionEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
                
                {passwordProtectionEnabled && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Hinweis:</strong> Der Passwort-Schutz ist aktiviert. Alle Benutzer müssen beim ersten Seitenaufruf 
                      einer neuen Browser-Session das Zugangspasswort eingeben. Das Passwort wird in der Session gespeichert 
                      und muss nicht erneut eingegeben werden, solange der Browser-Tab geöffnet bleibt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { name: 'Stripe', description: 'Zahlungsabwicklung', connected: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, icon: CreditCard },
                { name: 'Google Calendar', description: 'Kalender-Synchronisation', connected: false, icon: Globe },
                { name: 'Slack', description: 'Team-Benachrichtigungen', connected: false, icon: Bell },
                { name: 'Zapier', description: 'Workflow-Automatisierung', connected: false, icon: Zap },
              ].map((integration) => (
                <Card key={integration.name}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {integration.connected ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Verbunden
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Verbinden
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
