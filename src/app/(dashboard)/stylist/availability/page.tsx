'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock,
  Save,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeSlot {
  id: string
  start: string
  end: string
}

interface DayAvailability {
  enabled: boolean
  slots: TimeSlot[]
}

const weekDays = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' },
]

export default function StylistAvailabilityPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    monday: { enabled: true, slots: [{ id: '1', start: '09:00', end: '17:00' }] },
    tuesday: { enabled: true, slots: [{ id: '2', start: '09:00', end: '17:00' }] },
    wednesday: { enabled: true, slots: [{ id: '3', start: '09:00', end: '17:00' }] },
    thursday: { enabled: true, slots: [{ id: '4', start: '09:00', end: '17:00' }] },
    friday: { enabled: true, slots: [{ id: '5', start: '09:00', end: '17:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  })

  const handleToggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled ? [{ id: Date.now().toString(), start: '09:00', end: '17:00' }] : [],
      },
    }))
  }

  const handleAddSlot = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: Date.now().toString(), start: '09:00', end: '17:00' }],
      },
    }))
  }

  const handleRemoveSlot = (day: string, slotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter(s => s.id !== slotId),
      },
    }))
  }

  const handleSlotChange = (day: string, slotId: string, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(s => 
          s.id === slotId ? { ...s, [field]: value } : s
        ),
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/stylist/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      })
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Verfügbarkeit</h1>
          <p className="text-muted-foreground">
            Lege fest, wann du für Buchungen verfügbar bist
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-pink-500 to-rose-500"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Speichern
        </Button>
      </motion.div>

      {/* Weekly Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              Wochenübersicht
            </CardTitle>
            <CardDescription>
              Aktiviere Tage und füge Zeitfenster hinzu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekDays.map((day, index) => {
              const dayData = availability[day.key]
              return (
                <motion.div
                  key={day.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    dayData.enabled ? 'bg-card' : 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={dayData.enabled}
                        onCheckedChange={() => handleToggleDay(day.key)}
                      />
                      <span className={cn(
                        'font-medium',
                        !dayData.enabled && 'text-muted-foreground'
                      )}>
                        {day.label}
                      </span>
                    </div>
                    {dayData.enabled && (
                      <Badge variant="outline" className="bg-pink-500/10 text-pink-500">
                        {dayData.slots.length} Zeitfenster
                      </Badge>
                    )}
                  </div>

                  {dayData.enabled && (
                    <div className="space-y-2 ml-10">
                      {dayData.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleSlotChange(day.key, slot.id, 'start', e.target.value)}
                            className="px-2 py-1 border rounded bg-background"
                          />
                          <span className="text-muted-foreground">bis</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleSlotChange(day.key, slot.id, 'end', e.target.value)}
                            className="px-2 py-1 border rounded bg-background"
                          />
                          {dayData.slots.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSlot(day.key, slot.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSlot(day.key)}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Zeitfenster hinzufügen
                      </Button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">💡 Tipps für deine Verfügbarkeit</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Halte deine Verfügbarkeit aktuell, um mehr Buchungen zu erhalten</li>
            <li>• Füge Pausen zwischen langen Schichten ein</li>
            <li>• Kunden können nur während deiner verfügbaren Zeiten buchen</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}



