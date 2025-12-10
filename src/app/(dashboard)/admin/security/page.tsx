'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Monitor,
  LogOut,
  RefreshCw,
  Filter,
  Plus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Loader2,
  Copy,
  Check,
  QrCode,
  KeyRound,
  Settings,
  Download,
  FileText,
  Globe,
  Clock,
  Mail,
  Bell,
  Save,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Image from 'next/image'

interface SecurityLog {
  id: string
  event: string
  userEmail: string
  status: string
  message: string | null
  ipAddress: string | null
  location: string | null
  device: string | null
  createdAt: string
}

interface ActiveSession {
  id: string
  userId: string
  device: string | null
  browser: string | null
  os: string | null
  location: string | null
  ipAddress: string | null
  lastActiveAt: string
  isActive: boolean
  user?: {
    id: string
    name: string | null
    email: string
  }
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  isActive: boolean
  isTestMode: boolean
  lastUsedAt: string | null
  usageCount: number
  expiresAt: string | null
  createdAt: string
}

interface TwoFactorStatus {
  enabled: boolean
  setupStarted: boolean
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number | null
}

interface LoginNotificationSettings {
  enabled: boolean
  onNewDevice: boolean
  onNewLocation: boolean
  onFailedAttempts: boolean
  failedAttemptsThreshold: number
}

interface IpWhitelist {
  enabled: boolean
  ips: string[]
  allowedRoles: string[]
}

interface SecuritySettings {
  passwordPolicy: PasswordPolicy
  loginNotifications: LoginNotificationSettings
  ipWhitelist: IpWhitelist
  sessionTimeout: number
  maxActiveSessions: number
  requireTwoFactorForAdmin: boolean
}

const defaultSettings: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: null,
  },
  loginNotifications: {
    enabled: true,
    onNewDevice: true,
    onNewLocation: true,
    onFailedAttempts: true,
    failedAttemptsThreshold: 3,
  },
  ipWhitelist: {
    enabled: false,
    ips: [],
    allowedRoles: ['ADMIN'],
  },
  sessionTimeout: 10080,
  maxActiveSessions: 5,
  requireTwoFactorForAdmin: false,
}

