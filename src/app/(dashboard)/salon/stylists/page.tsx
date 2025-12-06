'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Scissors, 
  Search, 
  Loader2,
  Star,
  Calendar,
  Euro,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Stylist {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  chairName: string
  monthlyRent: number
  startDate: string
  rating: number
  totalBookings: number
  monthlyBookings: number
  monthlyRevenue: number
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
}

const statusConfig = {
  ACTIVE: { label: 'Aktiv', color: 'bg-green-500/20 text-green-500' },
  PENDING: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-500' },
  INACTIVE: { label: 'Inaktiv', color: 'bg-gray-500/20 text-gray-500' },
}

export default function SalonStylistsPage() {
  const { data: session } = useSession()
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const response = await fetch('/api/salon/stylists')
        if (response.ok) {
          const data = await response.json()
          setStylists(data.stylists || [])
        }
      } catch (error) {
        console.error('Error fetching stylists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchStylists()
    }
  }, [session])

  const filteredStylists = stylists.filter(stylist =>
    stylist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stylist.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = stylists.reduce((sum, s) => sum + s.monthlyRent, 0)
  const activeStylists = stylists.filter(s => s.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Stylisten</h1>
          <p className="text-muted-foreground">
            Verwalte die Stylisten in deinem Salon
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <UserPlus className="mr-2 h-4 w-4" />
          Stylist einladen
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Aktive Stylisten', value: activeStylists, icon: Scissors, color: 'blue' },
          { label: 'Gesamt Stylisten', value: stylists.length, icon: Users, color: 'purple' },
          { label: 'Monatliche Mieteinnahmen', value: `€${totalRevenue.toLocaleString('de-DE')}`, icon: Euro, color: 'green' },
          { label: 'Durchschn. Bewertung', value: (stylists.reduce((s, st) => s + st.rating, 0) / (stylists.length || 1)).toFixed(1), icon: Star, color: 'yellow' },
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name oder E-Mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stylists Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStylists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStylists.map((stylist, index) => {
            const status = statusConfig[stylist.status]
            return (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={stylist.image} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                            {stylist.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{stylist.name}</h3>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
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
                          <DropdownMenuItem className="text-destructive">
                            Mietverhältnis beenden
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {stylist.email}
                      </div>
                      {stylist.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {stylist.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {stylist.chairName}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Seit {format(new Date(stylist.startDate), 'MMMM yyyy', { locale: de })}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{stylist.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Bewertung</div>
                      </div>
                      <div>
                        <div className="font-semibold">{stylist.monthlyBookings}</div>
                        <div className="text-xs text-muted-foreground">Buchungen/M</div>
                      </div>
                      <div>
                        <div className="font-semibold">€{stylist.monthlyRent}</div>
                        <div className="text-xs text-muted-foreground">Miete/M</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">Keine Stylisten gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Lade Stylisten ein, um deinen Salon zu füllen.
            </p>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Stylist einladen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

