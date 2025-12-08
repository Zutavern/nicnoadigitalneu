'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Smartphone,
  Monitor,
  LogOut,
  RefreshCw,
  Download,
  Filter,
  Plus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Loader2,
  Copy,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

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
  createdBy?: {
    name: string | null
    email: string
  }
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [logStats, setLogStats] = useState({ successCount: 0, failedCount: 0, warningCount: 0 })
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [logFilter, setLogFilter] = useState('all')
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyTestMode, setNewKeyTestMode] = useState(false)
  const [newKeyExpires, setNewKeyExpires] = useState('never')
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchLogs()
    fetchSessions()
    fetchApiKeys()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [logFilter])

  const fetchLogs = async (retryCount = 0) => {
    setIsLoadingLogs(true)
    try {
      const statusParam = logFilter !== 'all' ? `&status=${logFilter.toUpperCase()}` : ''
      const res = await fetch(`/api/admin/security/logs?limit=50${statusParam}`)
      if (!res.ok) {
        // Retry auf 5xx Fehler
        if (res.status >= 500 && retryCount < 2) {
          await new Promise(r => setTimeout(r, 1000))
          return fetchLogs(retryCount + 1)
        }
        throw new Error(`Failed to fetch logs: ${res.status}`)
      }
      const data = await res.json()
      setLogs(data.logs || [])
      setLogStats(data.stats || { successCount: 0, failedCount: 0, warningCount: 0 })
    } catch (error) {
      console.error('Error fetching logs:', error)
      // Nur Toast zeigen, wenn es kein Retry war
      if (retryCount === 0) {
        toast.error('Fehler beim Laden der Logs')
      }
      // Setze leere Daten im Fehlerfall
      setLogs([])
      setLogStats({ successCount: 0, failedCount: 0, warningCount: 0 })
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const fetchSessions = async (retryCount = 0) => {
    setIsLoadingSessions(true)
    try {
      const res = await fetch('/api/admin/security/sessions')
      if (!res.ok) {
        if (res.status >= 500 && retryCount < 2) {
          await new Promise(r => setTimeout(r, 1000))
          return fetchSessions(retryCount + 1)
        }
        throw new Error(`Failed to fetch sessions: ${res.status}`)
      }
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      if (retryCount === 0) {
        toast.error('Fehler beim Laden der Sessions')
      }
      setSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const fetchApiKeys = async (retryCount = 0) => {
    setIsLoadingKeys(true)
    try {
      const res = await fetch('/api/admin/security/api-keys')
      if (!res.ok) {
        if (res.status >= 500 && retryCount < 2) {
          await new Promise(r => setTimeout(r, 1000))
          return fetchApiKeys(retryCount + 1)
        }
        throw new Error(`Failed to fetch API keys: ${res.status}`)
      }
      const data = await res.json()
      setApiKeys(data.apiKeys || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
      if (retryCount === 0) {
        toast.error('Fehler beim Laden der API-Schlüssel')
      }
      setApiKeys([])
    } finally {
      setIsLoadingKeys(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/security/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to terminate session')
      toast.success('Session beendet')
      fetchSessions()
    } catch (error) {
      toast.error('Fehler beim Beenden der Session')
    }
  }

  const terminateAllSessions = async () => {
    if (!confirm('Möchten Sie wirklich alle anderen Sessions beenden?')) return
    
    try {
      const res = await fetch('/api/admin/security/sessions?terminateAll=true', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to terminate sessions')
      toast.success('Alle anderen Sessions beendet')
      fetchSessions()
    } catch (error) {
      toast.error('Fehler beim Beenden der Sessions')
    }
  }

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
      
      if (!res.ok) throw new Error('Failed to create API key')
      
      const data = await res.json()
      setCreatedKey(data.key) // Der echte Key, nur einmal sichtbar!
      toast.success('API-Schlüssel erstellt!')
      fetchApiKeys()
    } catch (error) {
      toast.error('Fehler beim Erstellen des API-Schlüssels')
    } finally {
      setIsCreatingKey(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Möchten Sie diesen API-Schlüssel wirklich widerrufen?')) return
    
    try {
      const res = await fetch(`/api/admin/security/api-keys?id=${keyId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to revoke API key')
      toast.success('API-Schlüssel widerrufen')
      fetchApiKeys()
    } catch (error) {
      toast.error('Fehler beim Widerrufen des API-Schlüssels')
    }
  }

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Ungültiges Datum'
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return 'N/A'
    }
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
      'PASSWORD_RESET': 'Passwort zurückgesetzt',
      'TWO_FACTOR_ENABLED': '2FA aktiviert',
      'TWO_FACTOR_DISABLED': '2FA deaktiviert',
      'API_KEY_CREATED': 'API-Schlüssel erstellt',
      'API_KEY_REVOKED': 'API-Schlüssel widerrufen',
      'SESSION_TERMINATED': 'Session beendet',
      'PERMISSION_CHANGED': 'Berechtigung geändert',
      'SETTINGS_CHANGED': 'Einstellungen geändert',
      'USER_CREATED': 'Benutzer erstellt',
      'USER_DELETED': 'Benutzer gelöscht',
      'SUSPICIOUS_ACTIVITY': 'Verdächtige Aktivität',
    }
    return labels[event] || event
  }

  // Calculate security score
  const securityScore = 85 // Could be calculated based on various factors

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
            Sicherheitseinstellungen und Zugriffsprotokoll
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Security Score */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sicherheitsstatus: Gut</h3>
                <p className="text-muted-foreground">
                  Letzte 24h: {logStats.successCount} erfolgreiche, {logStats.failedCount} fehlgeschlagene Aktionen
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-500">{securityScore}%</div>
              <p className="text-sm text-muted-foreground">Security Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="sessions">Sitzungen ({sessions.length})</TabsTrigger>
          <TabsTrigger value="logs">Protokoll</TabsTrigger>
          <TabsTrigger value="api">API-Schlüssel ({apiKeys.filter(k => k.isActive).length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 2FA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Zwei-Faktor-Authentifizierung
                </CardTitle>
                <CardDescription>Zusätzliche Sicherheit für Admin-Konten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">2FA ist aktiviert</p>
                      <p className="text-sm text-muted-foreground">Authenticator App</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Verwalten</Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Passwort-Richtlinie
                </CardTitle>
                <CardDescription>Anforderungen für Benutzerpasswörter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Mindestlänge', value: '8 Zeichen', enabled: true },
                  { label: 'Großbuchstaben', value: 'Erforderlich', enabled: true },
                  { label: 'Zahlen', value: 'Erforderlich', enabled: true },
                  { label: 'Sonderzeichen', value: 'Optional', enabled: false },
                ].map((policy) => (
                  <div key={policy.label} className="flex items-center justify-between">
                    <span className="text-sm">{policy.label}</span>
                    <Badge variant={policy.enabled ? 'default' : 'outline'}>
                      {policy.value}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitsempfehlungen</CardTitle>
              <CardDescription>Verbessern Sie die Sicherheit Ihrer Plattform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: '2FA für alle Admins aktivieren', completed: true },
                  { title: 'Regelmäßige Passwort-Änderung erzwingen', completed: true },
                  { title: 'IP-Whitelist für Admin-Zugang einrichten', completed: false },
                  { title: 'Sicherheits-Audit durchführen', completed: true },
                  { title: 'Rate-Limiting konfigurieren', completed: true },
                ].map((rec, index) => (
                  <motion.div
                    key={rec.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      rec.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {rec.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className={rec.completed ? 'text-green-700 dark:text-green-300' : ''}>
                        {rec.title}
                      </span>
                    </div>
                    {!rec.completed && (
                      <Button size="sm">Einrichten</Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktive Sitzungen</CardTitle>
                  <CardDescription>Alle Geräte, die gerade angemeldet sind</CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={terminateAllSessions}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Alle anderen abmelden
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Keine aktiven Sessions gefunden</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {session.os?.toLowerCase().includes('ios') || session.os?.toLowerCase().includes('android') ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Monitor className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {session.browser || 'Unknown'} / {session.os || 'Unknown'}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.location || 'Unbekannt'} • {session.ipAddress || 'N/A'}
                          </p>
                          {session.user && (
                            <p className="text-xs text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            Zuletzt: {formatDate(session.lastActiveAt)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => terminateSession(session.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Logs */}
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
                      <SelectItem value="all">Alle Ereignisse</SelectItem>
                      <SelectItem value="success">Erfolgreich</SelectItem>
                      <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                      <SelectItem value="warning">Warnungen</SelectItem>
                    </SelectContent>
                  </Select>
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
                            {log.message && (
                              <div className="text-xs text-muted-foreground">{log.message}</div>
                            )}
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

        {/* API Keys */}
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
                  if (!open) {
                    setCreatedKey(null)
                    setNewKeyName('')
                    setNewKeyTestMode(false)
                    setNewKeyExpires('never')
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Neuen Schlüssel erstellen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {createdKey ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>API-Schlüssel erstellt!</DialogTitle>
                          <DialogDescription>
                            Speichern Sie diesen Schlüssel jetzt - er wird nur einmal angezeigt!
                          </DialogDescription>
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
                          <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
                            Fertig
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Neuen API-Schlüssel erstellen</DialogTitle>
                          <DialogDescription>
                            Erstellen Sie einen neuen API-Schlüssel für externe Integrationen.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="keyName">Name</Label>
                            <Input
                              id="keyName"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                              placeholder="z.B. Zapier Integration"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Gültigkeit</Label>
                            <Select value={newKeyExpires} onValueChange={setNewKeyExpires}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Unbegrenzt</SelectItem>
                                <SelectItem value="30d">30 Tage</SelectItem>
                                <SelectItem value="90d">90 Tage</SelectItem>
                                <SelectItem value="1y">1 Jahr</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="testMode"
                              checked={newKeyTestMode}
                              onChange={(e) => setNewKeyTestMode(e.target.checked)}
                            />
                            <Label htmlFor="testMode" className="cursor-pointer">
                              Test-Modus (nur für Entwicklung)
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
                            Abbrechen
                          </Button>
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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keine API-Schlüssel vorhanden
                </p>
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
                            {key.isTestMode && (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                                Test
                              </Badge>
                            )}
                            {!key.isActive && (
                              <Badge variant="outline" className="text-red-500 border-red-500/30">
                                Widerrufen
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <code>{key.keyPrefix}...</code> • Erstellt: {formatDate(key.createdAt)}
                            {key.lastUsedAt && ` • Zuletzt verwendet: ${formatDate(key.lastUsedAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {key.usageCount} Anfragen
                        </span>
                        {key.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => revokeApiKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Sicherheitshinweis</p>
                    <p className="text-sm text-muted-foreground">
                      Teilen Sie Ihre API-Schlüssel niemals öffentlich. Wenn ein Schlüssel kompromittiert wurde, 
                      widerrufen Sie ihn sofort.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
