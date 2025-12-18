'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Shield,
  Save,
  Loader2,
  Camera,
  Instagram,
  Link2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { TwoFactorSettings } from '@/components/settings/two-factor-settings'
import { ConnectedAccounts } from '@/components/profile/connected-accounts'
import { toast } from 'sonner'

// Security Tab Component
function SecurityTab({ session }: { session: any }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Die Passwörter stimmen nicht überein')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Das Passwort muss mindestens 8 Zeichen lang sein')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Passwort erfolgreich geändert')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.error || 'Fehler beim Ändern des Passworts')
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Verifizierungs-E-Mail gesendet')
      } else {
        toast.error(data.error || 'Fehler beim Senden der E-Mail')
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsSendingVerification(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Email Verification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-pink-500" />
              E-Mail-Verifizierung
            </CardTitle>
            <CardDescription>
              Bestätige deine E-Mail-Adresse für zusätzliche Sicherheit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
              <div className="flex items-center gap-3">
                {session?.user?.emailVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <div className="font-medium">
                    {session?.user?.emailVerified ? 'E-Mail verifiziert' : 'E-Mail nicht verifiziert'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session?.user?.email}
                  </div>
                </div>
              </div>
              {!session?.user?.emailVerified && (
                <Button
                  variant="outline"
                  onClick={handleSendVerification}
                  disabled={isSendingVerification}
                >
                  {isSendingVerification ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Verifizieren
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-pink-500" />
              Passwort ändern
            </CardTitle>
            <CardDescription>
              Aktualisiere dein Passwort regelmäßig
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {isChangingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Passwort ändern
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connected Accounts (OAuth) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ConnectedAccounts accentColor="pink" />
      </motion.div>

      {/* Two Factor Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TwoFactorSettings />
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-500">Gefahrenzone</CardTitle>
            <CardDescription>
              Unwiderrufliche Aktionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              Account löschen
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function StylistSettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile')
  const [settings, setSettings] = useState({
    // Profile
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    zipCode: '',
    instagramUrl: '',
    tiktokUrl: '',
    websiteUrl: '',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
    newBookingAlert: true,
    cancellationAlert: true,
    reviewAlert: true,
    // Security
    twoFactorEnabled: false,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/stylist/settings')
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
      setSettings(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
      fetchSettings()
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/stylist/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        // Update session if name changed
        if (settings.name !== session?.user?.name) {
          await updateSession({ name: settings.name })
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'security', label: 'Sicherheit', icon: Shield },
  ] as const

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
            Verwalte dein Profil und deine Präferenzen
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 border-b pb-4"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            className={activeTab === tab.id ? 'bg-gradient-to-r from-pink-500 to-rose-500' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid gap-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl">
                        {settings.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{settings.name || 'Dein Name'}</h3>
                    <p className="text-muted-foreground">{settings.email}</p>
                    <p className="text-sm text-pink-500 mt-1">Stuhlmieter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  Persönliche Daten
                </CardTitle>
                <CardDescription>
                  Deine grundlegenden Informationen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
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
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Erzähle etwas über dich..."
                    rows={3}
                  />
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
                  <MapPin className="h-5 w-5 text-pink-500" />
                  Adresse
                </CardTitle>
                <CardDescription>
                  Deine Kontaktadresse
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

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-pink-500" />
                  Social Media
                </CardTitle>
                <CardDescription>
                  Verlinke deine Profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="instagram"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                      className="pl-10"
                      placeholder="@dein_username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <Input
                      id="tiktok"
                      value={settings.tiktokUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                      className="pl-10"
                      placeholder="@dein_username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={settings.websiteUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="pl-10"
                      placeholder="https://"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-pink-500" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>
                Wähle aus, wie und wann du benachrichtigt werden möchtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Kommunikationskanäle</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">E-Mail-Benachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">
                      Erhalte wichtige Updates per E-Mail
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
                      Erhalte SMS für dringende Mitteilungen
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Buchungen</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Neue Buchungen</div>
                    <div className="text-sm text-muted-foreground">
                      Bei neuen Terminbuchungen
                    </div>
                  </div>
                  <Switch
                    checked={settings.newBookingAlert}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, newBookingAlert: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Stornierungen</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn ein Termin storniert wird
                    </div>
                  </div>
                  <Switch
                    checked={settings.cancellationAlert}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cancellationAlert: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Erinnerungen</div>
                    <div className="text-sm text-muted-foreground">
                      Erinnerungen vor deinen Terminen
                    </div>
                  </div>
                  <Switch
                    checked={settings.bookingReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, bookingReminders: checked }))}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Feedback</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Neue Bewertungen</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn du eine neue Bewertung erhältst
                    </div>
                  </div>
                  <Switch
                    checked={settings.reviewAlert}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reviewAlert: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing-E-Mails</div>
                    <div className="text-sm text-muted-foreground">
                      Tipps und Neuigkeiten von NICNOA
                    </div>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <SecurityTab session={session} />
      )}
    </div>
  )
}
