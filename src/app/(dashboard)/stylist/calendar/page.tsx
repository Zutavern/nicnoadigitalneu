'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  MapPin,
  Loader2,
  Plus,
  Euro
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek 
} from 'date-fns'
import { de } from 'date-fns/locale'

interface Booking {
  id: string
  customerName: string
  salonName: string
  serviceName: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
}

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  CONFIRMED: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
  COMPLETED: 'bg-green-500/20 text-green-500 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-500 border-red-500/30',
}

const statusLabels = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
}

export default function StylistCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        const response = await fetch(
          `/api/stylist/bookings?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        )
        if (response.ok) {
          const data = await response.json()
          // Map API response to component format
          const mappedBookings = (data || []).map((b: any) => ({
            id: b.id,
            customerName: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Unbekannt',
            salonName: b.salon?.name || 'Unbekannt',
            serviceName: b.services?.[0] || 'Service',
            startTime: b.startTime,
            endTime: b.endTime,
            status: b.status,
            totalPrice: b.totalPrice,
          }))
          setBookings(mappedBookings)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: de })
  const calendarEnd = endOfWeek(monthEnd, { locale: de })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.startTime), date)
    )
  }

  const selectedDayBookings = getBookingsForDay(selectedDate)

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  // Calculate daily earnings
  const todayEarnings = selectedDayBookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Mein Kalender</h1>
          <p className="text-muted-foreground">
            Übersicht deiner Termine und Buchungen
          </p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
          <Plus className="mr-2 h-4 w-4" />
          Blocker hinzufügen
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-pink-500" />
                  {format(currentDate, 'MMMM yyyy', { locale: de })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border">
                    {(['month', 'week', 'day'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                          'px-3 py-1.5 text-sm transition-colors',
                          view === v 
                            ? 'bg-pink-500 text-white' 
                            : 'hover:bg-muted'
                        )}
                      >
                        {v === 'month' ? 'Monat' : v === 'week' ? 'Woche' : 'Tag'}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                  <div 
                    key={day} 
                    className="py-2 text-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayBookings = getBookingsForDay(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'relative h-24 p-1 rounded-lg border transition-all text-left',
                        isSelected && 'ring-2 ring-pink-500 border-pink-500',
                        !isCurrentMonth && 'opacity-40',
                        isToday && !isSelected && 'border-pink-500/50',
                        'hover:bg-muted/50'
                      )}
                    >
                      <span className={cn(
                        'absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full text-sm',
                        isToday && 'bg-pink-500 text-white'
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="mt-6 space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, 2).map((booking) => (
                          <div 
                            key={booking.id}
                            className={cn(
                              'text-[10px] px-1 py-0.5 rounded truncate',
                              statusColors[booking.status]
                            )}
                          >
                            {format(new Date(booking.startTime), 'HH:mm')} {booking.customerName.split(' ')[0]}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayBookings.length - 2} weitere
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Day Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-pink-500" />
                {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEarnings > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tagesumsatz</span>
                    <div className="flex items-center gap-1 font-bold text-pink-500">
                      <Euro className="h-4 w-4" />
                      {todayEarnings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
              ) : selectedDayBookings.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-auto">
                  {selectedDayBookings
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((booking) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', statusColors[booking.status])}
                        >
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {booking.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.salonName}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {booking.serviceName}
                          </Badge>
                          <span className="font-medium text-pink-500">
                            €{booking.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Termine an diesem Tag</p>
                  <p className="text-sm mt-1">Zeit für eine Pause! ☕</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Dieser Monat</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-pink-500">
                    {bookings.filter(b => b.status !== 'CANCELLED').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Termine</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-pink-500">
                    €{bookings
                      .filter(b => b.status === 'COMPLETED')
                      .reduce((sum, b) => sum + b.totalPrice, 0)
                      .toLocaleString('de-DE')}
                  </div>
                  <div className="text-xs text-muted-foreground">Umsatz</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
