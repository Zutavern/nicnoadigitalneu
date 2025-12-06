'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Euro,
  Armchair,
  Loader2,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  Info,
  Send,
  Calendar as CalendarIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { de } from 'date-fns/locale'

interface Chair {
  id: string
  name: string
  description: string | null
  monthlyRate: number | null
  amenities: string[]
  isAvailable: boolean
}

interface SalonDetail {
  id: string
  name: string
  slug: string
  description: string | null
  street: string
  city: string
  zipCode: string
  phone: string | null
  email: string | null
  website: string | null
  images: string[]
  amenities: string[]
  rating: number
  reviewCount: number
  owner: {
    name: string
    email: string | null
    image: string | null
  }
  chairs: Chair[]
}

export default function SalonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [salon, setSalon] = useState<SalonDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchSalonDetail = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/stylist/find-salon/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/stylist/find-salon')
            return
          }
          throw new Error('Fehler beim Laden')
        }
        const data = await res.json()
        setSalon(data)
      } catch (error) {
        console.error('Error fetching salon:', error)
        toast.error('Salon konnte nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }
    if (params.id) {
      fetchSalonDetail()
    }
  }, [params.id, router])

  const handleBookChair = (chair: Chair) => {
    setSelectedChair(chair)
    setIsBookingDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!selectedChair || !startDate) {
      toast.error('Bitte wählen Sie ein Startdatum')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/stylist/chair-rental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chairId: selectedChair.id,
          startDate: startDate.toISOString(),
          message
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Senden der Anfrage')
      }

      toast.success('Mietanfrage erfolgreich gesendet!')
      setIsBookingDialogOpen(false)
      setSelectedChair(null)
      setStartDate(undefined)
      setMessage('')
      
      // Redirect to workspace page
      router.push('/stylist/workspace')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Salon nicht gefunden</h2>
        <Button asChild>
          <Link href="/stylist/find-salon">Zurück zur Suche</Link>
        </Button>
      </div>
    )
  }

  const availableChairs = salon.chairs.filter(c => c.isAvailable)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/stylist/find-salon">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Suche
        </Link>
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-500/20 to-rose-500/20">
            {salon.images?.[0] ? (
              <img 
                src={salon.images[0]} 
                alt={salon.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="h-24 w-24 text-pink-500/30" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">{salon.name}</h1>
              <div className="flex items-center gap-4 text-white/90 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {salon.street}, {salon.zipCode} {salon.city}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {salon.rating.toFixed(1)} ({salon.reviewCount} Bewertungen)
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Owner Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={salon.owner.image || undefined} />
                  <AvatarFallback>{salon.owner.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{salon.owner.name}</p>
                  <p className="text-sm text-muted-foreground">Salonbesitzer</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {salon.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${salon.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Anrufen
                    </a>
                  </Button>
                )}
                {salon.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${salon.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      E-Mail
                    </a>
                  </Button>
                )}
                {salon.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={salon.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {salon.description && (
              <p className="mt-4 text-muted-foreground">{salon.description}</p>
            )}

            {/* Amenities */}
            {salon.amenities.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Ausstattung</h3>
                <div className="flex flex-wrap gap-2">
                  {salon.amenities.map((amenity, i) => (
                    <Badge key={i} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Chairs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Armchair className="h-5 w-5 text-pink-500" />
              Verfügbare Stühle
            </CardTitle>
            <CardDescription>
              {availableChairs.length} von {salon.chairs.length} Stühlen verfügbar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salon.chairs.length === 0 ? (
              <div className="text-center py-8">
                <Armchair className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Stühle verfügbar</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {salon.chairs.map((chair) => (
                  <Card key={chair.id} className={!chair.isAvailable ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{chair.name}</h3>
                          {chair.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {chair.description}
                            </p>
                          )}
                        </div>
                        {chair.isAvailable ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Frei
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Belegt
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      {chair.monthlyRate && (
                        <div className="flex items-center gap-1 mb-3">
                          <Euro className="h-4 w-4 text-pink-500" />
                          <span className="text-xl font-bold">{chair.monthlyRate}</span>
                          <span className="text-sm text-muted-foreground">/Monat</span>
                        </div>
                      )}

                      {/* Amenities */}
                      {chair.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {chair.amenities.slice(0, 3).map((amenity, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {chair.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{chair.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Book Button */}
                      <Button 
                        className="w-full bg-pink-500 hover:bg-pink-600"
                        disabled={!chair.isAvailable}
                        onClick={() => handleBookChair(chair)}
                      >
                        {chair.isAvailable ? 'Anfrage senden' : 'Nicht verfügbar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-300">Wie funktioniert die Buchung?</p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Nach Ihrer Anfrage wird der Salonbesitzer benachrichtigt. Bei Zusage erhalten Sie eine 
                Bestätigung und können die Details direkt mit dem Salon besprechen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mietanfrage senden</DialogTitle>
            <DialogDescription>
              Anfrage für "{selectedChair?.name}" bei {salon.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Chair Info */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{selectedChair?.name}</p>
                    <p className="text-sm text-muted-foreground">{salon.name}</p>
                  </div>
                  {selectedChair?.monthlyRate && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-pink-500">
                        €{selectedChair.monthlyRate}
                      </p>
                      <p className="text-xs text-muted-foreground">/Monat</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Gewünschtes Startdatum *</Label>
              <div className="border rounded-lg p-2">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={de}
                  disabled={(date) => date < new Date()}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Nachricht an den Salonbesitzer</Label>
              <Textarea
                id="message"
                placeholder="Stellen Sie sich kurz vor und beschreiben Sie Ihre Situation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Cost Info */}
            {selectedChair?.monthlyRate && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monatliche Miete</span>
                  <span className="font-medium">€{selectedChair.monthlyRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kaution (2 Monatsmieten)</span>
                  <span className="font-medium">€{selectedChair.monthlyRate * 2}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Erste Zahlung</span>
                  <span>€{selectedChair.monthlyRate * 3}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={!startDate || isSubmitting}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Anfrage senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


