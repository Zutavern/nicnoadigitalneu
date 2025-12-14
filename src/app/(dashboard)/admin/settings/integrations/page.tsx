'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Save,
  RefreshCw,
  Loader2,
  Check,
  X,
  Eye,
  EyeOff,
  Zap,
  Bot,
  MessageSquare,
  BarChart3,
  Video,
  CreditCard,
  Globe,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
  Mail,
  Phone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import Link from 'next/link'

// OpenRouter Modelle
const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', recommended: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta' },
]

interface IntegrationSettings {
  // OpenRouter / AI
  openRouterApiKey: string | null
  openRouterEnabled: boolean
  openRouterDefaultModel: string | null
  openRouterSiteUrl: string | null
  openRouterSiteName: string | null
  
  // DeepL
  deeplApiKey: string | null
  translationProvider: string | null
  
  // Pusher
  pusherAppId: string | null
  pusherKey: string | null
  pusherSecret: string | null
  pusherCluster: string | null
  pusherEnabled: boolean
  
  // PostHog
  posthogApiKey: string | null
  posthogHost: string | null
  posthogPersonalApiKey: string | null
  posthogProjectId: string | null
  posthogEnabled: boolean
  
  // Daily.co
  dailyApiKey: string | null
  dailyEnabled: boolean
  
  // Resend
  resendApiKey: string | null
  resendEnabled: boolean
  resendFromEmail: string | null
  resendFromName: string | null
  resendWebhookSecret: string | null
  
  // seven.io SMS
  sevenIoApiKey: string | null
  sevenIoEnabled: boolean
  sevenIoSenderId: string | null
  sevenIoTestNumbers: string | null
  
  // Stripe (read-only, aus env)
  stripeConfigured: boolean
}

