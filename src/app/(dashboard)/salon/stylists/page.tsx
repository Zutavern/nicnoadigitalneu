'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { InviteStylistDialog } from '@/components/salon/invite-stylist-dialog'
import { 
  Scissors, 
  Search, 
  Loader2,
  Star,
  Euro,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  UserPlus,
  Clock,
  Users,
  Copy,
  Send,
  X,
  Check,
  AlertCircle,
  Link2,
  UserMinus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Connection {
  id: string
  stylistId: string
  role: string
  isActive: boolean
  joinedAt: string
  stylist: {
    id: string
    name: string
    email: string
    image?: string
    stylistProfile?: {
      phone?: string
      bio?: string
      instagramUrl?: string
    }
  }
  activeRental?: {
    chairName: string
    monthlyRent: number
    startDate: string
  }
  stats: {
    monthlyBookings: number
    monthlyRevenue: number
    avgRating: number
  }
}

interface Invitation {
  id: string
  invitedEmail: string
  invitedName?: string
  shortCode: string
  status: string
  expiresAt: string
  createdAt: string
  message?: string
  invitedUser?: {
    id: string
    name: string
    email: string
    image?: string
    onboardingCompleted: boolean
  }
}

const statusConfig = {
  PENDING: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  ACCEPTED: { label: 'Angenommen', color: 'bg-green-500/20 text-green-500', icon: Check },
  REJECTED: { label: 'Abgelehnt', color: 'bg-red-500/20 text-red-500', icon: X },
  EXPIRED: { label: 'Abgelaufen', color: 'bg-gray-500/20 text-gray-500', icon: AlertCircle },
  REVOKED: { label: 'Widerrufen', color: 'bg-gray-500/20 text-gray-500', icon: X },
}

export default function SalonStylistsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [connections, setConnections] = useState<Connection[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('connected')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [disconnectDialog, setDisconnectDialog] = useState<Connection | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const fetchData = async () => {
    try {
      const [connectionsRes, invitationsRes] = await Promise.all([
        fetch('/api/salon/connections'),
        fetch('/api/salon/invitations'),
      ])

      if (connectionsRes.ok) {
        const data = await connectionsRes.json()
        // API gibt { connections: [...] } zurück
        setConnections(data.connections || data || [])
      }
      if (invitationsRes.ok) {
        const data = await invitationsRes.json()
        // API gibt { invitations: [...] } zurück
        setInvitations(data.invitations || data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleDisconnect = async () => {
    if (!disconnectDialog) return

    setIsDisconnecting(true)
    try {
      const response = await fetch(`/api/salon/connections/${disconnectDialog.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Verbindung getrennt',
          description: `Die Verbindung mit ${disconnectDialog.stylist.name} wurde beendet.`,
        })
        setConnections(prev => prev.filter(c => c.id !== disconnectDialog.id))
      } else {
        throw new Error('Fehler beim Trennen der Verbindung')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Verbindung konnte nicht getrennt werden.',
      })
    } finally {
      setIsDisconnecting(false)
      setDisconnectDialog(null)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/salon/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({ title: 'Einladung widerrufen' })
        setInvitations(prev => prev.filter(i => i.id !== invitationId))
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Einladung konnte nicht widerrufen werden.',
      })
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/salon/invitations/resend/${invitationId}`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({ title: 'Einladung erneut gesendet' })
        fetchData()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Einladung konnte nicht erneut gesendet werden.',
      })
    }
  }

  const copyInvitationLink = (shortCode: string) => {
    const url = `${window.location.origin}/join/${shortCode}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link kopiert!' })
  }

  const filteredConnections = connections.filter(conn =>
    conn.stylist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.stylist.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingInvitations = invitations.filter(i => i.status === 'PENDING')
  const totalRevenue = connections.reduce((sum, c) => sum + (c.activeRental?.monthlyRent || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Stuhlmieter</h1>
          <p className="text-muted-foreground">
            Verwalte die Stylisten in deinem Salon
          </p>
        </div>
        <Button 
          onClick={() => setInviteDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Stuhlmieter einladen
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Verbundene Stylisten', value: connections.length, icon: Scissors, color: 'blue' },
          { label: 'Ausstehende Einladungen', value: pendingInvitations.length, icon: Clock, color: 'yellow' },
          { label: 'Monatliche Mieteinnahmen', value: `€${totalRevenue.toLocaleString('de-DE')}`, icon: Euro, color: 'green' },
          { label: 'Durchschn. Bewertung', value: connections.length > 0 
            ? (connections.reduce((s, c) => s + c.stats.avgRating, 0) / connections.length).toFixed(1) 
            : '-', 
            icon: Star, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    `bg-${stat.color}-500/10`
                  )}>
                    <stat.icon className={cn('h-5 w-5', `text-${stat.color}-500`)} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="connected" className="gap-2">
              <Users className="h-4 w-4" />
              Verbunden ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="h-4 w-4" />
              Einladungen ({invitations.length})
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Connected Stylists */}
        <TabsContent value="connected" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConnections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConnections.map((conn, index) => (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conn.stylist.image} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                              {conn.stylist.name?.split(' ').map(n => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{conn.stylist.name}</h3>
                            <Badge variant="outline" className="bg-green-500/20 text-green-500">
                              Aktiv
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Profil anzeigen</DropdownMenuItem>
                            <DropdownMenuItem>Nachricht senden</DropdownMenuItem>
                            <DropdownMenuItem>Buchungen anzeigen</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDisconnectDialog(conn)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Verbindung trennen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {conn.stylist.email}
                        </div>
                        {conn.stylist.stylistProfile?.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {conn.stylist.stylistProfile.phone}
                          </div>
                        )}
                        {conn.activeRental && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {conn.activeRental.chairName}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Seit {format(new Date(conn.joinedAt), 'MMMM yyyy', { locale: de })}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{conn.stats.avgRating.toFixed(1)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Bewertung</div>
                        </div>
                        <div>
                          <div className="font-semibold">{conn.stats.monthlyBookings}</div>
                          <div className="text-xs text-muted-foreground">Buchungen/M</div>
                        </div>
                        <div>
                          <div className="font-semibold">€{conn.activeRental?.monthlyRent || 0}</div>
                          <div className="text-xs text-muted-foreground">Miete/M</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">Keine Stylisten verbunden</h3>
                <p className="text-muted-foreground mb-4">
                  Laden Sie Stylisten ein, um deinen Salon zu füllen.
                </p>
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Stuhlmieter einladen
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invitations */}
        <TabsContent value="invitations" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length > 0 ? (
            <div className="space-y-4">
              {invitations.map((invitation, index) => {
                const status = statusConfig[invitation.status as keyof typeof statusConfig] || statusConfig.PENDING
                const isExpired = new Date(invitation.expiresAt) < new Date()
                const actualStatus = invitation.status === 'PENDING' && isExpired ? statusConfig.EXPIRED : status
                const StatusIcon = actualStatus.icon

                return (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={invitation.invitedUser?.image} />
                              <AvatarFallback className="bg-muted">
                                {invitation.invitedName?.charAt(0) || invitation.invitedEmail.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {invitation.invitedName || invitation.invitedEmail}
                                </span>
                                <Badge variant="outline" className={actualStatus.color}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {actualStatus.label}
                                </Badge>
                                {!invitation.invitedUser && invitation.status === 'PENDING' && (
                                  <Badge variant="outline" className="bg-orange-500/20 text-orange-500">
                                    Nicht registriert
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {invitation.invitedName && invitation.invitedEmail}
                                {' · '}
                                Eingeladen {formatDistanceToNow(new Date(invitation.createdAt), { 
                                  addSuffix: true, 
                                  locale: de 
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {invitation.status === 'PENDING' && !isExpired && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyInvitationLink(invitation.shortCode)}
                                >
                                  <Link2 className="mr-2 h-4 w-4" />
                                  Link kopieren
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResendInvitation(invitation.id)}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Erneut senden
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRevokeInvitation(invitation.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {invitation.message && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                            "{invitation.message}"
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">Keine Einladungen</h3>
                <p className="text-muted-foreground mb-4">
                  Sie haben noch keine Einladungen versendet.
                </p>
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Erste Einladung senden
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <InviteStylistDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvitationSent={fetchData}
      />

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={!!disconnectDialog} onOpenChange={() => setDisconnectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verbindung trennen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Verbindung mit {disconnectDialog?.stylist.name} wirklich beenden?
              Dies beendet auch alle aktiven Stuhlmieten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verbindung trennen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
