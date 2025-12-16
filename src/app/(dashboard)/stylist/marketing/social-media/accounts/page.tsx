'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Plus,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Clock,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Account {
  id: string
  platform: string
  platformAccountId: string
  accountName: string
  accountHandle: string | null
  profileImageUrl: string | null
  followersCount: number | null
  followingCount: number | null
  postsCount: number | null
  metricsUpdatedAt: string | null
  isActive: boolean
  lastSyncAt: string | null
  lastError: string | null
  createdAt: string
}

interface PlatformConfig {
  name: string
  icon: React.ElementType
  color: string
  gradient: string
  oauthEnabled: boolean
  description: string
  setupUrl?: string
}

const platformConfig: Record<string, PlatformConfig> = {
  INSTAGRAM: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
    oauthEnabled: true,
    description: 'Teile Bilder und Stories',
    setupUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  FACEBOOK: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    gradient: 'from-blue-600 to-blue-500',
    oauthEnabled: true,
    description: 'Erreiche deine Community',
    setupUrl: 'https://developers.facebook.com/docs/pages-api',
  },
  LINKEDIN: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    gradient: 'from-blue-700 to-blue-600',
    oauthEnabled: true,
    description: 'Professionelles Networking',
    setupUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow',
  },
  TWITTER: {
    name: 'X/Twitter',
    icon: Twitter,
    color: 'text-gray-900',
    gradient: 'from-gray-800 to-black',
    oauthEnabled: true,
    description: 'Kurze Updates & Trends',
    setupUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
  },
  TIKTOK: {
    name: 'TikTok',
    icon: Share2,
    color: 'text-pink-500',
    gradient: 'from-pink-500 to-cyan-400',
    oauthEnabled: true,
    description: 'Virale Kurzvideos',
    setupUrl: 'https://developers.tiktok.com/doc/login-kit-web',
  },
  YOUTUBE: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    gradient: 'from-red-600 to-red-500',
    oauthEnabled: false, // Benötigt Google API Setup
    description: 'Video-Content',
    setupUrl: 'https://developers.google.com/youtube/v3/getting-started',
  },
}

function SocialMediaAccountsContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // URL-Parameter für Erfolg/Fehler verarbeiten
  useEffect(() => {
    const connected = searchParams.get('connected')
    const platform = searchParams.get('platform')
    const error = searchParams.get('error')

    if (connected === 'true' && platform) {
      const config = platformConfig[platform.toUpperCase()]
      toast.success(`${config?.name || platform} erfolgreich verbunden!`, {
        description: 'Du kannst jetzt Posts planen und veröffentlichen.',
      })
      // URL bereinigen
      window.history.replaceState({}, '', '/stylist/marketing/social-media/accounts')
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        unauthorized: 'Du bist nicht angemeldet.',
        missing_params: 'OAuth-Parameter fehlen.',
        invalid_state: 'Ungültiger OAuth-State.',
        state_expired: 'OAuth-Session abgelaufen. Bitte erneut versuchen.',
        user_mismatch: 'User-Mismatch. Bitte erneut anmelden.',
        invalid_platform: 'Ungültige Plattform.',
      }
      toast.error('Verbindung fehlgeschlagen', {
        description: errorMessages[error] || error,
      })
      window.history.replaceState({}, '', '/stylist/marketing/social-media/accounts')
    }
  }, [searchParams])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/social/accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
      toast.error('Fehler beim Laden der Accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectAccount = async (accountId: string) => {
    try {
      const res = await fetch(`/api/social/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Account getrennt')
        loadAccounts()
      } else {
        throw new Error('Fehler beim Trennen')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Fehler beim Trennen des Accounts')
    }
  }

  const connectPlatform = async (platform: string) => {
    const config = platformConfig[platform]
    
    if (!config?.oauthEnabled) {
      toast.info(`${config?.name} wird bald verfügbar sein!`, {
        description: 'Wir arbeiten an der Integration.',
        duration: 4000,
      })
      return
    }

    setConnectingPlatform(platform)
    
    // Redirect zum OAuth-Flow
    window.location.href = `/api/social/oauth/${platform.toLowerCase()}`
  }

  const refreshAccount = async (accountId: string) => {
    try {
      toast.info('Account wird synchronisiert...')
      const res = await fetch(`/api/social/accounts/${accountId}/refresh`, {
        method: 'POST',
      })

      if (res.ok) {
        toast.success('Account synchronisiert')
        loadAccounts()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Synchronisieren')
      }
    } catch (error) {
      console.error('Error refreshing:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Synchronisieren')
    }
  }

  const connectedPlatforms = accounts.map(a => a.platform)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-purple-500" />
          Social Media Accounts
        </h1>
        <p className="text-muted-foreground mt-1">
          Verbinde und verwalte deine Social Media Profile
        </p>
      </div>

      {/* Verbundene Accounts */}
      {accounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Verbundene Accounts ({accounts.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const config = platformConfig[account.platform]
              const Icon = config?.icon || Share2

              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="relative overflow-hidden">
                    {/* Gradient Header */}
                    <div className={cn(
                      'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                      config?.gradient || 'from-gray-500 to-gray-400'
                    )} />

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br',
                            config?.gradient || 'from-gray-500 to-gray-400'
                          )}>
                            {account.profileImageUrl ? (
                              <img
                                src={account.profileImageUrl}
                                alt={account.accountName}
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <Icon className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{account.accountName}</CardTitle>
                            {account.accountHandle && (
                              <CardDescription>@{account.accountHandle}</CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge variant={account.isActive ? 'default' : 'secondary'} className="text-xs">
                          {account.isActive ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Aktiv</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" /> Inaktiv</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Metriken */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {account.followersCount?.toLocaleString() || '–'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Follower</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <FileText className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {account.postsCount?.toLocaleString() || '–'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Posts</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {account.followingCount?.toLocaleString() || '–'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Following</p>
                        </div>
                      </div>

                      {/* Letzte Sync */}
                      {account.lastSyncAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Zuletzt synchronisiert: {formatDistanceToNow(new Date(account.lastSyncAt), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </div>
                      )}

                      {/* Error */}
                      {account.lastError && (
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{account.lastError}</span>
                        </div>
                      )}

                      {/* Aktionen */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => refreshAccount(account.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Account trennen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Möchtest du die Verbindung zu {account.accountName} wirklich trennen?
                                Deine Posts bleiben erhalten.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => disconnectAccount(account.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Trennen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Verfügbare Plattformen */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5 text-purple-500" />
          {accounts.length > 0 ? 'Weitere Plattformen verbinden' : 'Plattformen verbinden'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformConfig).map(([key, config]) => {
            const isConnected = connectedPlatforms.includes(key)
            const Icon = config.icon
            const isConnecting = connectingPlatform === key

            return (
              <motion.div
                key={key}
                whileHover={{ scale: isConnected ? 1 : 1.02 }}
                whileTap={{ scale: isConnected ? 1 : 0.98 }}
              >
                <Card className={cn(
                  'cursor-pointer transition-all h-full relative overflow-hidden',
                  isConnected 
                    ? 'opacity-60 cursor-not-allowed' 
                    : config.oauthEnabled
                      ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
                      : 'hover:border-gray-400/50'
                )}>
                  {/* Coming Soon Badge */}
                  {!config.oauthEnabled && !isConnected && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 right-3 text-[10px]"
                    >
                      Bald verfügbar
                    </Badge>
                  )}
                  
                  <CardContent className="pt-6 text-center">
                    <div className={cn(
                      'h-14 w-14 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br',
                      config.gradient,
                      !config.oauthEnabled && !isConnected && 'opacity-50'
                    )}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold mt-3">{config.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    
                    <Button
                      variant={config.oauthEnabled ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'mt-4 w-full',
                        config.oauthEnabled && !isConnected && 'bg-purple-600 hover:bg-purple-700'
                      )}
                      disabled={isConnected || isConnecting}
                      onClick={() => !isConnected && connectPlatform(key)}
                    >
                      {isConnecting ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : isConnected ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <ExternalLink className="h-3 w-3 mr-1" />
                      )}
                      {isConnecting ? 'Verbinde...' : isConnected ? 'Verbunden' : 'Verbinden'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Setup Info */}
      <Card className="border-dashed border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-amber-700 dark:text-amber-400">
                Facebook/Instagram App erforderlich
              </h3>
              <p className="text-sm text-muted-foreground">
                Um Instagram und Facebook zu verbinden, benötigst du eine Facebook App mit den 
                entsprechenden Berechtigungen. Die App-Credentials müssen in den Umgebungsvariablen 
                konfiguriert sein.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <code className="text-xs bg-muted px-2 py-1 rounded">FACEBOOK_APP_ID</code>
                <code className="text-xs bg-muted px-2 py-1 rounded">FACEBOOK_APP_SECRET</code>
                <code className="text-xs bg-muted px-2 py-1 rounded">INSTAGRAM_APP_ID</code>
                <code className="text-xs bg-muted px-2 py-1 rounded">INSTAGRAM_APP_SECRET</code>
              </div>
              <a 
                href="https://developers.facebook.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mt-2"
              >
                Facebook Developer Portal öffnen
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrapper mit Suspense für useSearchParams
export default function SocialMediaAccounts() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SocialMediaAccountsContent />
    </Suspense>
  )
}
