'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  Scissors,
  Loader2,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'

interface Booking {
  id: string
  customerName: string
  stylistName: string
  serviceName: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
}

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-500 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-500 border-red-500/30',
}

const statusLabels = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
}

export default function SalonCalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        const response = await fetch(
          `/api/salon/bookings?start=${start.toISOString()}&end=${end.toISOString()}`
        )
        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchBookings()
    }
  }, [session, currentDate])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground">
            Übersicht aller Termine und Buchungen
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <Plus className="mr-2 h-4 w-4" />
          Neuer Termin
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
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
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
                            ? 'bg-primary text-primary-foreground' 
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
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'relative h-24 p-1 rounded-lg border transition-all text-left',
                        isSelected && 'ring-2 ring-blue-500 border-blue-500',
                        !isCurrentMonth && 'opacity-40',
                        isToday && !isSelected && 'border-primary',
                        'hover:bg-muted/50'
                      )}
                    >
                      <span className={cn(
                        'absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full text-sm',
                        isToday && 'bg-primary text-primary-foreground'
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="mt-6 space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, 2).map((booking, i) => (
                          <div 
                            key={booking.id}
                            className={cn(
                              'text-[10px] px-1 py-0.5 rounded truncate',
                              statusColors[booking.status]
                            )}
                          >
                            {format(new Date(booking.startTime), 'HH:mm')} {booking.customerName}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayBookings.length - 2} weitere
                          </div>
                        )}
                      </div>
                    </button>
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
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedDayBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={statusColors[booking.status]}
                        >
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          {booking.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Scissors className="h-4 w-4" />
                          {booking.stylistName}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-muted-foreground">{booking.serviceName}</span>
                          <span className="font-medium">€{booking.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Termine an diesem Tag</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

