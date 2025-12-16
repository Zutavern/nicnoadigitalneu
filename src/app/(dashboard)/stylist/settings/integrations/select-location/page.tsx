'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Location {
  id: string
  name: string
  address: string
}

export default function SelectLocationPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/google-business/locations')
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Standorte')
        }
        const data = await response.json()
        setLocations(data.locations || [])
        
        // Auto-select if only one location
        if (data.locations?.length === 1) {
          setSelectedLocation(data.locations[0].id)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
        setError('Fehler beim Laden der Standorte')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const handleSave = async () => {
    if (!selectedLocation) {
      toast.error('Bitte wähle einen Standort aus')
      return
    }

    const location = locations.find(l => l.id === selectedLocation)
    if (!location) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/google-business/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: location.id,
          locationName: location.name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success('Google Business erfolgreich verbunden!')
      router.push('/stylist/settings/integrations')
    } catch (error) {
      console.error('Error saving location:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-muted-foreground">Lade verfügbare Standorte...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/stylist/settings/integrations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Integrationen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Keine Standorte gefunden</h2>
            <p className="text-muted-foreground mb-6">
              Es wurden keine Google Business Standorte für dieses Konto gefunden.
              Stelle sicher, dass du ein Google Business Profil erstellt hast.
            </p>
            <Button onClick={() => router.push('/stylist/settings/integrations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Integrationen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/stylist/settings/integrations')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <MapPin className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Standort auswählen</h1>
            <p className="text-muted-foreground">
              Wähle den Google Business Standort, den du verknüpfen möchtest
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Standorte</CardTitle>
            <CardDescription>
              {locations.length} Standort{locations.length !== 1 ? 'e' : ''} gefunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              className="space-y-3"
            >
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedLocation === location.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedLocation(location.id)}
                >
                  <RadioGroupItem
                    value={location.id}
                    id={location.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={location.id}
                      className="text-base font-medium cursor-pointer"
                    >
                      {location.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {location.address}
                    </p>
                  </div>
                  {selectedLocation === location.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/stylist/settings/integrations')}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedLocation || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Standort verbinden
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

