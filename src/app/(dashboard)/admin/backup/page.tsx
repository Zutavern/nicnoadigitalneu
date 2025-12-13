'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Database, 
  Download, 
  Trash2, 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  HardDrive,
  RefreshCw,
  Settings,
  AlertTriangle,
  Shield,
  FileArchive
} from 'lucide-react'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface BackupConfig {
  id: string
  isEnabled: boolean
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  scheduledTime: string
  scheduledDays: number[]
  retentionDays: number
  maxBackups: number
  storageProvider: string
  storagePath: string | null
  compressionEnabled: boolean
  compressionLevel: number
  encryptionEnabled: boolean
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  notificationEmail: string | null
  lastBackupAt: string | null
  nextBackupAt: string | null
}

interface Backup {
  id: string
  filename: string
  filePath: string
  fileSize: string
  checksum: string | null
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'
  type: 'MANUAL' | 'SCHEDULED' | 'PRE_UPDATE'
  tableCount: number
  rowCount: string
  isCompressed: boolean
  isEncrypted: boolean
  startedAt: string
  completedAt: string | null
  duration: number | null
  downloadCount: number
  createdAt: string
}

const WEEKDAYS = [
  { value: 0, label: 'Sonntag' },
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
]

interface StorageStatus {
  storage: {
    isConfigured: boolean
    provider: 'vercel-blob' | 'local'
    details: string
  }
  stats: {
    total: number
    completed: number
    failed: number
    inProgress: number
    totalSize: string
  }
  blobInfo: {
    count: number
    totalSize: number
  } | null
}

