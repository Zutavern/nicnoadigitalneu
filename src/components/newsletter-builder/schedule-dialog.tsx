'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Clock, Loader2, Send, Calendar as CalendarCheck } from 'lucide-react'
import { format, addDays, setHours, setMinutes } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (scheduledAt: Date) => Promise<void>
  onSendNow: () => Promise<void>
  isLoading?: boolean
  recipientCount?: number
}

// Schnellauswahl-Optionen
const QUICK_OPTIONS = [
  { label: 'In 1 Stunde', getValue: () => addDays(new Date(), 0).setHours(new Date().getHours() + 1, 0, 0, 0) },
  { label: 'Morgen 9:00', getValue: () => setMinutes(setHours(addDays(new Date(), 1), 9), 0) },
  { label: 'Morgen 14:00', getValue: () => setMinutes(setHours(addDays(new Date(), 1), 14), 0) },
  { label: 'Nächste Woche', getValue: () => setMinutes(setHours(addDays(new Date(), 7), 10), 0) },
]

// Uhrzeiten für Dropdown
const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
]

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  onSendNow,
  isLoading,
  recipientCount = 0,
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [selectedTime, setSelectedTime] = useState('10:00')
  const [mode, setMode] = useState<'schedule' | 'now'>('schedule')

  const handleSchedule = async () => {
    if (!selectedDate) return

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes)
    
    await onSchedule(scheduledAt)
  }

  const handleQuickOption = (getValue: () => number) => {
    const timestamp = getValue()
    const date = new Date(timestamp)
    setSelectedDate(date)
    setSelectedTime(format(date, 'HH:mm'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Newsletter versenden
          </DialogTitle>
          <DialogDescription>
            {recipientCount > 0 ? (
              <>Versende an <strong>{recipientCount} Empfänger</strong></>
            ) : (
              'Wähle, wann der Newsletter versendet werden soll'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Modus-Auswahl */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === 'now' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('now')}
          >
            <Send className="h-4 w-4 mr-2" />
            Jetzt senden
          </Button>
          <Button
            variant={mode === 'schedule' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('schedule')}
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            Planen
          </Button>
        </div>

        {mode === 'schedule' && (
          <div className="space-y-4">
            {/* Schnellauswahl */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Schnellauswahl</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_OPTIONS.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickOption(option.getValue)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Datum & Uhrzeit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'PPP', { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Uhrzeit</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Uhrzeit" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} Uhr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Zusammenfassung */}
            {selectedDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Geplanter Versand:</strong>{' '}
                  {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })} um {selectedTime} Uhr
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'now' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Der Newsletter wird sofort an alle {recipientCount || 'ausgewählten'} Empfänger versendet.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          {mode === 'schedule' ? (
            <Button onClick={handleSchedule} disabled={isLoading || !selectedDate}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4 mr-2" />
              )}
              Zeitplan erstellen
            </Button>
          ) : (
            <Button onClick={onSendNow} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Jetzt versenden
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



