'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  Gift,
  Link2,
  Copy,
  Check,
  Mail,
  Clock,
  Loader2,
  Share2,
  Euro,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface ReferralProfile {
  referralCode: string
  totalReferrals: number
  successfulReferrals: number
  totalEarnings: number
  pendingRewardsCount: number
  pendingRewardsValue: number
}

interface Referral {
  id: string
  referredEmail: string
  referredName: string | null
  code: string
  status: 'PENDING' | 'REGISTERED' | 'CONVERTED' | 'REWARDED' | 'EXPIRED' | 'CANCELLED'
  invitedAt: string
  registeredAt: string | null
  convertedAt: string | null
  rewardType: string | null
  rewardValue: number | null
  rewardApplied: boolean
}

interface PendingReward {
  id: string
  rewardType: string
  rewardValue: number
  description: string
  expiresAt: string | null
}

interface ReferralData {
  profile: ReferralProfile
  referralCode: string
  referralLink: string
  referrals: Referral[]
  pendingRewards: PendingReward[]
  stats: {
    totalReferrals: number
    pendingReferrals: number
    successfulReferrals: number
    totalEarnings: number
    pendingRewardsCount: number
    pendingRewardsValue: number
  }
}

const statusConfig = {
  PENDING: { label: 'Eingeladen', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  REGISTERED: { label: 'Registriert', icon: UserPlus, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  CONVERTED: { label: 'Abonniert', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  REWARDED: { label: 'Belohnt', icon: Gift, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  EXPIRED: { label: 'Abgelaufen', icon: XCircle, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  CANCELLED: { label: 'Storniert', icon: AlertCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export default function StylistReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/user/referral')
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fehler beim Laden')
      }
      const responseData = await res.json()
      setData(responseData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Link kopiert!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Kopieren fehlgeschlagen')
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error('Bitte E-Mail-Adresse eingeben')
      return
    }

    setIsSendingInvite(true)
    try {
      const res = await fetch('/api/user/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fehler beim Senden')
      }

      toast.success('Einladung wurde erstellt!')
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteName('')
      fetchReferralData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setIsSendingInvite(false)
    }
  }

  const shareOnWhatsApp = () => {
    if (!data) return
    const text = `Hey! Ich nutze NICNOA für mein Friseur-Business und es ist super. Registriere dich über meinen Link und wir bekommen beide einen Bonus: ${data.referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareOnInstagram = () => {
    if (!data) return
    copyToClipboard(data.referralLink)
    toast.info('Link kopiert! Füge ihn in deiner Instagram Bio oder Story ein.')
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={fetchReferralData}>Erneut versuchen</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            Empfehlungsprogramm
          </h1>
          <p className="text-muted-foreground mt-1">
            Empfehle NICNOA und verdiene für jede erfolgreiche Anmeldung
          </p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Freund einladen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Freund einladen</DialogTitle>
              <DialogDescription>
                Lade einen Kollegen oder Freund ein. Wenn er sich registriert und ein Abo abschließt, bekommst du einen Monat gratis!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="freund@email.de"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Max Mustermann"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                {isSendingInvite ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Einladung senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-pink-500" />
              Dein persönlicher Empfehlungslink
            </CardTitle>
            <CardDescription>
              Teile diesen Link mit Freunden und Kollegen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={data.referralLink}
                className="font-mono text-sm bg-background/50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(data.referralLink)}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={shareOnWhatsApp}>
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnInstagram}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Instagram
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(data.referralLink)}>
                <Mail className="mr-2 h-4 w-4" />
                E-Mail teilen
              </Button>
            </div>
            
            <div className="rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 p-4 border border-pink-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-pink-500 mt-0.5" />
                <div>
                  <p className="font-medium">Dein Referral-Code: <span className="font-mono text-pink-500">{data.referralCode}</span></p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Für jede erfolgreiche Empfehlung erhältst du einen Monat gratis!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesendete Einladungen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats.pendingReferrals} ausstehend
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erfolgreiche Empfehlungen</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{data.stats.successfulReferrals}</div>
              <p className="text-xs text-muted-foreground">
                haben ein Abo abgeschlossen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verdiente Belohnungen</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{data.stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                gesamt verdient
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className={data.stats.pendingRewardsCount > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehende Belohnungen</CardTitle>
              <Gift className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{data.stats.pendingRewardsCount}</div>
              <p className="text-xs text-muted-foreground">
                €{data.stats.pendingRewardsValue.toFixed(2)} zu erhalten
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Rewards */}
      {data.pendingRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-500" />
                Ausstehende Belohnungen
              </CardTitle>
              <CardDescription>
                Diese Belohnungen werden bald auf dein Konto angewendet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.pendingRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        {reward.expiresAt && (
                          <p className="text-sm text-muted-foreground">
                            Gültig bis {format(new Date(reward.expiresAt), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                      €{reward.rewardValue.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Referral History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Empfehlungs-Verlauf
            </CardTitle>
            <CardDescription>
              Übersicht aller gesendeten Einladungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">Noch keine Einladungen</h3>
                <p className="text-muted-foreground mb-4">
                  Lade Freunde ein und verdiene Belohnungen!
                </p>
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Erste Einladung senden
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eingeladene Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eingeladen am</TableHead>
                    <TableHead>Belohnung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.referrals.map((referral) => {
                    const StatusIcon = statusConfig[referral.status]?.icon || Clock
                    return (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {referral.referredName || 'Noch nicht registriert'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {referral.referredEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[referral.status]?.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[referral.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(new Date(referral.invitedAt), 'dd.MM.yyyy', { locale: de })}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(referral.invitedAt), { addSuffix: true, locale: de })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {referral.rewardValue ? (
                            <div className="flex items-center gap-2">
                              <span className={referral.rewardApplied ? 'text-green-500' : 'text-muted-foreground'}>
                                €{referral.rewardValue.toFixed(2)}
                              </span>
                              {referral.rewardApplied && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>So funktioniert&apos;s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-pink-500">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Teile deinen Link</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sende deinen persönlichen Empfehlungslink an Freunde und Kollegen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-pink-500">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Dein Freund registriert sich</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wenn sich jemand über deinen Link anmeldet, wird er dir zugeordnet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-pink-500">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Beide bekommen einen Bonus</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nach dem ersten Abo-Abschluss erhaltet ihr beide einen kostenlosen Monat
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

