'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Bell,
  Shield,
  Save,
  Loader2,
  Camera
} from 'lucide-react'

export default function SalonSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    salonName: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/salon/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchSettings()
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/salon/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalte deine Salon-Einstellungen
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Speichern
        </Button>
      </motion.div>

      <div className="grid gap-6">
        {/* Salon Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Salon-Informationen
              </CardTitle>
              <CardDescription>
                Grundlegende Informationen zu deinem Salon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon-Name</Label>
                <Input
                  id="salonName"
                  value={settings.salonName}
                  onChange={(e) => setSettings(prev => ({ ...prev, salonName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Kontaktdaten
              </CardTitle>
              <CardDescription>
                So können Kunden dich erreichen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                    className="pl-10"
                    placeholder="https://"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Adresse
              </CardTitle>
              <CardDescription>
                Standort deines Salons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Straße & Hausnummer</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input
                    id="zipCode"
                    value={settings.zipCode}
                    onChange={(e) => setSettings(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={settings.city}
                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>
                Verwalte deine Benachrichtigungseinstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">E-Mail-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Erhalte Benachrichtigungen per E-Mail
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Erhalte Benachrichtigungen per SMS
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Buchungserinnerungen</div>
                  <div className="text-sm text-muted-foreground">
                    Erinnerungen vor Terminen
                  </div>
                </div>
                <Switch
                  checked={settings.bookingReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, bookingReminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Marketing-E-Mails</div>
                  <div className="text-sm text-muted-foreground">
                    Neuigkeiten und Angebote von NICNOA
                  </div>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

