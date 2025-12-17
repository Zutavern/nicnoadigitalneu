'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  useEffect(() => {
    fetchSettings()
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
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Fehler beim Laden der Einstellungen')
    } finally {
      setIsLoading(false)
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
        <Card className={`border-2 ${useDemoMode ? 'border-slate-700/50 dark:border-amber-500/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-amber-500/5 dark:via-amber-500/5 dark:to-amber-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${useDemoMode ? 'bg-purple-500/20 dark:bg-amber-500/10' : 'bg-green-500/10'}`}>
                  {useDemoMode ? (
                    <FlaskConical className="h-6 w-6 text-purple-400 dark:text-amber-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${useDemoMode ? 'text-white' : ''}`}>
                    {useDemoMode ? 'Demo-Modus aktiv' : 'Live-Modus aktiv'}
                    {useDemoMode && (
                      <Badge variant="outline" className="text-purple-400 dark:text-amber-500 border-purple-500/30 dark:border-amber-500/30">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Testdaten
                      </Badge>
                    )}
                  </h3>
                  <p className={`text-sm max-w-lg ${useDemoMode ? 'text-slate-300 dark:text-muted-foreground' : 'text-muted-foreground'}`}>
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
                  <span className={`text-sm font-medium ${useDemoMode ? 'text-white' : ''}`}>
                    {useDemoMode ? 'Demo' : 'Live'}
                  </span>
                  <span className={`text-xs ${useDemoMode ? 'text-slate-400 dark:text-muted-foreground' : 'text-muted-foreground'}`}>
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
              <div className="mt-4 pt-4 border-t border-slate-600/50 dark:border-amber-500/20">
                <Label htmlFor="demoMessage" className="text-sm text-slate-400 dark:text-muted-foreground">
                  Hinweistext für Benutzer
                </Label>
                <Input
                  id="demoMessage"
                  value={demoModeMessage}
                  onChange={(e) => setDemoModeMessage(e.target.value)}
                  placeholder="Demo-Modus aktiv - Es werden Beispieldaten angezeigt"
                  className="mt-1.5 bg-slate-700/50 dark:bg-background/50 border-slate-600/50 dark:border-input text-white dark:text-foreground"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
          <TabsTrigger value="email">E-Mail</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
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
                  { label: 'App URL', value: typeof window !== 'undefined' ? window.location.origin : 'https://app.nicnoa.online' },
                  { label: 'API Endpoint', value: typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://app.nicnoa.online/api' },
                  { label: 'Webhook URL', value: typeof window !== 'undefined' ? `${window.location.origin}/api/stripe/webhook` : 'https://app.nicnoa.online/api/stripe/webhook' },
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
                      placeholder="noreply@nicnoa.online" 
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
                    placeholder="noreply@nicnoa.online"
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

      </Tabs>
    </div>
  )
}