export default function IntegrationsPage() {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  // Form States
  const [openRouterApiKey, setOpenRouterApiKey] = useState('')
  const [openRouterEnabled, setOpenRouterEnabled] = useState(false)
  const [openRouterDefaultModel, setOpenRouterDefaultModel] = useState('openai/gpt-4o-mini')
  const [openRouterSiteUrl, setOpenRouterSiteUrl] = useState('')
  const [openRouterSiteName, setOpenRouterSiteName] = useState('')
  
  const [deeplApiKey, setDeeplApiKey] = useState('')
  const [translationProvider, setTranslationProvider] = useState('auto')
  
  const [pusherAppId, setPusherAppId] = useState('')
  const [pusherKey, setPusherKey] = useState('')
  const [pusherSecret, setPusherSecret] = useState('')
  const [pusherCluster, setPusherCluster] = useState('eu')
  const [pusherEnabled, setPusherEnabled] = useState(false)
  
  const [posthogApiKey, setPosthogApiKey] = useState('')
  const [posthogHost, setPosthogHost] = useState('https://eu.i.posthog.com')
  const [posthogPersonalApiKey, setPosthogPersonalApiKey] = useState('')
  const [posthogProjectId, setPosthogProjectId] = useState('')
  const [posthogEnabled, setPosthogEnabled] = useState(false)
  
  const [dailyApiKey, setDailyApiKey] = useState('')
  const [dailyEnabled, setDailyEnabled] = useState(false)
  
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendEnabled, setResendEnabled] = useState(false)
  const [resendFromEmail, setResendFromEmail] = useState('')
  const [resendFromName, setResendFromName] = useState('NICNOA')
  const [resendWebhookSecret, setResendWebhookSecret] = useState('')
  
  // seven.io SMS
  const [sevenIoApiKey, setSevenIoApiKey] = useState('')
  const [sevenIoEnabled, setSevenIoEnabled] = useState(false)
  const [sevenIoSenderId, setSevenIoSenderId] = useState('NICNOA')
  const [sevenIoTestNumbers, setSevenIoTestNumbers] = useState('')

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings/integrations')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSettings(data)
      
      // Form States befüllen
      setOpenRouterEnabled(data.openRouterEnabled || false)
      setOpenRouterDefaultModel(data.openRouterDefaultModel || 'openai/gpt-4o-mini')
      setOpenRouterSiteUrl(data.openRouterSiteUrl || '')
      setOpenRouterSiteName(data.openRouterSiteName || '')
      setTranslationProvider(data.translationProvider || 'auto')
      setPusherCluster(data.pusherCluster || 'eu')
      setPusherEnabled(data.pusherEnabled || false)
      setPosthogHost(data.posthogHost || 'https://eu.i.posthog.com')
      setPosthogProjectId(data.posthogProjectId || '')
      setPosthogEnabled(data.posthogEnabled || false)
      setDailyEnabled(data.dailyEnabled || false)
      setResendEnabled(data.resendEnabled || false)
      setResendFromEmail(data.resendFromEmail || '')
      setResendFromName(data.resendFromName || 'NICNOA')
      setSevenIoEnabled(data.sevenIoEnabled || false)
      setSevenIoSenderId(data.sevenIoSenderId || 'NICNOA')
      setSevenIoTestNumbers(data.sevenIoTestNumbers || '')
      
      // API Keys werden maskiert zurückgegeben, also nicht überschreiben
    } catch (error) {
      console.error('Error fetching integrations:', error)
      toast.error('Fehler beim Laden der Integrationen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        openRouterEnabled,
        openRouterDefaultModel,
        openRouterSiteUrl: openRouterSiteUrl || null,
        openRouterSiteName: openRouterSiteName || null,
        translationProvider,
        pusherCluster,
        pusherEnabled,
        posthogHost: posthogHost || null,
        posthogProjectId: posthogProjectId || null,
        posthogEnabled,
        dailyEnabled,
        resendEnabled,
        resendFromEmail: resendFromEmail || null,
        resendFromName: resendFromName || null,
        sevenIoEnabled,
        sevenIoSenderId: sevenIoSenderId || 'NICNOA',
        sevenIoTestNumbers: sevenIoTestNumbers || null,
      }
      
      // Nur nicht-leere API-Keys senden
      if (openRouterApiKey && !openRouterApiKey.includes('•')) {
        payload.openRouterApiKey = openRouterApiKey
      }
      if (deeplApiKey && !deeplApiKey.includes('•')) {
        payload.deeplApiKey = deeplApiKey
      }
      if (pusherAppId && !pusherAppId.includes('•')) {
        payload.pusherAppId = pusherAppId
      }
      if (pusherKey && !pusherKey.includes('•')) {
        payload.pusherKey = pusherKey
      }
      if (pusherSecret && !pusherSecret.includes('•')) {
        payload.pusherSecret = pusherSecret
      }
      if (posthogApiKey && !posthogApiKey.includes('•')) {
        payload.posthogApiKey = posthogApiKey
      }
      if (posthogPersonalApiKey && !posthogPersonalApiKey.includes('•')) {
        payload.posthogPersonalApiKey = posthogPersonalApiKey
      }
      if (dailyApiKey && !dailyApiKey.includes('•')) {
        payload.dailyApiKey = dailyApiKey
      }
      if (resendApiKey && !resendApiKey.includes('•')) {
        payload.resendApiKey = resendApiKey
      }
      if (sevenIoApiKey && !sevenIoApiKey.includes('•')) {
        payload.sevenIoApiKey = sevenIoApiKey
      }
      if (resendWebhookSecret && !resendWebhookSecret.includes('•')) {
        payload.resendWebhookSecret = resendWebhookSecret
      }
      if (sevenIoApiKey && !sevenIoApiKey.includes('•')) {
        payload.sevenIoApiKey = sevenIoApiKey
      }

      const res = await fetch('/api/admin/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success('Integrationen gespeichert!')
      await fetchSettings()
    } catch (error) {
      console.error('Error saving integrations:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async (integration: string) => {
    setTestingConnection(integration)
    try {
      const res = await fetch(`/api/admin/settings/integrations/test?integration=${integration}`)
      const data = await res.json()
      
      if (data.success) {
        toast.success(`${integration} Verbindung erfolgreich!`)
      } else {
        toast.error(`${integration} Verbindung fehlgeschlagen: ${data.error}`)
      }
    } catch (error) {
      toast.error(`Verbindungstest fehlgeschlagen`)
    } finally {
      setTestingConnection(null)
    }
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('In Zwischenablage kopiert')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Integrationen
          </h1>
          <p className="text-muted-foreground">
            API-Schlüssel und Drittanbieter-Dienste konfigurieren
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Neu laden
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {/* AI & Übersetzungen */}
        <AccordionItem value="ai" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">AI & Übersetzungen</h3>
                <p className="text-sm text-muted-foreground">OpenRouter, DeepL</p>
              </div>
              {(settings?.openRouterEnabled || settings?.deeplApiKey) && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* OpenRouter */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <div>
                        <CardTitle className="text-base">OpenRouter</CardTitle>
                        <CardDescription>Zugang zu 100+ AI-Modellen über eine API</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={openRouterEnabled}
                        onCheckedChange={setOpenRouterEnabled}
                      />
                      <Label className="text-sm">Aktiviert</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="openRouterApiKey">API-Key</Label>
                      <div className="relative">
                        <Input
                          id="openRouterApiKey"
                          type={showSecrets['openRouter'] ? 'text' : 'password'}
                          value={openRouterApiKey}
                          onChange={(e) => setOpenRouterApiKey(e.target.value)}
                          placeholder={settings?.openRouterApiKey || 'sk-or-...'}
                          className="pr-20"
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleShowSecret('openRouter')}
                          >
                            {showSecrets['openRouter'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hol dir deinen Key auf{' '}
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          openrouter.ai/keys <ExternalLink className="inline h-3 w-3" />
                        </a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openRouterModel">Standard-Modell</Label>
                      <Select value={openRouterDefaultModel} onValueChange={setOpenRouterDefaultModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Modell wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPENROUTER_MODELS.map((model) => (
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
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="openRouterSiteName">Site Name</Label>
                      <Input
                        id="openRouterSiteName"
                        value={openRouterSiteName}
                        onChange={(e) => setOpenRouterSiteName(e.target.value)}
                        placeholder="NICNOA"
                      />
                      <p className="text-xs text-muted-foreground">Wird in OpenRouter-Logs angezeigt</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openRouterSiteUrl">Site URL</Label>
                      <Input
                        id="openRouterSiteUrl"
                        value={openRouterSiteUrl}
                        onChange={(e) => setOpenRouterSiteUrl(e.target.value)}
                        placeholder="https://nicnoa.online"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('openrouter')}
                      disabled={testingConnection === 'openrouter' || !settings?.openRouterApiKey}
                    >
                      {testingConnection === 'openrouter' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Verbindung testen
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* DeepL */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-base">DeepL Übersetzungen</CardTitle>
                      <CardDescription>Professionelle Übersetzungen für Inhalte</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deeplApiKey">API-Key</Label>
                      <div className="relative">
                        <Input
                          id="deeplApiKey"
                          type={showSecrets['deepl'] ? 'text' : 'password'}
                          value={deeplApiKey}
                          onChange={(e) => setDeeplApiKey(e.target.value)}
                          placeholder={settings?.deeplApiKey || 'xxxxxxxx-xxxx-...'}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => toggleShowSecret('deepl')}
                        >
                          {showSecrets['deepl'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <a href="https://www.deepl.com/pro-api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          DeepL API <ExternalLink className="inline h-3 w-3" />
                        </a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="translationProvider">Übersetzungs-Provider</Label>
                      <Select value={translationProvider} onValueChange={setTranslationProvider}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (DeepL → OpenRouter Fallback)</SelectItem>
                          <SelectItem value="deepl">Nur DeepL</SelectItem>
                          <SelectItem value="openai">Nur AI (OpenRouter)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('deepl')}
                      disabled={testingConnection === 'deepl' || !settings?.deeplApiKey}
                    >
                      {testingConnection === 'deepl' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Verbindung testen
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Real-Time Chat */}
        <AccordionItem value="realtime" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Real-Time Chat</h3>
                <p className="text-sm text-muted-foreground">Pusher Channels</p>
              </div>
              {settings?.pusherEnabled && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-cyan-500" />
                    <div>
                      <CardTitle className="text-base">Pusher Channels</CardTitle>
                      <CardDescription>Echtzeit-Kommunikation für Chat & Benachrichtigungen</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pusherEnabled}
                      onCheckedChange={setPusherEnabled}
                    />
                    <Label className="text-sm">Aktiviert</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pusherAppId">App ID</Label>
                    <Input
                      id="pusherAppId"
                      value={pusherAppId}
                      onChange={(e) => setPusherAppId(e.target.value)}
                      placeholder={settings?.pusherAppId || '123456'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pusherKey">Key</Label>
                    <Input
                      id="pusherKey"
                      value={pusherKey}
                      onChange={(e) => setPusherKey(e.target.value)}
                      placeholder={settings?.pusherKey || 'xxxxxxxxxxxxxxxx'}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pusherSecret">Secret</Label>
                    <div className="relative">
                      <Input
                        id="pusherSecret"
                        type={showSecrets['pusher'] ? 'text' : 'password'}
                        value={pusherSecret}
                        onChange={(e) => setPusherSecret(e.target.value)}
                        placeholder={settings?.pusherSecret || '••••••••••••••••'}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => toggleShowSecret('pusher')}
                      >
                        {showSecrets['pusher'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pusherCluster">Cluster</Label>
                    <Select value={pusherCluster} onValueChange={setPusherCluster}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eu">EU (Frankfurt)</SelectItem>
                        <SelectItem value="us2">US East (Ohio)</SelectItem>
                        <SelectItem value="us3">US West (Oregon)</SelectItem>
                        <SelectItem value="ap1">Asia Pacific (Singapore)</SelectItem>
                        <SelectItem value="ap2">Asia Pacific (Mumbai)</SelectItem>
                        <SelectItem value="ap3">Asia Pacific (Tokyo)</SelectItem>
                        <SelectItem value="ap4">Asia Pacific (Sydney)</SelectItem>
                        <SelectItem value="mt1">South America (São Paulo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Erstelle eine App auf{' '}
                  <a href="https://dashboard.pusher.com/channels" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    pusher.com <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('pusher')}
                    disabled={testingConnection === 'pusher' || !settings?.pusherAppId}
                  >
                    {testingConnection === 'pusher' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Verbindung testen
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Analytics */}
        <AccordionItem value="analytics" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">PostHog</p>
              </div>
              {settings?.posthogEnabled && settings?.posthogApiKey && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle className="text-base">PostHog</CardTitle>
                    <CardDescription>Product Analytics, Session Recording, Feature Flags</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="posthogApiKey">Project API Key</Label>
                    <div className="relative">
                      <Input
                        id="posthogApiKey"
                        type={showSecrets['posthog'] ? 'text' : 'password'}
                        value={posthogApiKey}
                        onChange={(e) => setPosthogApiKey(e.target.value)}
                        placeholder={settings?.posthogApiKey || 'phc_...'}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => toggleShowSecret('posthog')}
                      >
                        {showSecrets['posthog'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posthogHost">Host</Label>
                    <Select value={posthogHost} onValueChange={setPosthogHost}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="https://eu.i.posthog.com">EU Cloud</SelectItem>
                        <SelectItem value="https://us.i.posthog.com">US Cloud</SelectItem>
                        <SelectItem value="https://app.posthog.com">Legacy (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posthogPersonalApiKey">Personal API Key (für Analytics)</Label>
                  <div className="relative">
                    <Input
                      id="posthogPersonalApiKey"
                      type={showSecrets['posthogPersonal'] ? 'text' : 'password'}
                      value={posthogPersonalApiKey}
                      onChange={(e) => setPosthogPersonalApiKey(e.target.value)}
                      placeholder={settings?.posthogPersonalApiKey || 'phx_...'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleShowSecret('posthogPersonal')}
                    >
                      {showSecrets['posthogPersonal'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Benötigt für Analytics-Dashboard (Settings → Personal API Keys)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posthogProjectId">Project ID</Label>
                  <Input
                    id="posthogProjectId"
                    value={posthogProjectId}
                    onChange={(e) => setPosthogProjectId(e.target.value)}
                    placeholder={settings?.posthogProjectId || '12345'}
                  />
                  <p className="text-xs text-muted-foreground">Die numerische Projekt-ID (Project Settings → Project ID)</p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>PostHog aktivieren</Label>
                    <p className="text-xs text-muted-foreground">Event-Tracking und Analytics</p>
                  </div>
                  <Switch
                    checked={posthogEnabled}
                    onCheckedChange={setPosthogEnabled}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  <a href="https://posthog.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    posthog.com <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>

                <div className="flex justify-end pt-4 border-t">
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Video Calls */}
        <AccordionItem value="video" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Video Calls</h3>
                <p className="text-sm text-muted-foreground">Daily.co</p>
              </div>
              {settings?.dailyEnabled && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-green-500" />
                    <div>
                      <CardTitle className="text-base">Daily.co</CardTitle>
                      <CardDescription>Video-Konferenzen und virtuelle Räume</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dailyEnabled}
                      onCheckedChange={setDailyEnabled}
                    />
                    <Label className="text-sm">Aktiviert</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="dailyApiKey"
                      type={showSecrets['daily'] ? 'text' : 'password'}
                      value={dailyApiKey}
                      onChange={(e) => setDailyApiKey(e.target.value)}
                      placeholder={settings?.dailyApiKey || '••••••••••••••••'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleShowSecret('daily')}
                    >
                      {showSecrets['daily'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  <a href="https://dashboard.daily.co/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    daily.co/developers <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('daily')}
                    disabled={testingConnection === 'daily' || !settings?.dailyApiKey}
                  >
                    {testingConnection === 'daily' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Verbindung testen
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* E-Mail (Resend) */}
        <AccordionItem value="email" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">E-Mail</h3>
                <p className="text-sm text-muted-foreground">Resend</p>
              </div>
              {settings?.resendEnabled && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-rose-500" />
                    <div>
                      <CardTitle className="text-base">Resend</CardTitle>
                      <CardDescription>E-Mail-Versand für Transaktions- und Marketing-E-Mails</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={resendEnabled}
                      onCheckedChange={setResendEnabled}
                    />
                    <Label className="text-sm">Aktiviert</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resendApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="resendApiKey"
                      type={showSecrets['resend'] ? 'text' : 'password'}
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder={settings?.resendApiKey || 're_••••••••••••••••'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleShowSecret('resend')}
                    >
                      {showSecrets['resend'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resendFromEmail">Absender E-Mail</Label>
                    <Input
                      id="resendFromEmail"
                      type="email"
                      value={resendFromEmail}
                      onChange={(e) => setResendFromEmail(e.target.value)}
                      placeholder="noreply@nicnoa.online"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resendFromName">Absender Name</Label>
                    <Input
                      id="resendFromName"
                      value={resendFromName}
                      onChange={(e) => setResendFromName(e.target.value)}
                      placeholder="NICNOA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resendWebhookSecret">Webhook Secret (optional)</Label>
                  <div className="relative">
                    <Input
                      id="resendWebhookSecret"
                      type={showSecrets['resendWebhook'] ? 'text' : 'password'}
                      value={resendWebhookSecret}
                      onChange={(e) => setResendWebhookSecret(e.target.value)}
                      placeholder={settings?.resendWebhookSecret || 'whsec_••••••••••••••••'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleShowSecret('resendWebhook')}
                    >
                      {showSecrets['resendWebhook'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Für Webhook-Events (z.B. Bounce-Tracking). Webhook URL: <code className="px-1 py-0.5 rounded bg-muted text-xs">/api/webhooks/resend</code>
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    resend.com/api-keys <ExternalLink className="inline h-3 w-3" />
                  </a>
                  {' · '}
                  <Link href="/admin/email-templates" className="text-primary hover:underline">
                    E-Mail-Templates verwalten
                  </Link>
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('resend')}
                    disabled={testingConnection === 'resend' || !settings?.resendApiKey}
                  >
                    {testingConnection === 'resend' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Verbindung testen
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* SMS-Verifizierung */}
        <AccordionItem value="sms" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">SMS-Verifizierung</h3>
                <p className="text-sm text-muted-foreground">seven.io</p>
              </div>
              {settings?.sevenIoEnabled && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktiv
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-cyan-500" />
                    <div>
                      <CardTitle className="text-base">seven.io</CardTitle>
                      <CardDescription>SMS-Verifizierung bei der Registrierung für neue Nutzer</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={sevenIoEnabled}
                      onCheckedChange={setSevenIoEnabled}
                    />
                    <Label className="text-sm">Aktiviert</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!sevenIoEnabled && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-600 dark:text-amber-400">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">SMS-Verifizierung deaktiviert</p>
                        <p className="text-xs mt-1 text-amber-600/80 dark:text-amber-400/80">
                          Neue Nutzer können sich ohne SMS-Verifizierung registrieren. Die Telefonnummer wird dann nicht verifiziert.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sevenIoApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="sevenIoApiKey"
                      type={showSecrets['sevenIo'] ? 'text' : 'password'}
                      value={sevenIoApiKey}
                      onChange={(e) => setSevenIoApiKey(e.target.value)}
                      placeholder={settings?.sevenIoApiKey || 'xxxxxxxxxxxxxxxxxxxxxxxx'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleShowSecret('sevenIo')}
                    >
                      {showSecrets['sevenIo'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Findest du unter seven.io → API-Key
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sevenIoSenderId">Absender-ID (max. 11 Zeichen)</Label>
                  <Input
                    id="sevenIoSenderId"
                    value={sevenIoSenderId}
                    onChange={(e) => setSevenIoSenderId(e.target.value.slice(0, 11))}
                    placeholder="NICNOA"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    Der Name, der als Absender in der SMS angezeigt wird. Max. 11 alphanumerische Zeichen.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sevenIoTestNumbers">Test-Telefonnummern (optional)</Label>
                  <Input
                    id="sevenIoTestNumbers"
                    value={sevenIoTestNumbers}
                    onChange={(e) => setSevenIoTestNumbers(e.target.value)}
                    placeholder="01512236345, 01701234567"
                  />
                  <p className="text-xs text-muted-foreground">
                    Komma-getrennte Liste von Telefonnummern, die keine SMS erhalten. Code &quot;1111&quot; wird automatisch akzeptiert.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  <a href="https://app.seven.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    app.seven.io <ExternalLink className="inline h-3 w-3" />
                  </a>
                  {' · '}
                  <a href="https://docs.seven.io/en/rest-api/endpoints/sms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    API-Dokumentation <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('sevenio')}
                    disabled={testingConnection === 'sevenio' || !settings?.sevenIoApiKey}
                  >
                    {testingConnection === 'sevenio' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Verbindung testen
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Zahlungen */}
        <AccordionItem value="payments" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Zahlungen</h3>
                <p className="text-sm text-muted-foreground">Stripe</p>
              </div>
              {settings?.stripeConfigured && (
                <Badge className="ml-auto mr-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Konfiguriert
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-indigo-500" />
                  <div>
                    <CardTitle className="text-base">Stripe</CardTitle>
                    <CardDescription>Zahlungsabwicklung für Abonnements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Stripe wird über Umgebungsvariablen konfiguriert</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Setze <code className="px-1 py-0.5 rounded bg-muted text-xs">STRIPE_SECRET_KEY</code> und{' '}
                        <code className="px-1 py-0.5 rounded bg-muted text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in deiner <code className="px-1 py-0.5 rounded bg-muted text-xs">.env</code> Datei.
                      </p>
                      <div className="mt-3">
                        <a 
                          href="https://dashboard.stripe.com/apikeys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Stripe Dashboard öffnen <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {settings?.stripeConfigured && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Stripe ist konfiguriert und aktiv</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

