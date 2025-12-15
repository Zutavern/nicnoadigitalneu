'use client'

import { useState, useEffect } from 'react'
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
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Clock,
  Link as LinkIcon,
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

const platformConfig: Record<string, {
  name: string
  icon: React.ElementType
  color: string
  gradient: string
  connectUrl?: string
  description: string
}> = {
  INSTAGRAM: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
    description: 'Teile Bilder und Stories',
  },
  FACEBOOK: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    gradient: 'from-blue-600 to-blue-500',
    description: 'Erreiche deine Community',
  },
  LINKEDIN: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    gradient: 'from-blue-700 to-blue-600',
    description: 'Professionelles Networking',
  },
  TWITTER: {
    name: 'X/Twitter',
    icon: Twitter,
    color: 'text-gray-900',
    gradient: 'from-gray-800 to-black',
    description: 'Kurze Updates & Trends',
  },
  TIKTOK: {
    name: 'TikTok',
    icon: Share2,
    color: 'text-pink-500',
    gradient: 'from-pink-500 to-cyan-400',
    description: 'Virale Kurzvideos',
  },
  YOUTUBE: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    gradient: 'from-red-600 to-red-500',
    description: 'Video-Content',
  },
  PINTEREST: {
    name: 'Pinterest',
    icon: Share2,
    color: 'text-red-500',
    gradient: 'from-red-500 to-red-400',
    description: 'Visuelle Inspiration',
  },
  THREADS: {
    name: 'Threads',
    icon: Share2,
    color: 'text-black',
    gradient: 'from-gray-900 to-black',
    description: 'Text-basierte Konversationen',
  },
}

export default function SocialMediaAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

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

  const connectPlatform = (platform: string) => {
    setConnectingPlatform(platform)
    // TODO: OAuth-Flow starten
    // Für jetzt: Info-Toast
    toast.info(
      `OAuth-Verbindung für ${platformConfig[platform]?.name} wird in einer zukünftigen Version verfügbar sein.`,
      { duration: 5000 }
    )
    setConnectingPlatform(null)
  }

  // Verfügbare Plattformen (noch nicht verbunden)
  const connectedPlatforms = accounts.map(a => a.platform)
  const availablePlatforms = Object.keys(platformConfig).filter(
    p => !connectedPlatforms.includes(p)
  )

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
          <h2 className="text-lg font-semibold">Verbundene Accounts</h2>
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
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 text-red-600 text-xs">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{account.lastError}</span>
                        </div>
                      )}

                      {/* Aktionen */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" disabled>
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
        <h2 className="text-lg font-semibold">
          {accounts.length > 0 ? 'Weitere Plattformen verbinden' : 'Plattformen verbinden'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(platformConfig).map(([key, config]) => {
            const isConnected = connectedPlatforms.includes(key)
            const Icon = config.icon

            return (
              <motion.div
                key={key}
                whileHover={{ scale: isConnected ? 1 : 1.02 }}
                whileTap={{ scale: isConnected ? 1 : 0.98 }}
              >
                <Card className={cn(
                  'cursor-pointer transition-all h-full',
                  isConnected 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
                )}>
                  <CardContent className="pt-6 text-center">
                    <div className={cn(
                      'h-14 w-14 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br',
                      config.gradient
                    )}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold mt-3">{config.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      disabled={isConnected || connectingPlatform === key}
                      onClick={() => !isConnected && connectPlatform(key)}
                    >
                      {connectingPlatform === key ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : isConnected ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      {isConnected ? 'Verbunden' : 'Verbinden'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Info-Box */}
      <Card className="border-dashed border-blue-500/30 bg-blue-500/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-400">OAuth-Verbindungen</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Die direkte Verbindung zu Social Media Plattformen erfordert OAuth-Autorisierung.
                In der aktuellen Version kannst du Content vorbereiten und manuell veröffentlichen.
                Automatische Veröffentlichung wird in einem zukünftigen Update verfügbar sein.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

