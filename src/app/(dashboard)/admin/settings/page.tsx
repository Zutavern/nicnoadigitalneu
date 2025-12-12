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
  BarChart3,
  MessageCircle,
  Video,
} from 'lucide-react'
import { POPULAR_MODELS, MODEL_GROUPS } from '@/lib/openrouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  const [translationProvider, setTranslationProvider] = useState('auto')
  const [translationModel, setTranslationModel] = useState('openai/gpt-4o-mini')
  const [showDeeplKey, setShowDeeplKey] = useState(false)
  const [isTestingDeepL, setIsTestingDeepL] = useState(false)
  const [deeplKeyValid, setDeeplKeyValid] = useState<boolean | null>(null)
  const [deeplUsage, setDeeplUsage] = useState<{ remaining: number; percentUsed: number } | null>(null)
  
  // OpenRouter
  const [openRouterApiKey, setOpenRouterApiKey] = useState('')
  const [openRouterEnabled, setOpenRouterEnabled] = useState(false)
  const [openRouterDefaultModel, setOpenRouterDefaultModel] = useState('openai/gpt-4o-mini')
  const [openRouterSiteUrl, setOpenRouterSiteUrl] = useState('https://nicnoa.de')
  const [openRouterSiteName, setOpenRouterSiteName] = useState('NICNOA Platform')
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)
  const [isTestingOpenRouter, setIsTestingOpenRouter] = useState(false)
  const [openRouterKeyValid, setOpenRouterKeyValid] = useState<boolean | null>(null)
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
  
  // PostHog Analytics
  const [posthogApiKey, setPosthogApiKey] = useState('')
  const [posthogHost, setPosthogHost] = useState('https://eu.i.posthog.com')
  const [posthogProjectId, setPosthogProjectId] = useState('')
  const [posthogEnabled, setPosthogEnabled] = useState(false)
  const [posthogPersonalApiKey, setPosthogPersonalApiKey] = useState('')
  const [showPosthogApiKey, setShowPosthogApiKey] = useState(false)
  const [showPosthogPersonalKey, setShowPosthogPersonalKey] = useState(false)
  const [isTestingPosthog, setIsTestingPosthog] = useState(false)
  const [posthogKeyValid, setPosthogKeyValid] = useState<boolean | null>(null)
  const [isSavingPosthog, setIsSavingPosthog] = useState(false)

  // Pusher Real-Time Chat
  const [pusherAppId, setPusherAppId] = useState('')
  const [pusherKey, setPusherKey] = useState('')
  const [pusherSecret, setPusherSecret] = useState('')
  const [pusherCluster, setPusherCluster] = useState('eu')
  const [pusherEnabled, setPusherEnabled] = useState(false)
  const [showPusherSecret, setShowPusherSecret] = useState(false)
  const [isTestingPusher, setIsTestingPusher] = useState(false)
  const [pusherTestResult, setPusherTestResult] = useState<boolean | null>(null)
  
  // Daily Video Call State
  const [dailyApiKey, setDailyApiKey] = useState('')
  const [dailyDomain, setDailyDomain] = useState('')
  const [dailyEnabled, setDailyEnabled] = useState(false)
  const [showDailyApiKey, setShowDailyApiKey] = useState(false)
  const [isTestingDaily, setIsTestingDaily] = useState(false)
  const [dailyTestResult, setDailyTestResult] = useState<boolean | null>(null)
  const [isSavingDaily, setIsSavingDaily] = useState(false)
  const [isSavingPusher, setIsSavingPusher] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchOpenRouterConfig()
    fetchToneOfVoice()
    fetchPosthogConfig()
    fetchPusherConfig()
    fetchDailyConfig()
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
      setTranslationProvider(data.translationProvider || 'auto')
      setDeeplKeyValid(data.deeplApiKey ? true : null)
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
    setOpenRouterKeyValid(null)
    try {
      const res = await fetch('/api/admin/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openRouterApiKey }),
      })

      const data = await res.json()

      if (data.valid) {
        setOpenRouterKeyValid(true)
        toast.success(data.message)
      } else {
        setOpenRouterKeyValid(false)
        toast.error(data.error || 'Ungültiger API Key')
      }
    } catch (error) {
      setOpenRouterKeyValid(false)
      toast.error('Verbindungsfehler')
    } finally {
      setIsTestingOpenRouter(false)
    }
  }

  const testDeeplKey = async () => {
    if (!deeplApiKey || deeplApiKey === '••••••••••••••••') {
      toast.error('Bitte gib einen API Key ein')
      return
    }

    setIsTestingDeepL(true)
    setDeeplKeyValid(null)
    try {
      const res = await fetch('/api/admin/settings/test-deepl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: deeplApiKey }),
      })

      const data = await res.json()

      if (data.valid) {
        setDeeplKeyValid(true)
        setDeeplUsage(data.usage ? { remaining: data.usage.remaining, percentUsed: data.usage.percentUsed } : null)
        toast.success(data.message)
      } else {
        setDeeplKeyValid(false)
        toast.error(data.error || 'Ungültiger API Key')
      }
    } catch (error) {
      setDeeplKeyValid(false)
      toast.error('Verbindungsfehler')
    } finally {
      setIsTestingDeepL(false)
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

  const fetchPosthogConfig = async () => {
    try {
      const res = await fetch('/api/admin/posthog')
      if (res.ok) {
        const data = await res.json()
        setPosthogApiKey(data.hasApiKey ? '••••••••••••••••' : '')
        setPosthogHost(data.posthogHost || 'https://eu.i.posthog.com')
        setPosthogProjectId(data.posthogProjectId || '')
        setPosthogEnabled(data.posthogEnabled || false)
        setPosthogPersonalApiKey(data.hasPersonalApiKey ? '••••••••••••••••' : '')
        setPosthogKeyValid(data.hasApiKey ? true : null)
      }
    } catch (error) {
      console.error('Error fetching PostHog config:', error)
    }
  }

  const savePosthogConfig = async () => {
    setIsSavingPosthog(true)
    try {
      // Prepare data - only send keys if they are not masked placeholders
      const isMasked = (val: string) => val === '••••••••••••••••'
      const payload: Record<string, unknown> = {
        posthogHost,
        posthogProjectId,
        posthogEnabled,
      }
      
      // Only include API keys if they are actual values (not masked)
      if (posthogApiKey && !isMasked(posthogApiKey)) {
        payload.posthogApiKey = posthogApiKey
      }
      if (posthogPersonalApiKey && !isMasked(posthogPersonalApiKey)) {
        payload.posthogPersonalApiKey = posthogPersonalApiKey
      }

      console.log('Saving PostHog config:', { ...payload, posthogApiKey: payload.posthogApiKey ? '***' : undefined })

      const res = await fetch('/api/admin/posthog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      const data = await res.json()
      console.log('PostHog config saved:', data)
      
      setPosthogApiKey(data.hasApiKey ? '••••••••••••••••' : '')
      setPosthogPersonalApiKey(data.hasPersonalApiKey ? '••••••••••••••••' : '')
      toast.success('PostHog-Einstellungen gespeichert!')
    } catch (error) {
      console.error('Error saving PostHog config:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingPosthog(false)
    }
  }

  const testPosthogConnection = async () => {
    if (!posthogApiKey || posthogApiKey === '••••••••••••••••') {
      toast.error('Bitte gib einen API Key ein')
      return
    }

    setIsTestingPosthog(true)
    setPosthogKeyValid(null)
    try {
      const res = await fetch('/api/admin/posthog/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: posthogApiKey, host: posthogHost }),
      })

      const data = await res.json()

      if (data.valid) {
        setPosthogKeyValid(true)
        toast.success(data.message || 'Verbindung erfolgreich!')
        // Auto-update host if a working one was found
        if (data.workingHost && data.workingHost !== posthogHost) {
          setPosthogHost(data.workingHost)
          toast.info(`Host wurde auf ${data.workingHost} aktualisiert`)
        }
      } else {
        setPosthogKeyValid(false)
        // Show detailed error
        const errorMsg = data.error || 'Verbindung fehlgeschlagen'
        toast.error(errorMsg, {
          description: data.suggestion ? data.suggestion : undefined,
          duration: 8000,
        })
        // Log tried hosts for debugging
        if (data.triedHosts) {
          console.log('PostHog Test - Tried hosts:', data.triedHosts)
        }
      }
    } catch (error) {
      setPosthogKeyValid(false)
      toast.error('Verbindungsfehler - Netzwerkproblem')
    } finally {
      setIsTestingPosthog(false)
    }
  }

  // ==================== PUSHER CONFIG ====================
  const fetchPusherConfig = async () => {
    try {
      const res = await fetch('/api/admin/pusher')
      if (res.ok) {
        const data = await res.json()
        setPusherAppId(data.pusherAppId || '')
        setPusherKey(data.pusherKey || '')
        setPusherCluster(data.pusherCluster || 'eu')
        setPusherEnabled(data.pusherEnabled || false)
        setPusherSecret(data.hasSecret ? '••••••••••••••••' : '')
        setPusherTestResult(data.hasSecret ? true : null)
      }
    } catch (error) {
      console.error('Error fetching Pusher config:', error)
    }
  }

  const savePusherConfig = async () => {
    setIsSavingPusher(true)
    try {
      const isMasked = (val: string) => val === '••••••••••••••••'
      const payload: Record<string, unknown> = {
        pusherAppId,
        pusherKey,
        pusherCluster,
        pusherEnabled,
      }

      if (pusherSecret && !isMasked(pusherSecret)) {
        payload.pusherSecret = pusherSecret
      }

      const res = await fetch('/api/admin/pusher', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      const data = await res.json()
      setPusherSecret(data.hasSecret ? '••••••••••••••••' : '')
      toast.success('Pusher-Einstellungen gespeichert!')
    } catch (error) {
      console.error('Error saving Pusher config:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingPusher(false)
    }
  }

  const testPusherConnection = async () => {
    // Prüfe nur ob Basisdaten vorhanden sind - Secret kann maskiert sein
    if (!pusherAppId || !pusherKey) {
      toast.error('Bitte App ID und Key ausfüllen')
      return
    }

    // Wenn kein Secret (auch nicht maskiert) vorhanden ist
    if (!pusherSecret) {
      toast.error('Bitte Secret eingeben und speichern')
      return
    }

    setIsTestingPusher(true)
    setPusherTestResult(null)
    try {
      const res = await fetch('/api/admin/pusher', {
        method: 'POST',
      })

      const data = await res.json()
      if (data.success) {
        setPusherTestResult(true)
        toast.success(data.message || 'Verbindung erfolgreich!')
      } else {
        setPusherTestResult(false)
        toast.error(data.error || 'Verbindungstest fehlgeschlagen')
      }
    } catch (error) {
      setPusherTestResult(false)
      toast.error('Verbindungsfehler - Netzwerkproblem')
    } finally {
      setIsTestingPusher(false)
    }
  }

  // Daily.co Video Call Functions
  const fetchDailyConfig = async () => {
    try {
      const res = await fetch('/api/admin/video-call')
      if (res.ok) {
        const data = await res.json()
        setDailyDomain(data.domain || '')
        setDailyEnabled(data.enabled || false)
        setDailyApiKey(data.apiKey || '')
        setDailyTestResult(data.apiKey ? true : null)
      }
    } catch (error) {
      console.error('Error fetching Daily config:', error)
    }
  }

  const saveDailyConfig = async () => {
    setIsSavingDaily(true)
    try {
      const isMasked = (val: string) => val.startsWith('***')
      const payload: Record<string, unknown> = {
        domain: dailyDomain,
        enabled: dailyEnabled,
      }

      if (dailyApiKey && !isMasked(dailyApiKey)) {
        payload.apiKey = dailyApiKey
      }

      const res = await fetch('/api/admin/video-call', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      toast.success('Video-Call-Einstellungen gespeichert!')
      fetchDailyConfig() // Refresh to get masked key
    } catch (error) {
      console.error('Error saving Daily config:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingDaily(false)
    }
  }

  const testDailyConnection = async () => {
    // Wenn der Key leer ist und nicht gespeichert wurde
    if (!dailyApiKey) {
      toast.error('Bitte Daily API Key eingeben und speichern')
      return
    }

    setIsTestingDaily(true)
    setDailyTestResult(null)
    try {
      const res = await fetch('/api/admin/video-call', {
        method: 'POST',
      })

      const data = await res.json()
      if (data.success) {
        setDailyTestResult(true)
        toast.success(data.message || 'Verbindung erfolgreich!')
      } else {
        setDailyTestResult(false)
        toast.error(data.message || 'Verbindungstest fehlgeschlagen')
      }
    } catch (error) {
      setDailyTestResult(false)
      toast.error('Verbindungsfehler - Netzwerkproblem')
    } finally {
      setIsTestingDaily(false)
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
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
          <TabsTrigger value="email">E-Mail</TabsTrigger>
          <TabsTrigger value="translations">Übersetzungen</TabsTrigger>
          <TabsTrigger value="openrouter" className="gap-1">
            <Bot className="h-3.5 w-3.5" />
            OpenRouter
          </TabsTrigger>
          <TabsTrigger value="posthog" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            PostHog
          </TabsTrigger>
          <TabsTrigger value="pusher" className="gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            Pusher
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1">
            <Video className="h-3.5 w-3.5" />
            Video
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
                  Konfigurieren Sie die APIs für automatische Übersetzungen. 
                  DeepL wird bevorzugt, OpenRouter (KI) dient als Fallback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status-Übersicht */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`p-4 rounded-lg border ${deeplKeyValid ? 'bg-green-500/5 border-green-500/20' : deeplApiKey ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">DeepL</span>
                      {deeplKeyValid === true && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verifiziert
                        </Badge>
                      )}
                      {deeplKeyValid === false && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ungültig
                        </Badge>
                      )}
                      {deeplKeyValid === null && deeplApiKey && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Nicht getestet
                        </Badge>
                      )}
                      {!deeplApiKey && (
                        <Badge variant="secondary">Nicht konfiguriert</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hochwertige Übersetzungen für europäische Sprachen
                    </p>
                    {deeplUsage && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {deeplUsage.remaining.toLocaleString()} Zeichen verfügbar ({deeplUsage.percentUsed}% verwendet)
                      </p>
                    )}
                  </div>
                  <div className={`p-4 rounded-lg border ${openRouterEnabled && openRouterApiKey ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">OpenRouter (KI)</span>
                      {openRouterEnabled && openRouterApiKey ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Nicht aktiv</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fallback für Sprachen, die DeepL nicht unterstützt
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
                      <SelectItem value="openrouter">Nur OpenRouter (KI)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    &quot;Automatisch&quot; nutzt DeepL wenn verfügbar, sonst OpenRouter
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
                        onChange={(e) => {
                          setDeeplApiKey(e.target.value)
                          setDeeplKeyValid(null)
                          setDeeplUsage(null)
                        }}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                        className={`pr-10 ${deeplKeyValid === true ? 'border-green-500' : deeplKeyValid === false ? 'border-red-500' : ''}`}
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
                      onClick={testDeeplKey}
                      disabled={isTestingDeepL || !deeplApiKey}
                    >
                      {isTestingDeepL ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : deeplKeyValid === true ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      Testen
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.deepl.com/pro-api', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Key holen
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Free-Keys enden mit &quot;:fx&quot;, Pro-Keys ohne Suffix
                  </p>
                </div>

                {/* OpenRouter Model Selection */}
                <div className="space-y-2">
                  <Label>KI-Modell für Übersetzungen (via OpenRouter)</Label>
                  <Select value={translationModel} onValueChange={setTranslationModel}>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_MODELS.filter(m => m.provider === 'OpenAI').map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {model.recommended && (
                              <Badge variant="secondary" className="text-xs">Empfohlen</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (schnell & günstig)</SelectItem>
                      <SelectItem value="google/gemini-flash-1.5">Gemini Flash 1.5 (sehr günstig)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wird verwendet wenn DeepL nicht verfügbar ist oder die Sprache nicht unterstützt
                  </p>
                </div>

                {/* Hinweis wenn keine APIs konfiguriert */}
                {!deeplApiKey && (!openRouterEnabled || !openRouterApiKey) && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-500">Keine Übersetzungs-API konfiguriert</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Für automatische Übersetzungen benötigst du entweder einen DeepL API-Schlüssel 
                          oder einen aktiven OpenRouter-Account (konfigurierbar im OpenRouter-Tab).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info wenn OpenRouter nicht aktiv */}
                {!openRouterEnabled && deeplApiKey && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-500">OpenRouter als Fallback</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Einige Sprachen (z.B. Kroatisch, Thai, Vietnamesisch) werden von DeepL nicht unterstützt. 
                          Aktiviere OpenRouter im OpenRouter-Tab, um auch diese Sprachen übersetzen zu können.
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
                    <SelectTrigger className="w-full md:w-[500px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {Object.entries(MODEL_GROUPS).map(([key, group]) => (
                        <SelectGroup key={key}>
                          <SelectLabel className="text-xs font-semibold">{group.label}</SelectLabel>
                          {group.models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center gap-2">
                                <span>{model.name}</span>
                                <span className="text-xs text-muted-foreground">({model.provider})</span>
                                {model.recommended && (
                                  <Badge variant="secondary" className="text-xs">Empfohlen</Badge>
                                )}
                                {model.description && (
                                  <span className="text-xs text-muted-foreground hidden md:inline">• {model.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
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

        {/* PostHog Analytics Settings */}
        <TabsContent value="posthog" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {posthogEnabled && posthogApiKey ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">
                        {posthogEnabled && posthogApiKey ? 'Aktiv' : 'Inaktiv'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-semibold">
                        {posthogHost?.includes('eu.') ? 'EU' : 'US'}
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
                      <p className="text-sm text-muted-foreground">Events</p>
                      <p className="font-semibold">
                        {posthogEnabled ? 'Werden getracked' : 'Pausiert'}
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
                  <BarChart3 className="h-5 w-5 text-primary" />
                  PostHog Konfiguration
                </CardTitle>
                <CardDescription>
                  PostHog ist ein Open-Source Product Analytics Tool.
                  Tracke Nutzerverhalten, Conversions und mehr.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-base">PostHog aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Aktiviert das Event-Tracking auf allen Seiten
                    </p>
                  </div>
                  <Switch
                    checked={posthogEnabled}
                    onCheckedChange={setPosthogEnabled}
                  />
                </div>

                {/* API Key (Client-side) */}
                <div className="space-y-2">
                  <Label htmlFor="posthogApiKey">Project API Key (Client-side)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="posthogApiKey"
                        type={showPosthogApiKey ? 'text' : 'password'}
                        value={posthogApiKey}
                        onChange={(e) => {
                          setPosthogApiKey(e.target.value)
                          setPosthogKeyValid(null)
                        }}
                        placeholder="phc_..."
                        className={`pr-10 ${posthogKeyValid === true ? 'border-green-500' : posthogKeyValid === false ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPosthogApiKey(!showPosthogApiKey)}
                      >
                        {showPosthogApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={testPosthogConnection}
                      disabled={isTestingPosthog}
                    >
                      {isTestingPosthog ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : posthogKeyValid === true ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      Testen
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Der Project API Key beginnt mit &quot;phc_&quot; und wird für das Client-side Tracking verwendet
                  </p>
                </div>

                {/* Personal API Key (Server-side) */}
                <div className="space-y-2">
                  <Label htmlFor="posthogPersonalApiKey">Personal API Key (Server-side, optional)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="posthogPersonalApiKey"
                        type={showPosthogPersonalKey ? 'text' : 'password'}
                        value={posthogPersonalApiKey}
                        onChange={(e) => setPosthogPersonalApiKey(e.target.value)}
                        placeholder="phx_..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPosthogPersonalKey(!showPosthogPersonalKey)}
                      >
                        {showPosthogPersonalKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Der Personal API Key wird für Server-side API-Abfragen benötigt (Dashboard-Daten)
                  </p>
                </div>

                {/* Host URL */}
                <div className="space-y-2">
                  <Label htmlFor="posthogHost">Host URL</Label>
                  <Select value={posthogHost} onValueChange={setPosthogHost}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https://eu.i.posthog.com">EU Cloud (eu.i.posthog.com)</SelectItem>
                      <SelectItem value="https://us.i.posthog.com">US Cloud (us.i.posthog.com)</SelectItem>
                      <SelectItem value="https://app.posthog.com">Legacy (app.posthog.com)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wähle die Region deines PostHog-Projekts
                  </p>
                </div>

                {/* Project ID */}
                <div className="space-y-2">
                  <Label htmlFor="posthogProjectId">Project ID (optional)</Label>
                  <Input
                    id="posthogProjectId"
                    value={posthogProjectId}
                    onChange={(e) => setPosthogProjectId(e.target.value)}
                    placeholder="12345"
                  />
                  <p className="text-xs text-muted-foreground">
                    Die numerische Project ID aus deinem PostHog Dashboard
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-500">Was wird getrackt?</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>Pageviews auf allen Seiten</li>
                        <li>Login & Registrierungs-Events</li>
                        <li>Button-Klicks (Autocapture)</li>
                        <li>Formular-Submissions</li>
                        <li>Session-Dauer und Bounce Rate</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://eu.posthog.com', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    PostHog Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://posthog.com/docs', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Dokumentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={savePosthogConfig} disabled={isSavingPosthog} className="w-full">
              {isSavingPosthog ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              PostHog-Einstellungen speichern
            </Button>
          </motion.div>
        </TabsContent>

        {/* Pusher Real-Time Chat Settings */}
        <TabsContent value="pusher" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {pusherEnabled ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-600">Aktiv</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-500">Inaktiv</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Verbindungstest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {pusherTestResult === true ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-600">Verbunden</span>
                      </>
                    ) : pusherTestResult === false ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-600">Fehlgeschlagen</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-amber-600">Nicht getestet</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cluster</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-lg">
                    {pusherCluster.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Info Banner */}
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Echtzeit-Chat mit Pusher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pusher ermöglicht Echtzeit-Features wie Online-Status, Typing-Indikatoren und 
                  sofortige Nachrichtenübermittlung.{' '}
                  <a 
                    href="https://dashboard.pusher.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline inline-flex items-center gap-1"
                  >
                    Pusher Dashboard öffnen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pusher Channels Konfiguration
                </CardTitle>
                <CardDescription>
                  Erstelle eine App auf pusher.com und kopiere die Credentials hierher.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="pusher-enabled" className="text-base">
                      Pusher aktivieren
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Echtzeit-Features für Chat aktivieren
                    </p>
                  </div>
                  <Switch
                    id="pusher-enabled"
                    checked={pusherEnabled}
                    onCheckedChange={setPusherEnabled}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pusher-app-id">App ID</Label>
                    <Input
                      id="pusher-app-id"
                      value={pusherAppId}
                      onChange={(e) => setPusherAppId(e.target.value)}
                      placeholder="z.B. 1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pusher-key">Key</Label>
                    <Input
                      id="pusher-key"
                      value={pusherKey}
                      onChange={(e) => setPusherKey(e.target.value)}
                      placeholder="z.B. a1b2c3d4e5f6g7h8i9j0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pusher-secret">Secret</Label>
                  <div className="relative">
                    <Input
                      id="pusher-secret"
                      type={showPusherSecret ? 'text' : 'password'}
                      value={pusherSecret}
                      onChange={(e) => setPusherSecret(e.target.value)}
                      placeholder="Dein Pusher Secret"
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowPusherSecret(!showPusherSecret)}
                    >
                      {showPusherSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Das Secret wird sicher gespeichert und nie an Clients gesendet.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pusher-cluster">Cluster</Label>
                  <Select value={pusherCluster} onValueChange={setPusherCluster}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">EU (eu) - Europa</SelectItem>
                      <SelectItem value="us2">US East (us2)</SelectItem>
                      <SelectItem value="us3">US West (us3)</SelectItem>
                      <SelectItem value="ap1">Asia Pacific (ap1)</SelectItem>
                      <SelectItem value="ap2">Asia Pacific (ap2)</SelectItem>
                      <SelectItem value="ap3">Asia Pacific (ap3)</SelectItem>
                      <SelectItem value="ap4">Asia Pacific (ap4)</SelectItem>
                      <SelectItem value="mt1">Mumbai (mt1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wähle den Cluster, der deiner App in Pusher zugewiesen wurde.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={testPusherConnection}
                    disabled={isTestingPusher || !pusherAppId || !pusherKey || !pusherSecret}
                  >
                    {isTestingPusher ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FlaskConical className="mr-2 h-4 w-4" />
                    )}
                    Verbindung testen
                  </Button>
                </div>
                {pusherSecret === '••••••••••••••••' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ℹ️ Secret ist gespeichert. Test verwendet den Server-seitig gespeicherten Key.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={savePusherConfig}
              disabled={isSavingPusher}
              className="w-full"
            >
              {isSavingPusher ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Pusher-Einstellungen speichern
            </Button>
          </motion.div>
        </TabsContent>

        {/* Daily Video Call Settings */}
        <TabsContent value="daily" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {dailyEnabled ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-600">Aktiv</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-500">Deaktiviert</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Verbindung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {dailyTestResult === true ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-600">Verbunden</span>
                      </>
                    ) : dailyTestResult === false ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-600">Fehlgeschlagen</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-amber-600">Nicht getestet</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Banner */}
            <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Video className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Daily.co für Video-Calls</p>
                    <p className="text-sm text-muted-foreground">
                      Mit Daily.co können Nutzer direkt im Chat Videoanrufe starten.
                      1:1 Calls sind kostenlos, für Gruppen-Calls wird ein kostenpflichtiger Plan benötigt.
                    </p>
                    <a
                      href="https://dashboard.daily.co/developers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                    >
                      Zum Daily Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daily.co Konfiguration</CardTitle>
                    <CardDescription>
                      Gib deine Daily.co API-Zugangsdaten ein
                    </CardDescription>
                  </div>
                  <Switch
                    id="daily-enabled"
                    checked={dailyEnabled}
                    onCheckedChange={setDailyEnabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="daily-api-key"
                      type={showDailyApiKey ? 'text' : 'password'}
                      value={dailyApiKey}
                      onChange={(e) => setDailyApiKey(e.target.value)}
                      placeholder="Dein Daily API Key"
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowDailyApiKey(!showDailyApiKey)}
                    >
                      {showDailyApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Den API Key findest du im Daily Dashboard unter Developers → API Keys.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-domain">Domain (optional)</Label>
                  <Input
                    id="daily-domain"
                    value={dailyDomain}
                    onChange={(e) => setDailyDomain(e.target.value)}
                    placeholder="z.B. nicnoa (für nicnoa.daily.co)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Dein Daily-Subdomain für benutzerdefinierte Room-URLs.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={testDailyConnection}
                    disabled={isTestingDaily || !dailyApiKey}
                  >
                    {isTestingDaily ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FlaskConical className="mr-2 h-4 w-4" />
                    )}
                    Verbindung testen
                  </Button>
                </div>
                {dailyApiKey?.startsWith('***') && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ℹ️ API Key ist gespeichert. Test verwendet den Server-seitig gespeicherten Key.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={saveDailyConfig}
              disabled={isSavingDaily}
              className="w-full"
            >
              {isSavingDaily ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Video-Call-Einstellungen speichern
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