export default function SecurityPage() {
  // Data States
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [logStats, setLogStats] = useState({ successCount: 0, failedCount: 0, warningCount: 0 })
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSettings)
  
  // Loading States
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  
  // Filter & Dialog States
  const [logFilter, setLogFilter] = useState('all')
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyTestMode, setNewKeyTestMode] = useState(false)
  const [newKeyExpires, setNewKeyExpires] = useState('never')
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 2FA States
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>({ enabled: false, setupStarted: false })
  const [isLoading2FA, setIsLoading2FA] = useState(true)
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [isDisabling, setIsDisabling] = useState(false)

  // Password Change States
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  // IP Whitelist State
  const [newIp, setNewIp] = useState('')

  // Fetch Functions
  const fetchSecuritySettings = useCallback(async () => {
    setIsLoadingSettings(true)
    try {
      const res = await fetch('/api/admin/security/settings')
      if (res.ok) {
        const data = await res.json()
        setSecuritySettings(data)
      }
    } catch (error) {
      console.error('Error fetching security settings:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }, [])

  const fetch2FAStatus = useCallback(async () => {
    setIsLoading2FA(true)
    try {
      const res = await fetch('/api/auth/2fa/status')
      if (res.ok) {
        const data = await res.json()
        setTwoFactorStatus(data)
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error)
    } finally {
      setIsLoading2FA(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true)
    try {
      const statusParam = logFilter !== 'all' ? `&status=${logFilter.toUpperCase()}` : ''
      const res = await fetch(`/api/admin/security/logs?limit=50${statusParam}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setLogStats(data.stats || { successCount: 0, failedCount: 0, warningCount: 0 })
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [logFilter])

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const res = await fetch('/api/admin/security/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  const fetchApiKeys = useCallback(async () => {
    setIsLoadingKeys(true)
    try {
      const res = await fetch('/api/admin/security/api-keys')
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setIsLoadingKeys(false)
    }
  }, [])

  useEffect(() => {
    fetchSecuritySettings()
    fetch2FAStatus()
    fetchLogs()
    fetchSessions()
    fetchApiKeys()
  }, [fetchSecuritySettings, fetch2FAStatus, fetchLogs, fetchSessions, fetchApiKeys])

  useEffect(() => {
    fetchLogs()
  }, [logFilter, fetchLogs])

  // Save Settings
  const saveSecuritySettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securitySettings),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Speichern fehlgeschlagen')
      }
      
      toast.success('Sicherheitseinstellungen gespeichert!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Password Change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Die neuen Passwörter stimmen nicht überein')
      return
    }
    
    if (newPassword.length < securitySettings.passwordPolicy.minLength) {
      toast.error(`Das Passwort muss mindestens ${securitySettings.passwordPolicy.minLength} Zeichen lang sein`)
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Passwort-Änderung fehlgeschlagen')
      }
      
      toast.success('Passwort erfolgreich geändert!')
      setPasswordDialogOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      fetchLogs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern des Passworts')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Log Export
  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const res = await fetch(`/api/admin/security/logs/export?format=${format}&status=${logFilter}`)
      
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      
      if (format === 'csv') {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Logs als CSV exportiert')
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Logs als JSON exportiert')
      }
    } catch (error) {
      toast.error('Fehler beim Export')
    }
  }

  // IP Whitelist Functions
  const addIpToWhitelist = () => {
    if (!newIp.trim()) return
    
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
    if (!ipRegex.test(newIp) && newIp !== '*') {
      toast.error('Ungültiges IP-Format')
      return
    }
    
    if (securitySettings.ipWhitelist.ips.includes(newIp)) {
      toast.error('IP bereits in der Liste')
      return
    }
    
    setSecuritySettings({
      ...securitySettings,
      ipWhitelist: {
        ...securitySettings.ipWhitelist,
        ips: [...securitySettings.ipWhitelist.ips, newIp],
      }
    })
    setNewIp('')
  }

  const removeIpFromWhitelist = (ip: string) => {
    setSecuritySettings({
      ...securitySettings,
      ipWhitelist: {
        ...securitySettings.ipWhitelist,
        ips: securitySettings.ipWhitelist.ips.filter(i => i !== ip),
      }
    })
  }

  // 2FA Functions
  const start2FASetup = async () => {
    setIsSettingUp2FA(true)
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Setup fehlgeschlagen')
      }
      const data = await res.json()
      setTwoFactorSetup(data)
      setTwoFactorDialogOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '2FA Setup fehlgeschlagen')
    } finally {
      setIsSettingUp2FA(false)
    }
  }

  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Bitte geben Sie einen 6-stelligen Code ein')
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Verifizierung fehlgeschlagen')
      }
      
      toast.success('2FA erfolgreich aktiviert!')
      setShowBackupCodes(true)
      fetch2FAStatus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verifizierung fehlgeschlagen')
    } finally {
      setIsVerifying(false)
    }
  }

  const disable2FA = async () => {
    if (disableCode.length !== 6) {
      toast.error('Bitte geben Sie einen 6-stelligen Code ein')
      return
    }

    setIsDisabling(true)
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableCode }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Deaktivierung fehlgeschlagen')
      }
      
      toast.success('2FA erfolgreich deaktiviert')
      setDisableDialogOpen(false)
      setDisableCode('')
      fetch2FAStatus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deaktivierung fehlgeschlagen')
    } finally {
      setIsDisabling(false)
    }
  }

  const copyBackupCodes = () => {
    if (twoFactorSetup?.backupCodes) {
      navigator.clipboard.writeText(twoFactorSetup.backupCodes.join('\n'))
      setBackupCodesCopied(true)
      setTimeout(() => setBackupCodesCopied(false), 2000)
      toast.success('Backup-Codes kopiert!')
    }
  }

  const close2FADialog = () => {
    setTwoFactorDialogOpen(false)
    setTwoFactorSetup(null)
    setVerificationCode('')
    setShowBackupCodes(false)
  }

  // Session Functions
  const terminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/security/sessions?sessionId=${sessionId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Session beendet')
      fetchSessions()
    } catch {
      toast.error('Fehler beim Beenden der Session')
    }
  }

  const terminateAllSessions = async () => {
    if (!confirm('Möchten Sie wirklich alle anderen Sessions beenden?')) return
    try {
      const res = await fetch('/api/admin/security/sessions?terminateAll=true', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Alle anderen Sessions beendet')
      fetchSessions()
    } catch {
      toast.error('Fehler beim Beenden der Sessions')
    }
  }

  // API Key Functions
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    setIsCreatingKey(true)
    try {
      const res = await fetch('/api/admin/security/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          isTestMode: newKeyTestMode,
          expiresIn: newKeyExpires !== 'never' ? newKeyExpires : undefined,
        }),
      })
      
      if (!res.ok) throw new Error('Failed')
      
      const data = await res.json()
      setCreatedKey(data.key)
      toast.success('API-Schlüssel erstellt!')
      fetchApiKeys()
    } catch {
      toast.error('Fehler beim Erstellen des API-Schlüssels')
    } finally {
      setIsCreatingKey(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Möchten Sie diesen API-Schlüssel wirklich widerrufen?')) return
    try {
      const res = await fetch(`/api/admin/security/api-keys?id=${keyId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('API-Schlüssel widerrufen')
      fetchApiKeys()
    } catch {
      toast.error('Fehler beim Widerrufen')
    }
  }

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Helper Functions
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Ungültig'
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(date)
    } catch { return 'N/A' }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="mr-1 h-3 w-3" />Erfolg</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertTriangle className="mr-1 h-3 w-3" />Fehlgeschlagen</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><ShieldAlert className="mr-1 h-3 w-3" />Warnung</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEventLabel = (event: string) => {
    const labels: Record<string, string> = {
      'LOGIN': 'Login erfolgreich',
      'LOGOUT': 'Logout',
      'LOGIN_FAILED': 'Login fehlgeschlagen',
      'PASSWORD_CHANGED': 'Passwort geändert',
      'PASSWORD_CHANGE_FAILED': 'Passwort-Änderung fehlgeschlagen',
      'PASSWORD_RESET': 'Passwort zurückgesetzt',
      'TWO_FACTOR_ENABLED': '2FA aktiviert',
      'TWO_FACTOR_DISABLED': '2FA deaktiviert',
      'API_KEY_CREATED': 'API-Schlüssel erstellt',
      'API_KEY_REVOKED': 'API-Schlüssel widerrufen',
      'SESSION_TERMINATED': 'Session beendet',
      'SETTINGS_CHANGED': 'Einstellungen geändert',
      'LOG_EXPORTED': 'Logs exportiert',
      'NEW_DEVICE_LOGIN': 'Login von neuem Gerät',
      'NEW_LOCATION_LOGIN': 'Login von neuem Standort',
    }
    return labels[event] || event
  }

  // Security Score
  const calculateSecurityScore = () => {
    let score = 0
    if (twoFactorStatus.enabled) score += 30
    const failedRatio = logStats.failedCount / (logStats.successCount + logStats.failedCount + 1)
    if (failedRatio < 0.1) score += 25
    else if (failedRatio < 0.2) score += 15
    if (apiKeys.filter(k => k.isActive).length > 0) score += 20
    if (sessions.length > 0 && sessions.length < 10) score += 25
    return Math.min(100, score)
  }

  const securityScore = calculateSecurityScore()
  const getSecurityStatus = () => {
    if (securityScore >= 80) return { label: 'Ausgezeichnet', color: 'text-green-500', bg: 'bg-green-500/10' }
    if (securityScore >= 60) return { label: 'Gut', color: 'text-blue-500', bg: 'bg-blue-500/10' }
    if (securityScore >= 40) return { label: 'Mittel', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    return { label: 'Verbesserungswürdig', color: 'text-red-500', bg: 'bg-red-500/10' }
  }
  const securityStatus = getSecurityStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Sicherheit
          </h1>
          <p className="text-muted-foreground">
            Sicherheitseinstellungen, 2FA, Passwort-Richtlinien und Zugriffsprotokoll
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            fetchSecuritySettings()
            fetch2FAStatus()
            fetchLogs()
            fetchSessions()
            fetchApiKeys()
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card className={`bg-gradient-to-br ${securityStatus.bg} border-current/20`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-xl ${securityStatus.bg} flex items-center justify-center`}>
                <ShieldCheck className={`h-8 w-8 ${securityStatus.color}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sicherheitsstatus: {securityStatus.label}</h3>
                <p className="text-muted-foreground">
                  Letzte 24h: {logStats.successCount} erfolgreiche, {logStats.failedCount} fehlgeschlagene Aktionen
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${securityStatus.color}`}>{securityScore}%</div>
              <p className="text-sm text-muted-foreground">Security Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="sessions">Sitzungen ({sessions.length})</TabsTrigger>
          <TabsTrigger value="logs">Protokoll</TabsTrigger>
          <TabsTrigger value="api">API-Schlüssel</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 2FA Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Zwei-Faktor-Authentifizierung
                </CardTitle>
                <CardDescription>Zusätzliche Sicherheit für Ihr Konto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading2FA ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : twoFactorStatus.enabled ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-300">2FA ist aktiviert</p>
                          <p className="text-sm text-muted-foreground">Authenticator App</p>
                        </div>
                      </div>
                      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Verwalten
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>2FA Deaktivieren</DialogTitle>
                            <DialogDescription>
                              Geben Sie einen Code aus Ihrer Authenticator-App ein.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                  Das Deaktivieren von 2FA verringert die Sicherheit Ihres Kontos.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Authenticator Code</Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-2xl tracking-widest"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>Abbrechen</Button>
                            <Button variant="destructive" onClick={disable2FA} disabled={isDisabling || disableCode.length !== 6}>
                              {isDisabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              2FA Deaktivieren
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-300">2FA nicht aktiviert</p>
                          <p className="text-sm text-muted-foreground">Weniger Schutz</p>
                        </div>
                      </div>
                      <Button onClick={start2FASetup} disabled={isSettingUp2FA}>
                        {isSettingUp2FA ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                        Einrichten
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Passwort
                </CardTitle>
                <CardDescription>Ändern Sie Ihr Passwort</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Passwort ändern</p>
                      <p className="text-sm text-muted-foreground">Aktualisieren Sie regelmäßig Ihr Passwort</p>
                    </div>
                  </div>
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Ändern</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Passwort ändern</DialogTitle>
                        <DialogDescription>
                          Geben Sie Ihr aktuelles und neues Passwort ein.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Aktuelles Passwort</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPw ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Neues Passwort</Label>
                          <div className="relative">
                            <Input
                              type={showNewPw ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Mind. {securitySettings.passwordPolicy.minLength} Zeichen
                            {securitySettings.passwordPolicy.requireUppercase && ', Großbuchstaben'}
                            {securitySettings.passwordPolicy.requireNumbers && ', Zahlen'}
                            {securitySettings.passwordPolicy.requireSpecialChars && ', Sonderzeichen'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Passwort bestätigen</Label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Abbrechen</Button>
                        <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                          {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Passwort ändern
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktive Sitzungen</CardTitle>
                  <CardDescription>Alle Geräte und Benutzer, die gerade angemeldet sind</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchSessions}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Aktualisieren
                  </Button>
                  <Button variant="destructive" size="sm" onClick={terminateAllSessions}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Alle anderen abmelden
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Keine aktiven Sessions gefunden</p>
                  <p className="text-sm text-muted-foreground mt-1">Sessions werden bei jedem Login erstellt</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-medium">Benutzer</th>
                        <th className="text-left p-4 font-medium">Gerät / Browser</th>
                        <th className="text-left p-4 font-medium">Standort / IP</th>
                        <th className="text-left p-4 font-medium">Letzte Aktivität</th>
                        <th className="text-right p-4 font-medium">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session.id} className="border-b hover:bg-muted/30 transition-colors">
                          {/* Benutzer */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold">
                                {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {session.user?.name || 'Unbekannt'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {session.user?.email || 'Keine E-Mail'}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Gerät / Browser */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                {session.device?.toLowerCase() === 'mobile' || 
                                 session.os?.toLowerCase().includes('ios') || 
                                 session.os?.toLowerCase().includes('android') ? (
                                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Monitor className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{session.browser || 'Unbekannt'}</p>
                                <p className="text-xs text-muted-foreground">{session.os || 'Unbekannt'}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Standort / IP */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{session.location || 'Unbekannt'}</p>
                                <p className="text-xs text-muted-foreground font-mono">{session.ipAddress || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Letzte Aktivität */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{formatDate(session.lastActiveAt)}</p>
                                {session.isActive && (
                                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs mt-1">
                                    Aktiv
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Aktion */}
                          <td className="p-4 text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => terminateSession(session.id)}
                              className="gap-2"
                            >
                              <LogOut className="h-4 w-4" />
                              Abmelden
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Zusätzliche Info-Card */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Hinweis zur Session-Verwaltung</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wenn Sie eine Session abmelden, wird der Benutzer bei seiner nächsten Aktion automatisch ausgeloggt 
                    und zur Login-Seite weitergeleitet. Dies kann einige Sekunden dauern.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sicherheitsprotokoll</CardTitle>
                  <CardDescription>Alle sicherheitsrelevanten Ereignisse</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="success">Erfolgreich</SelectItem>
                      <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                      <SelectItem value="warning">Warnungen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => exportLogs('csv')}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={() => exportLogs('json')}>
                    <FileText className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Keine Logs gefunden</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-medium">Ereignis</th>
                        <th className="text-left p-4 font-medium">Benutzer</th>
                        <th className="text-left p-4 font-medium">IP / Standort</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Zeit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/30">
                          <td className="p-4">
                            <div className="font-medium">{getEventLabel(log.event)}</div>
                            {log.message && <div className="text-xs text-muted-foreground">{log.message}</div>}
                          </td>
                          <td className="p-4 text-sm">{log.userEmail}</td>
                          <td className="p-4 text-sm">
                            <div>{log.ipAddress || 'N/A'}</div>
                            <div className="text-muted-foreground">{log.location || 'Unbekannt'}</div>
                          </td>
                          <td className="p-4">{getStatusBadge(log.status)}</td>
                          <td className="p-4 text-sm text-muted-foreground">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API-Schlüssel</CardTitle>
                  <CardDescription>Verwalten Sie Ihre API-Zugangsdaten</CardDescription>
                </div>
                <Dialog open={newKeyDialogOpen} onOpenChange={(open) => {
                  setNewKeyDialogOpen(open)
                  if (!open) { setCreatedKey(null); setNewKeyName(''); setNewKeyTestMode(false); setNewKeyExpires('never') }
                }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Neuer Schlüssel</Button>
                  </DialogTrigger>
                  <DialogContent>
                    {createdKey ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>API-Schlüssel erstellt!</DialogTitle>
                          <DialogDescription>Speichern Sie diesen Schlüssel - er wird nur einmal angezeigt!</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <code className="text-sm break-all">{createdKey}</code>
                          </div>
                          <Button onClick={copyKey} className="w-full">
                            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copied ? 'Kopiert!' : 'Schlüssel kopieren'}
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>Fertig</Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Neuen API-Schlüssel erstellen</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="z.B. Zapier Integration" />
                          </div>
                          <div className="space-y-2">
                            <Label>Gültigkeit</Label>
                            <Select value={newKeyExpires} onValueChange={setNewKeyExpires}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Unbegrenzt</SelectItem>
                                <SelectItem value="30d">30 Tage</SelectItem>
                                <SelectItem value="90d">90 Tage</SelectItem>
                                <SelectItem value="1y">1 Jahr</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="testMode" checked={newKeyTestMode} onChange={(e) => setNewKeyTestMode(e.target.checked)} />
                            <Label htmlFor="testMode" className="cursor-pointer">Test-Modus</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>Abbrechen</Button>
                          <Button onClick={createApiKey} disabled={isCreatingKey}>
                            {isCreatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Erstellen
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingKeys ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Keine API-Schlüssel vorhanden</p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Key className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{key.name}</p>
                            {key.isTestMode && <Badge variant="outline" className="text-yellow-500">Test</Badge>}
                            {!key.isActive && <Badge variant="outline" className="text-red-500">Widerrufen</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <code>{key.keyPrefix}...</code> • Erstellt: {formatDate(key.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{key.usageCount} Anfragen</span>
                        {key.isActive && (
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => revokeApiKey(key.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Password Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Passwort-Richtlinien</CardTitle>
                  <CardDescription>Anforderungen für Benutzerpasswörter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Mindestlänge</Label>
                      <Input
                        type="number"
                        min={6}
                        max={128}
                        value={securitySettings.passwordPolicy.minLength}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, minLength: parseInt(e.target.value) || 8 }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Passwort-Ablauf (Tage)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Nie (0)"
                        value={securitySettings.passwordPolicy.maxAge || ''}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, maxAge: parseInt(e.target.value) || null }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Großbuchstaben erforderlich</Label>
                      <Switch
                        checked={securitySettings.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Zahlen erforderlich</Label>
                      <Switch
                        checked={securitySettings.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sonderzeichen erforderlich</Label>
                      <Switch
                        checked={securitySettings.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireSpecialChars: checked }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Login-Benachrichtigungen</CardTitle>
                  <CardDescription>E-Mail-Benachrichtigungen bei sicherheitsrelevanten Ereignissen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Benachrichtigungen aktiviert</Label>
                      <p className="text-sm text-muted-foreground">E-Mails bei verdächtigen Aktivitäten senden</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginNotifications.enabled}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        loginNotifications: { ...securitySettings.loginNotifications, enabled: checked }
                      })}
                    />
                  </div>
                  {securitySettings.loginNotifications.enabled && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Bei Login von neuem Gerät</Label>
                        <Switch
                          checked={securitySettings.loginNotifications.onNewDevice}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: { ...securitySettings.loginNotifications, onNewDevice: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Bei Login von neuem Standort</Label>
                        <Switch
                          checked={securitySettings.loginNotifications.onNewLocation}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: { ...securitySettings.loginNotifications, onNewLocation: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Bei fehlgeschlagenen Login-Versuchen</Label>
                        <Switch
                          checked={securitySettings.loginNotifications.onFailedAttempts}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: { ...securitySettings.loginNotifications, onFailedAttempts: checked }
                          })}
                        />
                      </div>
                      {securitySettings.loginNotifications.onFailedAttempts && (
                        <div className="space-y-2">
                          <Label>Schwellwert (Fehlversuche)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={securitySettings.loginNotifications.failedAttemptsThreshold}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              loginNotifications: { ...securitySettings.loginNotifications, failedAttemptsThreshold: parseInt(e.target.value) || 3 }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IP Whitelist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />IP-Whitelist</CardTitle>
                  <CardDescription>Beschränken Sie den Admin-Zugang auf bestimmte IPs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP-Whitelist aktiviert</Label>
                      <p className="text-sm text-muted-foreground">Nur erlaubte IPs können auf Admin zugreifen</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelist.enabled}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        ipWhitelist: { ...securitySettings.ipWhitelist, enabled: checked }
                      })}
                    />
                  </div>
                  {securitySettings.ipWhitelist.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="z.B. 192.168.1.1 oder 10.0.0.0/24"
                          value={newIp}
                          onChange={(e) => setNewIp(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addIpToWhitelist()}
                        />
                        <Button onClick={addIpToWhitelist}>Hinzufügen</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {securitySettings.ipWhitelist.ips.map((ip) => (
                          <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                            {ip}
                            <button onClick={() => removeIpFromWhitelist(ip)} className="ml-1 hover:text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {securitySettings.ipWhitelist.ips.length === 0 && (
                          <p className="text-sm text-muted-foreground">Keine IPs konfiguriert</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Session-Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Session-Timeout (Minuten)</Label>
                      <Input
                        type="number"
                        min={5}
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value) || 10080
                        })}
                      />
                      <p className="text-xs text-muted-foreground">Standard: 10080 (7 Tage)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max. aktive Sessions pro User</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={securitySettings.maxActiveSessions}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          maxActiveSessions: parseInt(e.target.value) || 5
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Label>2FA für Admins erforderlich</Label>
                      <p className="text-sm text-muted-foreground">Admins müssen 2FA aktiviert haben</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireTwoFactorForAdmin}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        requireTwoFactorForAdmin: checked
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={saveSecuritySettings} disabled={isSavingSettings} size="lg">
                  {isSavingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Einstellungen speichern
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={twoFactorDialogOpen} onOpenChange={(open) => { if (!open) close2FADialog() }}>
        <DialogContent className="max-w-md">
          <AnimatePresence mode="wait">
            {!showBackupCodes ? (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />2FA Einrichten</DialogTitle>
                  <DialogDescription>Scannen Sie den QR-Code mit Ihrer Authenticator-App</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {twoFactorSetup?.qrCode && (
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-xl shadow-lg">
                        <Image src={twoFactorSetup.qrCode} alt="2FA QR Code" width={200} height={200} className="rounded-lg" />
                      </div>
                    </div>
                  )}
                  {twoFactorSetup?.secret && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Oder manuell:</Label>
                      <div className="flex items-center gap-2">
                        <Input value={twoFactorSetup.secret} readOnly className="font-mono text-sm" />
                        <Button variant="outline" size="icon" onClick={() => {
                          navigator.clipboard.writeText(twoFactorSetup.secret)
                          toast.success('Kopiert!')
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Bestätigungscode</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={close2FADialog}>Abbrechen</Button>
                  <Button onClick={verify2FA} disabled={isVerifying || verificationCode.length !== 6}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Aktivieren
                  </Button>
                </DialogFooter>
              </motion.div>
            ) : (
              <motion.div key="backup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-green-500" />2FA Aktiviert!</DialogTitle>
                  <DialogDescription>Speichern Sie diese Backup-Codes sicher ab</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="font-medium text-green-700 dark:text-green-300">2FA ist jetzt aktiv</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup-Codes</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm grid grid-cols-2 gap-2">
                      {twoFactorSetup?.backupCodes.map((code, i) => (
                        <div key={i} className="text-center py-1 bg-background rounded">{code}</div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={copyBackupCodes} variant="outline" className="w-full">
                    {backupCodesCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {backupCodesCopied ? 'Kopiert!' : 'Backup-Codes kopieren'}
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={close2FADialog} className="w-full">Fertig</Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  )
}
