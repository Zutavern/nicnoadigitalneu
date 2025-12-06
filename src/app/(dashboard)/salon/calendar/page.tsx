'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Scissors,
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
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  differenceInMinutes
} from 'date-fns'
import { de } from 'date-fns/locale'

interface Booking {
  id: string
  customerName: string
  stylistName: string
  stylistImage?: string
  serviceName: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  totalPrice: number
}

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-500 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-500 border-red-500/30',
  NO_SHOW: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
}

const statusLabels = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
  NO_SHOW: 'No-Show',
}

type ViewType = 'month' | 'week' | 'day'

export default function SalonCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<ViewType>('month')

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(startOfMonth(currentDate), { locale: de }),
          end: endOfWeek(endOfMonth(currentDate), { locale: de }),
        }
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: de }),
          end: endOfWeek(currentDate, { locale: de }),
        }
      case 'day':
        return {
          start: currentDate,
          end: currentDate,
        }
    }
  }, [currentDate, view])

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/salon/bookings?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
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

    fetchBookings()
  }, [dateRange])

  const navigate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.startTime), date)
    )
  }

  const getTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: de })
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: de })
        const weekEnd = endOfWeek(currentDate, { locale: de })
        return `${format(weekStart, 'd.', { locale: de })} - ${format(weekEnd, 'd. MMMM yyyy', { locale: de })}`
      case 'day':
        return format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })
    }
  }

  const selectedDayBookings = getBookingsForDay(selectedDate)
  const todayEarnings = selectedDayBookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  // Group bookings by stylist
  const bookingsByStylist = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    const dayBookings = view === 'day' ? getBookingsForDay(currentDate) : selectedDayBookings
    dayBookings.forEach(booking => {
      if (!grouped[booking.stylistName]) {
        grouped[booking.stylistName] = []
      }
      grouped[booking.stylistName].push(booking)
    })
    return grouped
  }, [bookings, selectedDate, currentDate, view])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Salon Kalender</h1>
          <p className="text-muted-foreground">
            Alle Termine deiner Stylisten auf einen Blick
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
          <Plus className="mr-2 h-4 w-4" />
          Termin hinzufügen
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
                  <CalendarIcon className="h-5 w-5 text-emerald-500" />
                  {getTitle()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Heute
                  </Button>
                  <div className="flex rounded-lg border">
                    {(['month', 'week', 'day'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                          'px-3 py-1.5 text-sm transition-colors',
                          view === v 
                            ? 'bg-emerald-500 text-white' 
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
                    onClick={() => navigate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {view === 'month' && (
                    <MonthView
                      currentDate={currentDate}
                      selectedDate={selectedDate}
                      bookings={bookings}
                      onSelectDate={setSelectedDate}
                    />
                  )}
                  {view === 'week' && (
                    <WeekView
                      currentDate={currentDate}
                      bookings={bookings}
                      onSelectDate={setSelectedDate}
                    />
                  )}
                  {view === 'day' && (
                    <DayView
                      currentDate={currentDate}
                      bookings={getBookingsForDay(currentDate)}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Day Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-emerald-500" />
                {format(view === 'day' ? currentDate : selectedDate, 'EEEE, d. MMMM', { locale: de })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <div className="text-2xl font-bold text-emerald-500">
                    {(view === 'day' ? getBookingsForDay(currentDate) : selectedDayBookings).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Termine</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <div className="text-2xl font-bold text-emerald-500">
                    €{todayEarnings.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Umsatz</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings by Stylist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nach Stylist</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(bookingsByStylist).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(bookingsByStylist).map(([stylistName, stylistBookings]) => (
                    <div key={stylistName} className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={stylistBookings[0]?.stylistImage} />
                          <AvatarFallback>
                            {stylistName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{stylistName}</p>
                          <p className="text-xs text-muted-foreground">
                            {stylistBookings.length} Termine
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {stylistBookings.slice(0, 3).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {format(new Date(booking.startTime), 'HH:mm')}
                            </span>
                            <span className="truncate max-w-[100px]">{booking.customerName}</span>
                            <Badge variant="outline" className={cn('text-[10px]', statusColors[booking.status])}>
                              {statusLabels[booking.status]}
                            </Badge>
                          </div>
                        ))}
                        {stylistBookings.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{stylistBookings.length - 3} weitere
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Scissors className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Keine Termine an diesem Tag</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Dieser Monat</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-emerald-500">
                    {bookings.filter(b => b.status !== 'CANCELLED').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Termine</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-emerald-500">
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

// Month View Component
function MonthView({ 
  currentDate, 
  selectedDate, 
  bookings, 
  onSelectDate 
}: { 
  currentDate: Date
  selectedDate: Date
  bookings: Booking[]
  onSelectDate: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: de })
  const calendarEnd = endOfWeek(monthEnd, { locale: de })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.startTime), date)
    )
  }

  return (
    <>
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

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
              onClick={() => onSelectDate(day)}
              className={cn(
                'relative h-24 p-1 rounded-lg border transition-all text-left',
                isSelected && 'ring-2 ring-emerald-500 border-emerald-500',
                !isCurrentMonth && 'opacity-40',
                isToday && !isSelected && 'border-emerald-500/50',
                'hover:bg-muted/50'
              )}
            >
              <span className={cn(
                'absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full text-sm',
                isToday && 'bg-emerald-500 text-white'
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
                    {format(new Date(booking.startTime), 'HH:mm')} {booking.stylistName.split(' ')[0]}
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
    </>
  )
}

// Week View Component
function WeekView({ 
  currentDate, 
  bookings,
  onSelectDate
}: { 
  currentDate: Date
  bookings: Booking[]
  onSelectDate: (date: Date) => void
}) {
  const weekStart = startOfWeek(currentDate, { locale: de })
  const weekDays = eachDayOfInterval({ 
    start: weekStart, 
    end: endOfWeek(currentDate, { locale: de }) 
  })

  const hours = Array.from({ length: 16 }, (_, i) => i + 6)

  const getBookingsForDayAndHour = (day: Date, hour: number) => {
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.startTime)
      return isSameDay(bookingStart, day) && bookingStart.getHours() === hour
    })
  }

  const getBookingStyle = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const durationMinutes = differenceInMinutes(end, start)
    const height = (durationMinutes / 60) * 60
    const top = (start.getMinutes() / 60) * 60

    return {
      top: `${top}px`,
      height: `${Math.max(height, 20)}px`,
    }
  }

  return (
    <div className="overflow-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground">
            Zeit
          </div>
          {weekDays.map((day, i) => (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={cn(
                'p-2 text-center border-l hover:bg-muted/50 transition-colors',
                isSameDay(day, new Date()) && 'bg-emerald-500/10'
              )}
            >
              <div className="text-sm font-medium">
                {format(day, 'EEE', { locale: de })}
              </div>
              <div className={cn(
                'text-lg font-bold',
                isSameDay(day, new Date()) && 'text-emerald-500'
              )}>
                {format(day, 'd')}
              </div>
            </button>
          ))}
        </div>

        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b" style={{ height: '60px' }}>
              <div className="p-1 text-xs text-muted-foreground text-right pr-2 border-r">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
              {weekDays.map((day, dayIndex) => {
                const hourBookings = getBookingsForDayAndHour(day, hour)
                return (
                  <div 
                    key={dayIndex} 
                    className="relative border-l hover:bg-muted/30 transition-colors"
                    onClick={() => onSelectDate(day)}
                  >
                    {hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded px-1 text-[10px] overflow-hidden z-10',
                          statusColors[booking.status]
                        )}
                        style={getBookingStyle(booking)}
                      >
                        <div className="font-medium truncate">
                          {booking.stylistName.split(' ')[0]}
                        </div>
                        <div className="truncate">{booking.customerName}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Day View Component
function DayView({ 
  currentDate, 
  bookings 
}: { 
  currentDate: Date
  bookings: Booking[]
}) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6)

  const getBookingsForHour = (hour: number) => {
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.startTime)
      return bookingStart.getHours() === hour
    })
  }

  const getBookingStyle = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const durationMinutes = differenceInMinutes(end, start)
    const height = (durationMinutes / 60) * 80
    const top = (start.getMinutes() / 60) * 80

    return {
      top: `${top}px`,
      height: `${Math.max(height, 30)}px`,
    }
  }

  return (
    <div className="space-y-0">
      {hours.map((hour) => {
        const hourBookings = getBookingsForHour(hour)
        return (
          <div key={hour} className="flex border-b" style={{ minHeight: '80px' }}>
            <div className="w-16 p-2 text-sm text-muted-foreground text-right pr-3 border-r flex-shrink-0">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div className="flex-1 relative">
              {hourBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'absolute left-1 right-1 rounded-lg p-2 overflow-hidden',
                    statusColors[booking.status]
                  )}
                  style={getBookingStyle(booking)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {statusLabels[booking.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3 w-3" />
                      {booking.stylistName}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {booking.customerName}
                    </span>
                    <span className="font-medium">€{booking.totalPrice.toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
              {hourBookings.length === 0 && (
                <div className="h-full hover:bg-muted/30 transition-colors" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
