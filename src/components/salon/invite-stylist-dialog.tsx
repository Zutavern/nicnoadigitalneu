'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Mail,
  Copy,
  Check,
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  Send,
  QrCode,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import QRCode from 'qrcode'

interface UserStatus {
  status: 'not_registered' | 'wrong_role' | 'already_connected' | 'already_invited' | 'needs_email_verification' | 'needs_onboarding' | 'verified'
  message: string
  canInvite: boolean
  user?: {
    id?: string
    name?: string
    email?: string
    image?: string
    role?: string
  }
  invitationId?: string
  shortCode?: string
  onboardingStatus?: string
}

interface InviteStylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvitationSent?: () => void
}

export function InviteStylistDialog({
  open,
  onOpenChange,
  onInvitationSent,
}: InviteStylistDialogProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [invitationResult, setInvitationResult] = useState<{
    shortCode: string
    invitationUrl: string
    userStatus: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setEmail('')
      setMessage('')
      setUserStatus(null)
      setInvitationResult(null)
      setCopied(false)
      setQrCodeUrl(null)
    }
  }, [open])

  // Generate QR code when invitation is created
  useEffect(() => {
    if (invitationResult?.invitationUrl) {
      QRCode.toDataURL(invitationResult.invitationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(setQrCodeUrl).catch(console.error)
    }
  }, [invitationResult?.invitationUrl])

  // Check email status with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (email && email.includes('@') && email.includes('.')) {
        setIsChecking(true)
        try {
          const response = await fetch('/api/salon/invitations/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          const data = await response.json()
          setUserStatus(data)
        } catch (error) {
          console.error('Error checking email:', error)
        } finally {
          setIsChecking(false)
        }
      } else {
        setUserStatus(null)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [email])

  const handleSendInvitation = async (sendEmail: boolean = true) => {
    if (!email || !userStatus?.canInvite) return

    setIsSending(true)
    try {
      const response = await fetch('/api/salon/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, sendEmail }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Senden der Einladung')
      }

      const result = await response.json()
      setInvitationResult(result)

      toast({
        title: 'Einladung erstellt',
        description: sendEmail
          ? 'Die Einladung wurde per E-Mail versendet.'
          : 'Die Einladung wurde erstellt. Teilen Sie den Link.',
      })

      onInvitationSent?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({ title: 'Link kopiert!' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Fehler beim Kopieren' })
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.download = `einladung-${invitationResult?.shortCode}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />
    if (!userStatus) return null

    switch (userStatus.status) {
      case 'verified':
        return <UserCheck className="h-4 w-4 text-green-500" />
      case 'not_registered':
        return <UserX className="h-4 w-4 text-yellow-500" />
      case 'needs_email_verification':
      case 'needs_onboarding':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'already_connected':
      case 'already_invited':
      case 'wrong_role':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    if (!userStatus) return ''
    switch (userStatus.status) {
      case 'verified':
        return 'border-green-500/50 bg-green-500/10'
      case 'not_registered':
      case 'needs_email_verification':
      case 'needs_onboarding':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'already_connected':
      case 'already_invited':
      case 'wrong_role':
        return 'border-red-500/50 bg-red-500/10'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Stuhlmieter einladen
          </DialogTitle>
          <DialogDescription>
            Laden Sie einen Stylisten ein, Ihrem Salon beizutreten.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!invitationResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-4"
            >
              {/* E-Mail Input */}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="stylist@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn('pr-10', getStatusColor())}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                </div>
              </div>

              {/* Status Anzeige */}
              <AnimatePresence>
                {userStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      'rounded-lg border p-3',
                      getStatusColor()
                    )}>
                      {userStatus.user && (
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userStatus.user.image} />
                            <AvatarFallback>
                              {userStatus.user.name?.charAt(0) || userStatus.user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{userStatus.user.name || 'Unbekannt'}</p>
                            <p className="text-sm text-muted-foreground">{userStatus.user.email}</p>
                          </div>
                        </div>
                      )}
                      <p className="text-sm">{userStatus.message}</p>
                      
                      {userStatus.status === 'needs_onboarding' && userStatus.onboardingStatus && (
                        <Badge variant="outline" className="mt-2">
                          Onboarding: {userStatus.onboardingStatus}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nachricht */}
              {userStatus?.canInvite && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="message">Persönliche Nachricht (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Hallo! Wir haben einen schönen Fensterplatz frei..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleSendInvitation(false)}
                  disabled={!userStatus?.canInvite || isSending}
                  className="flex-1"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Nur Link erstellen
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleSendInvitation(true)}
                  disabled={!userStatus?.canInvite || isSending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Per E-Mail senden
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4"
            >
              {/* Erfolgs-Anzeige */}
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg">Einladung erstellt!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {invitationResult.userStatus === 'verified'
                    ? 'Die E-Mail wurde an den Stylisten gesendet.'
                    : 'Der Nutzer muss sich zuerst registrieren.'}
                </p>
              </div>

              {/* Einladungslink */}
              <div className="space-y-2">
                <Label>Einladungslink</Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationResult.invitationUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(invitationResult.invitationUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gültig für 7 Tage. Teilen Sie diesen Link per WhatsApp, SMS oder anderem Messenger.
                </p>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="rounded-lg border shadow-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      QR-Code herunterladen
                    </Button>
                  </div>
                </div>
              )}

              {/* Aktionen */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInvitationResult(null)
                    setEmail('')
                    setMessage('')
                    setUserStatus(null)
                  }}
                  className="flex-1"
                >
                  Weitere einladen
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Fertig
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}




