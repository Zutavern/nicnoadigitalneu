'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'
import { Loader2, Link2, CheckCircle2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Provider Icons
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

const PROVIDER_CONFIG: Record<string, { 
  name: string
  icon: React.FC<{ className?: string }>
  color: string
  available: boolean
}> = {
  google: { 
    name: 'Google', 
    icon: GoogleIcon, 
    color: 'bg-white border hover:bg-gray-50',
    available: true 
  },
  linkedin: { 
    name: 'LinkedIn', 
    icon: LinkedInIcon, 
    color: 'bg-[#0A66C2]/10 border-[#0A66C2]/20 hover:bg-[#0A66C2]/20',
    available: true 
  },
  apple: { 
    name: 'Apple', 
    icon: AppleIcon, 
    color: 'bg-black/5 border-black/10 hover:bg-black/10 dark:bg-white/10 dark:border-white/20',
    available: false // Not configured yet
  },
  facebook: { 
    name: 'Facebook', 
    icon: FacebookIcon, 
    color: 'bg-[#1877F2]/10 border-[#1877F2]/20 hover:bg-[#1877F2]/20',
    available: false // Not configured yet
  },
}

interface ConnectedAccount {
  id: string
  name: string
  icon: string
  connected: boolean
  accountId: string | null
}

interface ConnectedAccountsProps {
  accentColor?: string
}

export function ConnectedAccounts({ accentColor = 'primary' }: ConnectedAccountsProps) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [hasMultipleAccounts, setHasMultipleAccounts] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/user/connected-accounts')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts)
          setHasMultipleAccounts(data.hasMultipleAccounts)
        }
      } catch (error) {
        console.error('Error fetching connected accounts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleConnect = async (provider: string) => {
    const config = PROVIDER_CONFIG[provider]
    if (!config?.available) {
      toast.info(`${config?.name || provider} ist derzeit nicht verfügbar`)
      return
    }

    // Use next-auth signIn with redirect back to profile
    await signIn(provider, { 
      callbackUrl: window.location.href,
      redirect: true,
    })
  }

  const handleDisconnectClick = (provider: string) => {
    setSelectedProvider(provider)
    setShowDisconnectDialog(true)
  }

  const handleDisconnect = async () => {
    if (!selectedProvider) return

    setDisconnectingProvider(selectedProvider)
    try {
      const response = await fetch('/api/user/connected-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setAccounts(prev => prev.map(acc => 
          acc.id === selectedProvider ? { ...acc, connected: false, accountId: null } : acc
        ))
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setDisconnectingProvider(null)
      setShowDisconnectDialog(false)
      setSelectedProvider(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Verbundene Konten
          </CardTitle>
          <CardDescription>
            Verknüpfe dein Konto mit anderen Diensten für schnellere Anmeldung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((account) => {
            const config = PROVIDER_CONFIG[account.id]
            if (!config) return null
            
            const IconComponent = config.icon

            return (
              <div 
                key={account.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  account.connected 
                    ? "bg-green-500/5 border-green-500/20" 
                    : "bg-muted/50 border-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border",
                    config.color
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    {account.connected ? (
                      <p className="text-xs text-muted-foreground">
                        Verbunden
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {config.available ? 'Nicht verbunden' : 'Demnächst verfügbar'}
                      </p>
                    )}
                  </div>
                </div>
                
                {account.connected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600/50">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verbunden
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnectClick(account.id)}
                      disabled={disconnectingProvider === account.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {disconnectingProvider === account.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(account.id)}
                    disabled={!config.available}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Verbinden
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konto trennen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Verbindung zu {PROVIDER_CONFIG[selectedProvider || '']?.name} wirklich aufheben?
              {!hasMultipleAccounts && (
                <span className="block mt-2 text-amber-600">
                  Hinweis: Stelle sicher, dass du ein Passwort gesetzt hast, bevor du dein einziges verbundenes Konto trennst.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verbindung trennen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

