'use client'

import { motion } from 'framer-motion'
import { Check, Clock, User } from 'lucide-react'

interface CalendarAnimationProps {
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export function CalendarAnimation({
  speed = 1,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
}: CalendarAnimationProps) {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']
  
  // Vordefinierte Buchungen für Animation
  const bookings = [
    { day: 0, slot: 1, name: 'Maria S.', type: 'Schnitt' },
    { day: 1, slot: 0, name: 'Lisa K.', type: 'Färben' },
    { day: 1, slot: 3, name: 'Anna M.', type: 'Styling' },
    { day: 2, slot: 2, name: 'Julia B.', type: 'Schnitt' },
    { day: 3, slot: 1, name: 'Sophie T.', type: 'Balayage' },
    { day: 3, slot: 4, name: 'Emma R.', type: 'Schnitt' },
    { day: 4, slot: 0, name: 'Lena H.', type: 'Behandlung' },
    { day: 4, slot: 3, name: 'Nina W.', type: 'Schnitt' },
    { day: 5, slot: 2, name: 'Sara P.', type: 'Styling' },
  ]

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
        style={{ backgroundColor: primaryColor }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3 / speed, repeat: Infinity }}
      />
      
      {/* Calendar Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 / speed }}
        className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b border-border/30"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2 / speed, repeat: Infinity }}
              >
                <Clock className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm">Terminkalender</p>
                <p className="text-xs text-muted-foreground">Diese Woche</p>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 / speed }}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              Live
            </motion.div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 px-3 py-2 border-b border-border/20">
          {days.map((day, i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (0.1 * i) / speed }}
              className="text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </motion.div>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="p-3 space-y-1">
          {timeSlots.map((time, slotIndex) => (
            <div key={time} className="grid grid-cols-7 gap-1 items-center">
              <div className="col-span-1 text-[10px] text-muted-foreground pr-1">
                {time}
              </div>
              {days.slice(0, 6).map((_, dayIndex) => {
                const booking = bookings.find(
                  b => b.day === dayIndex && b.slot === slotIndex
                )
                
                return (
                  <motion.div
                    key={`${dayIndex}-${slotIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: ((dayIndex * 0.1) + (slotIndex * 0.15)) / speed,
                      duration: 0.3 / speed,
                    }}
                    className={`h-7 rounded-md flex items-center justify-center text-[9px] font-medium transition-all ${
                      booking 
                        ? 'cursor-pointer hover:scale-105' 
                        : 'border border-dashed border-border/30 hover:border-primary/30'
                    }`}
                    style={booking ? { 
                      backgroundColor: `${primaryColor}20`,
                      borderLeft: `2px solid ${primaryColor}`,
                    } : {}}
                  >
                    {booking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: ((dayIndex * 0.1) + (slotIndex * 0.15) + 0.3) / speed }}
                        className="flex items-center gap-0.5 px-1"
                      >
                        <User className="h-2.5 w-2.5" style={{ color: primaryColor }} />
                        <span className="truncate max-w-[40px]">{booking.name.split(' ')[0]}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 / speed }}
          className="grid grid-cols-3 gap-2 p-3 border-t border-border/20"
          style={{ backgroundColor: `${secondaryColor}30` }}
        >
          {[
            { label: 'Buchungen', value: '24', change: '+12%' },
            { label: 'Auslastung', value: '87%', change: '+5%' },
            { label: 'No-Shows', value: '2%', change: '-80%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (1.8 + i * 0.1) / speed }}
              className="text-center"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p 
                className="text-[9px] font-medium"
                style={{ color: stat.change.startsWith('+') || stat.change.startsWith('-8') ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)' }}
              >
                {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Notification */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 2 / speed, duration: 0.5 / speed }}
        className="absolute -right-4 top-1/4 bg-card/95 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-xl max-w-[160px]"
      >
        <div className="flex items-start gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check className="h-3 w-3" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs font-medium">Neue Buchung</p>
            <p className="text-[10px] text-muted-foreground">Maria S. • 10:30</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


