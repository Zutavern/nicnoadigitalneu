'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Loader2,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Link2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Connection {
  id: string
  userId: string
  googleEmail: string
  locationName: string
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ERROR'
  lastSyncedAt: string | null
  errorMessage: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image: string | null
  }
}

interface Stats {
  total: number
  active: number
  expired: number
  revoked: number
  error: number
  premiumUsers: number
  connectionRate: number
}

export default function AdminGoogleBusinessPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/google-business')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (connectionId: string) => {
    setDeletingId(connectionId)
    try {
      const response = await fetch(`/api/admin/google-business?connectionId=${connectionId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Verbindung gelöscht')
        setConnections(prev => prev.filter(c => c.id !== connectionId))
        if (stats) {
          setStats({ ...stats, total: stats.total - 1, active: stats.active - 1 })
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aktiv
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
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
            <AlertCircle className="h-3 w-3 mr-1" />
            Fehler
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredConnections = connections.filter(c =>
    c.googleEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Google Business Verbindungen</h1>
            <p className="text-muted-foreground">
              Übersicht aller Google Business Profile Verbindungen
            </p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Link2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Verbindungen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.premiumUsers}</p>
                  <p className="text-sm text-muted-foreground">Premium-User</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.connectionRate}%</p>
                  <p className="text-sm text-muted-foreground">Verbindungsrate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Connections Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alle Verbindungen</CardTitle>
                <CardDescription>
                  {filteredConnections.length} von {connections.length} Verbindungen
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Google Account</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Letzte Sync</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Keine Verbindungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConnections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={connection.user.image || undefined} />
                            <AvatarFallback>
                              {connection.user.name?.[0] || connection.user.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{connection.user.name || 'Unbekannt'}</p>
                            <p className="text-xs text-muted-foreground">{connection.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{connection.googleEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[200px]">{connection.locationName}</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(connection.status)}
                        {connection.errorMessage && (
                          <p className="text-xs text-red-500 mt-1 truncate max-w-[150px]">
                            {connection.errorMessage}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {connection.lastSyncedAt ? (
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(connection.lastSyncedAt), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nie</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Verbindung löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Die Verbindung von {connection.user.email} zu {connection.locationName} wird 
                                unwiderruflich gelöscht. Der Benutzer muss sein Google Business Profil 
                                neu verbinden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(connection.id)}
                                disabled={deletingId === connection.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingId === connection.id && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