export default function BackupPage() {
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [backups, setBackups] = useState<Backup[]>([])
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('backups')

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup/config')
      if (!res.ok) throw new Error('Failed to fetch config')
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    }
  }, [])

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup')
      if (!res.ok) throw new Error('Failed to fetch backups')
      const data = await res.json()
      setBackups(data.backups)
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast.error('Fehler beim Laden der Backups')
    }
  }, [])

  const fetchStorageStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup/storage-status')
      if (!res.ok) throw new Error('Failed to fetch storage status')
      const data = await res.json()
      setStorageStatus(data)
    } catch (error) {
      console.error('Error fetching storage status:', error)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchConfig(), fetchBackups(), fetchStorageStatus()]).finally(() => setLoading(false))
  }, [fetchConfig, fetchBackups, fetchStorageStatus])

  const handleSaveConfig = async () => {
    if (!config) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/backup/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (!res.ok) throw new Error('Failed to save config')
      
      const data = await res.json()
      setConfig(data)
      toast.success('Konfiguration gespeichert')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      if (!res.ok) throw new Error('Failed to create backup')
      
      toast.success('Backup wird erstellt...')
      
      // Refresh backups after a delay
      setTimeout(() => {
        fetchBackups()
      }, 2000)
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Fehler beim Erstellen des Backups')
    } finally {
      setCreating(false)
    }
  }

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}/download`)
      
      if (!res.ok) throw new Error('Failed to download backup')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Download gestartet')
    } catch (error) {
      console.error('Error downloading backup:', error)
      toast.error('Fehler beim Download')
    }
  }

  const handleDeleteBackup = async (backup: Backup) => {
    if (!confirm('Möchten Sie dieses Backup wirklich löschen?')) return
    
    try {
      const res = await fetch(`/api/admin/backup?id=${backup.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete backup')
      
      setBackups((prev) => prev.filter((b) => b.id !== backup.id))
      toast.success('Backup gelöscht')
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const formatFileSize = (bytes: string) => {
    const size = Number(bytes)
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: Backup['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Abgeschlossen</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" />In Bearbeitung</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" />Fehlgeschlagen</Badge>
      case 'EXPIRED':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Abgelaufen</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-7 w-7" />
            Datenbank-Backups
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie automatische und manuelle Datenbank-Backups
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchConfig()
              fetchBackups()
              fetchStorageStatus()
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={handleCreateBackup} disabled={creating}>
            {creating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Backup jetzt erstellen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileArchive className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Erfolgreich</p>
                <p className="text-2xl font-bold">
                  {backups.filter((b) => b.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nächstes Backup</p>
                <p className="text-sm font-medium truncate">
                  {config?.nextBackupAt 
                    ? format(new Date(config.nextBackupAt), 'dd.MM. HH:mm', { locale: de })
                    : 'Nicht geplant'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <HardDrive className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Speicher</p>
                <p className="text-sm font-medium">
                  {formatFileSize(
                    backups
                      .filter((b) => b.status === 'COMPLETED')
                      .reduce((sum, b) => sum + Number(b.fileSize), 0)
                      .toString()
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Status Alert */}
      {storageStatus && (
        <Alert className={storageStatus.storage.provider === 'vercel-blob' ? 'border-green-500/50 bg-green-500/5' : 'border-amber-500/50 bg-amber-500/5'}>
          <HardDrive className={`h-4 w-4 ${storageStatus.storage.provider === 'vercel-blob' ? 'text-green-500' : 'text-amber-500'}`} />
          <AlertTitle className="flex items-center gap-2">
            Speicherort: {storageStatus.storage.provider === 'vercel-blob' ? 'Vercel Blob' : 'Lokaler Speicher'}
            <Badge variant={storageStatus.storage.provider === 'vercel-blob' ? 'default' : 'secondary'}>
              {storageStatus.storage.provider === 'vercel-blob' ? 'Produktionsbereit' : 'Nur Entwicklung'}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {storageStatus.storage.details}
            {storageStatus.blobInfo && (
              <span className="ml-2">
                • {storageStatus.blobInfo.count} Dateien in Vercel Blob ({formatFileSize(storageStatus.blobInfo.totalSize.toString())})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="backups">
            <FileArchive className="w-4 h-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup-Historie</CardTitle>
              <CardDescription>
                Alle erstellten Backups mit Download- und Lösch-Optionen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Backups vorhanden</h3>
                  <p className="text-muted-foreground mb-4">
                    Erstellen Sie Ihr erstes Backup, um Ihre Daten zu sichern.
                  </p>
                  <Button onClick={handleCreateBackup} disabled={creating}>
                    {creating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Erstes Backup erstellen
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dateiname</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Größe</TableHead>
                        <TableHead>Tabellen</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-mono text-sm">
                            {backup.filename}
                          </TableCell>
                          <TableCell>{getStatusBadge(backup.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {backup.type === 'MANUAL' ? 'Manuell' : 
                               backup.type === 'SCHEDULED' ? 'Geplant' : 'Pre-Update'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(backup.fileSize)}</TableCell>
                          <TableCell>{backup.tableCount}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(backup.createdAt), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {backup.status === 'COMPLETED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadBackup(backup)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBackup(backup)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-6">
          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Zeitplan
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie automatische Backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatische Backups aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Backups werden nach dem konfigurierten Zeitplan erstellt
                  </p>
                </div>
                <Switch
                  checked={config?.isEnabled}
                  onCheckedChange={(checked) => 
                    setConfig((prev) => prev ? { ...prev, isEnabled: checked } : null)
                  }
                />
              </div>

              {config?.isEnabled && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Häufigkeit</Label>
                      <Select
                        value={config.frequency}
                        onValueChange={(value) => 
                          setConfig((prev) => prev ? { ...prev, frequency: value as BackupConfig['frequency'] } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOURLY">Stündlich</SelectItem>
                          <SelectItem value="DAILY">Täglich</SelectItem>
                          <SelectItem value="WEEKLY">Wöchentlich</SelectItem>
                          <SelectItem value="MONTHLY">Monatlich</SelectItem>
                          <SelectItem value="CUSTOM">Benutzerdefiniert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Uhrzeit</Label>
                      <Input
                        type="time"
                        value={config.scheduledTime}
                        onChange={(e) => 
                          setConfig((prev) => prev ? { ...prev, scheduledTime: e.target.value } : null)
                        }
                      />
                    </div>
                  </div>

                  {(config.frequency === 'WEEKLY' || config.frequency === 'CUSTOM') && (
                    <div className="space-y-2">
                      <Label>Wochentage</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => (
                          <label
                            key={day.value}
                            className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-muted"
                          >
                            <Checkbox
                              checked={config.scheduledDays.includes(day.value)}
                              onCheckedChange={(checked) => {
                                setConfig((prev) => {
                                  if (!prev) return null
                                  const days = checked
                                    ? [...prev.scheduledDays, day.value]
                                    : prev.scheduledDays.filter((d) => d !== day.value)
                                  return { ...prev, scheduledDays: days.sort() }
                                })
                              }}
                            />
                            <span className="text-sm">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Retention Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Aufbewahrung
              </CardTitle>
              <CardDescription>
                Wie lange Backups aufbewahrt werden sollen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Aufbewahrungsdauer (Tage)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={config?.retentionDays}
                    onChange={(e) => 
                      setConfig((prev) => prev ? { ...prev, retentionDays: parseInt(e.target.value) } : null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Backups werden nach dieser Zeit automatisch gelöscht
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Maximale Anzahl Backups</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={config?.maxBackups}
                    onChange={(e) => 
                      setConfig((prev) => prev ? { ...prev, maxBackups: parseInt(e.target.value) } : null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Älteste Backups werden gelöscht wenn Limit erreicht
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compression & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Komprimierung & Sicherheit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Komprimierung aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Backups werden mit GZIP komprimiert
                  </p>
                </div>
                <Switch
                  checked={config?.compressionEnabled}
                  onCheckedChange={(checked) => 
                    setConfig((prev) => prev ? { ...prev, compressionEnabled: checked } : null)
                  }
                />
              </div>

              {config?.compressionEnabled && (
                <div className="space-y-2">
                  <Label>Komprimierungsstufe (1-9)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={config.compressionLevel}
                    onChange={(e) => 
                      setConfig((prev) => prev ? { ...prev, compressionLevel: parseInt(e.target.value) } : null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Höher = bessere Kompression, aber langsamer
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Verschlüsselung aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Backups werden AES-256 verschlüsselt (Coming Soon)
                  </p>
                </div>
                <Switch
                  checked={config?.encryptionEnabled}
                  onCheckedChange={(checked) => 
                    setConfig((prev) => prev ? { ...prev, encryptionEnabled: checked } : null)
                  }
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bei Erfolg benachrichtigen</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail nach erfolgreichem Backup
                  </p>
                </div>
                <Switch
                  checked={config?.notifyOnSuccess}
                  onCheckedChange={(checked) => 
                    setConfig((prev) => prev ? { ...prev, notifyOnSuccess: checked } : null)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bei Fehler benachrichtigen</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail wenn Backup fehlschlägt
                  </p>
                </div>
                <Switch
                  checked={config?.notifyOnFailure}
                  onCheckedChange={(checked) => 
                    setConfig((prev) => prev ? { ...prev, notifyOnFailure: checked } : null)
                  }
                />
              </div>

              {(config?.notifyOnSuccess || config?.notifyOnFailure) && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>E-Mail-Adresse</Label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={config?.notificationEmail || ''}
                    onChange={(e) => 
                      setConfig((prev) => prev ? { ...prev, notificationEmail: e.target.value } : null)
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving} size="lg">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Einstellungen speichern
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Warning for local storage */}
      {config?.storageProvider === 'local' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lokaler Speicher</AlertTitle>
          <AlertDescription>
            Backups werden lokal auf dem Server gespeichert. Für Produktionsumgebungen
            empfehlen wir Cloud-Speicher (S3, Cloudflare R2) für bessere Redundanz.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

