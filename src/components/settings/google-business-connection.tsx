'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Link2,
  Link2Off,
  RefreshCw,
  MapPin,
  Mail,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface ConnectionStatus {
  isConnected: boolean
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ERROR' | null
  googleEmail: string | null
  locationName: string | null
  lastSyncedAt: string | null
  errorMessage: string | null
}

interface GoogleBusinessConnectionProps {
  basePath?: string // '/stylist' or '/salon'
}

export function GoogleBusinessConnection({ basePath = '/stylist' }: GoogleBusinessConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)

  const fetchStatus = async () => {
    try {
      // First check if Google Business is configured
      const configResponse = await fetch('/api/auth/google-business/config')
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setIsConfigured(configData.isConfigured)
        
        if (!configData.isConfigured) {
          setIsLoading(false)
          return
        }
      }

      const response = await fetch('/api/google-business/connection')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching connection status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/auth/google-business/connect'
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/auth/google-business/disconnect', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Google Business Verbindung getrennt')
        setStatus({
          isConnected: false,
          status: null,
          googleEmail: null,
          locationName: null,
          lastSyncedAt: null,
          errorMessage: null,
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Trennen der Verbindung')
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const getStatusBadge = () => {
    if (!status?.status) return null
    
    switch (status.status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verbunden
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Abgelaufen
          </Badge>
        )
      case 'REVOKED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Widerrufen
          </Badge>
        )
      case 'ERROR':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Fehler
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if Google Business is not configured on the server
  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 opacity-50" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Google Business Profile</CardTitle>
                <CardDescription>Verwalte dein Google Unternehmensprofil direkt aus NICNOA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Integration wird vorbereitet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Die Google Business Integration wird derzeit eingerichtet. Diese Funktion wird in Kürze verfügbar sein.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 via-red-500/5 to-yellow-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Google Icon */}
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Google Business Profile</CardTitle>
                <CardDescription>
                  Verwalte dein Google Unternehmensprofil direkt aus NICNOA
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {status?.isConnected ? (
            <div className="space-y-6">
              {/* Connection Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Google Konto</p>
                    <p className="text-sm font-medium">{status.googleEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Standort</p>
                    <p className="text-sm font-medium truncate">{status.locationName}</p>
                  </div>
                </div>
              </div>

              {status.lastSyncedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Letzte Synchronisierung:{' '}
                  {formatDistanceToNow(new Date(status.lastSyncedAt), {
                    addSuffix: true,
                    locale: de,
                  })}
                </div>
              )}

              {status.errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {status.errorMessage}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={fetchStatus} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Status aktualisieren
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Link2Off className="h-4 w-4 mr-2" />
                      Verbindung trennen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Verbindung trennen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Du verlierst den Zugriff auf dein Google Business Profil aus NICNOA.
                        Du kannst es jederzeit wieder verbinden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDisconnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Trennen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-6">
                Verbinde dein Google Business Profil, um Bewertungen zu verwalten, 
                Beiträge zu erstellen und deine Performance zu analysieren.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Bewertungen</p>
                  <p className="text-xs text-muted-foreground mt-1">Alle Reviews verwalten</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Posts erstellen</p>
                  <p className="text-xs text-muted-foreground mt-1">Direkt bei Google posten</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Analytics</p>
                  <p className="text-xs text-muted-foreground mt-1">Performance-Daten</p>
                </div>
              </div>

              <Button onClick={handleConnect} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link2 className="h-5 w-5 mr-2" />
                Mit Google verbinden
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

