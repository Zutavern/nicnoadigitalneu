'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  MapPin,
  Clock,
  Check,
  X,
  AlertCircle,
  Building2,
  UserCheck,
  ArrowRight,
  Scissors,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface InvitationData {
  id: string
  shortCode: string
  status: string
  expiresAt: string
  message?: string
  invitedEmail: string
  salon: {
    id: string
    name: string
    street: string
    city: string
    zipCode: string
    images: string[]
    description?: string
  }
  invitedBy: {
    name: string
    image?: string
  }
}

interface InvitationError {
  error: string
  code: string
  salon?: {
    name: string
  }
}

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const { toast } = useToast()
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<InvitationError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  // Einladung laden
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitation/${resolvedParams.code}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data)
        } else {
          setInvitation(data)
        }
      } catch (err) {
        setError({
          error: 'Fehler beim Laden der Einladung',
          code: 'FETCH_ERROR',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [resolvedParams.code])

  const handleAccept = async () => {
    if (!session?.user) {
      // Zur Login-Seite mit Redirect zurück
      signIn(undefined, { callbackUrl: `/join/${resolvedParams.code}` })
      return
    }

    setIsAccepting(true)
    try {
      const response = await fetch('/api/invitation/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resolvedParams.code }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'ONBOARDING_REQUIRED') {
          toast({
            variant: 'destructive',
            title: 'Onboarding erforderlich',
            description: 'Bitte schließen Sie zuerst das Onboarding ab.',
          })
          router.push('/onboarding/stylist')
          return
        }
        throw new Error(data.error || 'Fehler beim Annehmen der Einladung')
      }

      toast({
        title: 'Willkommen!',
        description: `Sie sind jetzt mit ${data.salon.name} verbunden.`,
      })

      router.push('/stylist')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!session?.user) {
      signIn(undefined, { callbackUrl: `/join/${resolvedParams.code}` })
      return
    }

    setIsRejecting(true)
    try {
      const response = await fetch('/api/invitation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resolvedParams.code, reason: rejectReason }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Ablehnen der Einladung')
      }

      toast({
        title: 'Einladung abgelehnt',
        description: 'Der Salonbesitzer wurde informiert.',
      })

      router.push('/stylist')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
      })
    } finally {
      setIsRejecting(false)
    }
  }

  // Loading State
  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Einladung wird geladen...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-destructive/20">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {error.code === 'EXPIRED' && 'Einladung abgelaufen'}
                {error.code === 'REVOKED' && 'Einladung zurückgezogen'}
                {error.code === 'ALREADY_ACCEPTED' && 'Bereits angenommen'}
                {error.code === 'REJECTED' && 'Einladung abgelehnt'}
                {error.code === 'NOT_FOUND' && 'Einladung nicht gefunden'}
                {!['EXPIRED', 'REVOKED', 'ALREADY_ACCEPTED', 'REJECTED', 'NOT_FOUND'].includes(error.code) && 'Fehler'}
              </h2>
              <p className="text-muted-foreground mb-6">{error.error}</p>
              {error.salon && (
                <p className="text-sm text-muted-foreground mb-4">
                  Salon: {error.salon.name}
                </p>
              )}
              <Button onClick={() => router.push('/')} variant="outline">
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!invitation) return null

  const expiresAt = new Date(invitation.expiresAt)
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Scissors className="h-4 w-4" />
            <span className="text-sm font-medium">NICNOA & CO.</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Einladung zum Salon
          </h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {/* Salon Image Header */}
            {invitation.salon.images?.[0] && (
              <div className="relative h-48 w-full">
                <img
                  src={invitation.salon.images[0]}
                  alt={invitation.salon.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white">{invitation.salon.name}</h2>
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    {invitation.salon.street}, {invitation.salon.zipCode} {invitation.salon.city}
                  </div>
                </div>
              </div>
            )}

            <CardContent className="p-6 space-y-6">
              {/* Invited By */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={invitation.invitedBy.image} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {invitation.invitedBy.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{invitation.invitedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    lädt Sie ein, als Stuhlmieter beizutreten
                  </p>
                </div>
              </div>

              {/* Personal Message */}
              {invitation.message && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-primary mb-2">Persönliche Nachricht:</p>
                  <p className="text-muted-foreground italic">"{invitation.message}"</p>
                </div>
              )}

              {/* Expiration */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Gültig bis {format(expiresAt, 'dd. MMMM yyyy', { locale: de })}
                </div>
                <Badge variant={daysLeft <= 2 ? 'destructive' : 'secondary'}>
                  {daysLeft} Tage
                </Badge>
              </div>

              {/* Auth Status */}
              {!session?.user && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">
                        Anmeldung erforderlich
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bitte melden Sie sich an oder registrieren Sie sich, um die Einladung anzunehmen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="Grund für die Ablehnung (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="flex-1"
                    >
                      {isRejecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Ablehnen bestätigen'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {!showRejectForm && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isAccepting}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Ablehnen
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    {isAccepting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : session?.user ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Einladung annehmen
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Anmelden & Annehmen
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Bei Fragen kontaktieren Sie uns unter{' '}
          <a href="mailto:support@nicnoa.de" className="text-primary hover:underline">
            support@nicnoa.de
          </a>
        </motion.p>
      </div>
    </div>
  )
}


