'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Armchair, 
  Building2,
  Calendar,
  Euro,
  MapPin,
  Clock,
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

interface ChairRental {
  id: string
  status: string
  startDate: string
  endDate: string | null
  monthlyRate: number
  chair: {
    id: string
    name: string
    description: string | null
    equipment: string[]
  }
  salon: {
    id: string
    name: string
    address: string
    city: string
    owner: {
      name: string
      image: string | null
    }
  }
}

export default function StylistWorkspacePage() {
  const [rental, setRental] = useState<ChairRental | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await fetch('/api/stylist/workspace')
        if (!res.ok) {
          if (res.status === 404) {
            setRental(null)
            return
          }
          throw new Error('Fehler beim Laden')
        }
        const data = await res.json()
        setRental(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRental()
  }, [])

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
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mein Arbeitsplatz</h1>
          <p className="text-muted-foreground">
            Du hast aktuell keinen aktiven Stuhl gemietet
          </p>
        </div>

        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <CardContent className="p-8 text-center">
            <Armchair className="mx-auto h-16 w-16 text-pink-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Warte auf eine Einladung</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Salonbesitzer können dich direkt einladen, in ihrem Salon zu arbeiten. 
              Du erhältst eine Benachrichtigung, sobald eine Einladung eingeht.
            </p>
            <Button asChild variant="outline" className="border-pink-500/30 hover:bg-pink-500/10">
              <Link href="/stylist/messages">
                <Building2 className="mr-2 h-4 w-4" />
                Nachrichten prüfen
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysActive = differenceInDays(new Date(), parseISO(rental.startDate))
  const monthProgress = Math.min((new Date().getDate() / 30) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Mein Arbeitsplatz</h1>
        <p className="text-muted-foreground">
          Dein aktueller Stuhl und Mietvertrag
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chair Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                    <Armchair className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{rental.chair.name}</CardTitle>
                    <CardDescription>{rental.salon.name}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={rental.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={rental.status === 'ACTIVE' ? 'bg-green-500' : ''}
                >
                  {rental.status === 'ACTIVE' ? 'Aktiv' : rental.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Salon Info */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={rental.salon.owner.image || undefined} />
                  <AvatarFallback>{rental.salon.owner.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{rental.salon.owner.name}</p>
                  <p className="text-sm text-muted-foreground">Salonbesitzer</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {rental.salon.address}, {rental.salon.city}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Kontakt
                </Button>
              </div>

              {/* Equipment */}
              {rental.chair.equipment && rental.chair.equipment.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Ausstattung</h4>
                  <div className="flex flex-wrap gap-2">
                    {rental.chair.equipment.map((item, index) => (
                      <Badge key={index} variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {rental.chair.description && (
                <div>
                  <h4 className="font-medium mb-2">Beschreibung</h4>
                  <p className="text-sm text-muted-foreground">{rental.chair.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Rental Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-pink-500" />
                Vertragsdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mietbeginn</span>
                <span className="font-medium">
                  {format(parseISO(rental.startDate), 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Laufzeit</span>
                <span className="font-medium">{daysActive} Tage</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monatliche Miete</span>
                <span className="font-bold text-lg">
                  €{rental.monthlyRate.toLocaleString('de-DE')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-500" />
                Monatlicher Fortschritt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(), 'MMMM yyyy', { locale: de })}
                  </span>
                  <span>{Math.round(monthProgress)}%</span>
                </div>
                <Progress value={monthProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Vertrag ansehen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Euro className="mr-2 h-4 w-4" />
                Zahlungsverlauf
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Kündigung anfragen
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


