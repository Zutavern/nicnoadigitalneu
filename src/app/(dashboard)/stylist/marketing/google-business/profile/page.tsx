'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Building2,
  Phone,
  Globe,
  MapPin,
  Clock,
  Save,
  Info,
  Calendar,
} from 'lucide-react'
import { DevelopmentBadge } from '@/components/google-business'
import { MOCK_PROFILE, MOCK_HOURS, MOCK_SPECIAL_HOURS, MOCK_ATTRIBUTES } from '@/lib/google-business/mock-data'

const DAY_LABELS: Record<string, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [hours, setHours] = useState(MOCK_HOURS)
  const [attributes, setAttributes] = useState(MOCK_ATTRIBUTES)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Änderungen gespeichert!', {
      description: 'Die Profildaten wurden aktualisiert. (Demo)',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/stylist/marketing/google-business">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Profil bearbeiten</h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground ml-12">
            Aktualisiere deine Google Business Profil-Daten
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grunddaten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Grunddaten
              </CardTitle>
              <CardDescription>
                Name, Kontakt und Adresse deines Salons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Salonname</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Beschreibung */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-500" />
                Beschreibung
              </CardTitle>
              <CardDescription>
                Erzähle Kunden von deinem Salon (mind. 750 Zeichen empfohlen)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      description: e.target.value,
                      descriptionLength: e.target.value.length,
                    })
                  }
                  rows={8}
                  placeholder="Beschreibe deinen Salon..."
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {profile.descriptionLength < 750 ? (
                      <span className="text-yellow-500">
                        {profile.descriptionLength}/750 Zeichen (empfohlen)
                      </span>
                    ) : (
                      <span className="text-green-500">
                        {profile.descriptionLength} Zeichen
                      </span>
                    )}
                  </span>
                  <span>Max. 750 Zeichen</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Öffnungszeiten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Öffnungszeiten
              </CardTitle>
              <CardDescription>Deine regulären Öffnungszeiten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hours.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium">{DAY_LABELS[day.day]}</span>
                  <Switch
                    checked={!day.isClosed}
                    onCheckedChange={(checked) => {
                      const newHours = [...hours]
                      newHours[index] = { ...day, isClosed: !checked }
                      setHours(newHours)
                    }}
                  />
                  {!day.isClosed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={day.open || ''}
                        onChange={(e) => {
                          const newHours = [...hours]
                          newHours[index] = { ...day, open: e.target.value }
                          setHours(newHours)
                        }}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={day.close || ''}
                        onChange={(e) => {
                          const newHours = [...hours]
                          newHours[index] = { ...day, close: e.target.value }
                          setHours(newHours)
                        }}
                        className="w-24"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Geschlossen</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Attribute */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Attribute & Ausstattung
              </CardTitle>
              <CardDescription>Was bietet dein Salon?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attributes.map((attr, index) => (
                <div key={attr.id} className="flex items-center justify-between">
                  <Label htmlFor={attr.id} className="flex items-center gap-2">
                    {attr.name}
                  </Label>
                  <Switch
                    id={attr.id}
                    checked={attr.value}
                    onCheckedChange={(checked) => {
                      const newAttrs = [...attributes]
                      newAttrs[index] = { ...attr, value: checked }
                      setAttributes(newAttrs)
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

