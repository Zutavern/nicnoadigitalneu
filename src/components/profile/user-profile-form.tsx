'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Camera,
  Instagram,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Link2,
  Lock,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Progress } from '@/components/ui/progress'
import { ConnectedAccounts } from './connected-accounts'

// Password Policy Interface
interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number | null
}

const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  maxAge: null,
}

// Password Strength Calculator
function calculatePasswordStrength(password: string, policy: PasswordPolicy): { 
  score: number; 
  label: string; 
  color: string;
  checks: { label: string; passed: boolean }[] 
} {
  const checks = [
    { 
      label: `Mindestens ${policy.minLength} Zeichen`, 
      passed: password.length >= policy.minLength 
    },
    { 
      label: 'Enthält Großbuchstaben', 
      passed: !policy.requireUppercase || /[A-Z]/.test(password) 
    },
    { 
      label: 'Enthält Zahlen', 
      passed: !policy.requireNumbers || /[0-9]/.test(password) 
    },
    { 
      label: 'Enthält Sonderzeichen', 
      passed: !policy.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password) 
    },
  ]
  
  const passedCount = checks.filter(c => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)
  
  let label = 'Sehr schwach'
  let color = 'bg-red-500'
  
  if (score >= 100) {
    label = 'Stark'
    color = 'bg-green-500'
  } else if (score >= 75) {
    label = 'Gut'
    color = 'bg-lime-500'
  } else if (score >= 50) {
    label = 'Mittel'
    color = 'bg-yellow-500'
  } else if (score >= 25) {
    label = 'Schwach'
    color = 'bg-orange-500'
  }
  
  return { score, label, color, checks }
}

// TikTok Icon Component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

interface UserProfile {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  hasPassword: boolean
  emailVerified: boolean
  createdAt: string
  profile: {
    phone: string | null
    street: string | null
    city: string | null
    zipCode: string | null
    country: string | null
    bio: string | null
  } | null
  socialMedia: {
    instagramUrl: string | null
    tiktokUrl: string | null
    websiteUrl: string | null
  } | null
  connectedAccounts: Array<{
    provider: string
    connected: boolean
  }>
}

interface UserProfileFormProps {
  /** Accent color for the role */
  accentColor?: string
  /** Show social media fields (only for stylists) */
  showSocialMedia?: boolean
  /** Custom back URL */
  backUrl?: string
}

export function UserProfileForm({ 
  accentColor = 'primary',
  showSocialMedia = false,
  backUrl,
}: UserProfileFormProps) {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSetPasswordDialog, setShowSetPasswordDialog] = useState(false)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false)
  const [showAvatarUploader, setShowAvatarUploader] = useState(false)
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(defaultPasswordPolicy)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    country: 'Deutschland',
    bio: '',
    instagramUrl: '',
    tiktokUrl: '',
    websiteUrl: '',
  })
  
  // Password form (for setting password - OAuth users)
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  
  // Change password form (for users with existing password)
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  // Fetch profile data and password policy
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData({
            name: data.name || '',
            phone: data.profile?.phone || '',
            street: data.profile?.street || '',
            city: data.profile?.city || '',
            zipCode: data.profile?.zipCode || '',
            country: data.profile?.country || 'Deutschland',
            bio: data.profile?.bio || '',
            instagramUrl: data.socialMedia?.instagramUrl || '',
            tiktokUrl: data.socialMedia?.tiktokUrl || '',
            websiteUrl: data.socialMedia?.websiteUrl || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Fehler beim Laden des Profils')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchPasswordPolicy = async () => {
      try {
        const response = await fetch('/api/user/password-policy')
        if (response.ok) {
          const data = await response.json()
          setPasswordPolicy(data)
        }
      } catch (error) {
        console.error('Error fetching password policy:', error)
      }
    }

    if (session?.user) {
      fetchProfile()
      fetchPasswordPolicy()
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        toast.success('Profil erfolgreich gespeichert')
        // Update session if name changed
        if (formData.name !== session?.user?.name) {
          await updateSession({ name: formData.name })
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Netzwerkfehler')
    } finally {
      setIsSaving(false)
    }
  }

  // Validate password against policy
  const validatePassword = (password: string): string | null => {
    if (password.length < passwordPolicy.minLength) {
      return `Passwort muss mindestens ${passwordPolicy.minLength} Zeichen haben`
    }
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      return 'Passwort muss mindestens einen Großbuchstaben enthalten'
    }
    if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
      return 'Passwort muss mindestens eine Zahl enthalten'
    }
    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Passwort muss mindestens ein Sonderzeichen enthalten'
    }
    return null
  }

  const handleSetPassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return
    }
    
    const validationError = validatePassword(passwordForm.password)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSettingPassword(true)
    try {
      const response = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowSetPasswordDialog(false)
        setPasswordForm({ password: '', confirmPassword: '' })
        // Refresh profile to update hasPassword
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          setProfile(await profileRes.json())
        }
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsSettingPassword(false)
    }
  }

  const handleChangePassword = async () => {
    if (!changePasswordForm.currentPassword) {
      toast.error('Aktuelles Passwort erforderlich')
      return
    }
    if (changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword) {
      toast.error('Die neuen Passwörter stimmen nicht überein')
      return
    }
    
    const validationError = validatePassword(changePasswordForm.newPassword)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: changePasswordForm.currentPassword,
          newPassword: changePasswordForm.newPassword,
          confirmPassword: changePasswordForm.confirmNewPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowChangePasswordDialog(false)
        setChangePasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      toast.error('Bitte gib eine neue E-Mail-Adresse ein')
      return
    }

    setIsChangingEmail(true)
    try {
      const response = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowChangeEmailDialog(false)
        setNewEmail('')
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Netzwerkfehler')
    } finally {
      setIsChangingEmail(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    setProfile(prev => prev ? { ...prev, image: url } : null)
    setShowAvatarUploader(false)
    toast.success('Avatar erfolgreich aktualisiert')
    // Force session update
    updateSession({})
  }

  const handleAvatarRemove = async () => {
    try {
      const response = await fetch('/api/user/profile/upload-avatar', {
        method: 'DELETE',
      })
      if (response.ok) {
        setProfile(prev => prev ? { ...prev, image: null } : null)
        toast.success('Avatar entfernt')
        updateSession({})
      }
    } catch (error) {
      toast.error('Fehler beim Entfernen des Avatars')
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      ADMIN: { label: 'Administrator', variant: 'default' },
      SALON_OWNER: { label: 'Salon-Inhaber', variant: 'secondary' },
      STYLIST: { label: 'Stuhlmieter', variant: 'outline' },
    }
    return badges[role] || { label: role, variant: 'outline' }
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mein Profil</h1>
          <p className="text-muted-foreground">
            Verwalte deine persönlichen Daten und Einstellungen
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className={cn(
            "bg-gradient-to-r",
            accentColor === 'pink' && "from-pink-500 to-rose-500",
            accentColor === 'purple' && "from-purple-500 to-indigo-500",
            accentColor === 'primary' && "from-primary to-primary/80"
          )}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Speichern
        </Button>
      </motion.div>

      {/* OAuth User ohne Passwort - Warnung */}
      {profile && !profile.hasPassword && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Passwort nicht gesetzt</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Du hast dich über ein Social-Login angemeldet. Lege ein Passwort fest, 
              um dich auch mit E-Mail und Passwort anmelden zu können.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 mt-2 sm:mt-0"
                onClick={() => setShowSetPasswordDialog(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Passwort festlegen
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src={profile?.image || ''} />
                    <AvatarFallback className={cn(
                      "text-white text-2xl font-semibold",
                      accentColor === 'pink' && "bg-gradient-to-br from-pink-500 to-rose-500",
                      accentColor === 'purple' && "bg-gradient-to-br from-purple-500 to-indigo-500",
                      accentColor === 'primary' && "bg-gradient-to-br from-primary to-primary/80"
                    )}>
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShowAvatarUploader(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <h2 className="mt-4 text-xl font-bold">{profile?.name}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                
                {/* Role Badge */}
                {profile && (
                  <Badge 
                    variant={getRoleBadge(profile.role).variant}
                    className="mt-2"
                  >
                    {getRoleBadge(profile.role).label}
                  </Badge>
                )}

                {/* Status Badges */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {profile?.emailVerified ? (
                    <Badge variant="outline" className="text-green-600 border-green-600/50">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      E-Mail verifiziert
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-600/50">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      E-Mail nicht verifiziert
                    </Badge>
                  )}
                </div>

                {/* Member Since */}
                {profile?.createdAt && (
                  <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Mitglied seit {new Date(profile.createdAt).toLocaleDateString('de-DE', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowAvatarUploader(true)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Avatar ändern
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowChangeEmailDialog(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                E-Mail ändern
              </Button>
              {profile?.hasPassword ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowChangePasswordDialog(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Passwort ändern
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSetPasswordDialog(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Passwort festlegen
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Forms Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Informationen
              </CardTitle>
              <CardDescription>
                Diese Informationen werden in deinem Profil angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      placeholder="Dein Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    E-Mail kann über "E-Mail ändern" geändert werden
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Über mich</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Erzähle etwas über dich..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.bio.length}/500 Zeichen
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </CardTitle>
              <CardDescription>
                Deine Adresse für Rechnungen und Korrespondenz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Straße & Hausnummer</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Musterstraße 123"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Berlin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Land</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Deutschland"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media (only for stylists) */}
          {showSocialMedia && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Social Media
                </CardTitle>
                <CardDescription>
                  Verlinke deine Social-Media-Profile für mehr Sichtbarkeit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="instagram"
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                        className="pl-10"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <div className="relative">
                      <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tiktok"
                        value={formData.tiktokUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                        className="pl-10"
                        placeholder="https://tiktok.com/@username"
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
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="pl-10"
                      placeholder="https://deine-website.de"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected Accounts */}
          <ConnectedAccounts accentColor={accentColor} />
        </motion.div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={showAvatarUploader} onOpenChange={setShowAvatarUploader}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Profilbild ändern</DialogTitle>
            <DialogDescription>
              Lade ein neues Profilbild hoch. Du kannst es zuschneiden und anpassen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ImageUploader
              value={profile?.image}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              uploadEndpoint="/api/user/profile/upload-avatar"
              aspectRatio={1}
              maxSize={5 * 1024 * 1024}
              placeholder="Profilbild hochladen"
              description="PNG, JPG, WebP (max. 5MB)"
              previewHeight="aspect-square"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog (for OAuth users) */}
      <Dialog open={showSetPasswordDialog} onOpenChange={setShowSetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Passwort festlegen</DialogTitle>
            <DialogDescription>
              Lege ein Passwort fest, um dich auch mit E-Mail und Passwort anmelden zu können.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="set-new-password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="set-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={`Mindestens ${passwordPolicy.minLength} Zeichen`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordForm.password && (
                <div className="space-y-2 pt-2">
                  {(() => {
                    const strength = calculatePasswordStrength(passwordForm.password, passwordPolicy)
                    return (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Passwortstärke</span>
                          <span className={cn(
                            "font-medium",
                            strength.score >= 100 ? "text-green-600" :
                            strength.score >= 75 ? "text-lime-600" :
                            strength.score >= 50 ? "text-yellow-600" :
                            "text-red-600"
                          )}>
                            {strength.label}
                          </span>
                        </div>
                        <Progress value={strength.score} className={cn("h-2", strength.color)} />
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {strength.checks.map((check, i) => (
                            <div key={i} className={cn(
                              "flex items-center gap-1",
                              check.passed ? "text-green-600" : "text-muted-foreground"
                            )}>
                              {check.passed ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span>{check.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-confirm-password">Passwort bestätigen</Label>
              <Input
                id="set-confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Passwort wiederholen"
              />
              {passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-500">Passwörter stimmen nicht überein</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetPasswordDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSetPassword} 
              disabled={isSettingPassword || !passwordForm.password || passwordForm.password !== passwordForm.confirmPassword}
            >
              {isSettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort setzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={showChangeEmailDialog} onOpenChange={setShowChangeEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-Mail-Adresse ändern</DialogTitle>
            <DialogDescription>
              Gib deine neue E-Mail-Adresse ein. Du erhältst eine Bestätigungs-E-Mail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Aktuelle E-Mail</Label>
              <Input value={profile?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Neue E-Mail-Adresse</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="neue@email.de"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeEmailDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleChangeEmail} disabled={isChangingEmail}>
              {isChangingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bestätigungs-E-Mail senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog (for users with existing password) */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Gib dein aktuelles Passwort ein und wähle ein neues Passwort.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Aktuelles Passwort</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Dein aktuelles Passwort"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="change-new-password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="change-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder={`Mindestens ${passwordPolicy.minLength} Zeichen`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {changePasswordForm.newPassword && (
                <div className="space-y-2 pt-2">
                  {(() => {
                    const strength = calculatePasswordStrength(changePasswordForm.newPassword, passwordPolicy)
                    return (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Passwortstärke</span>
                          <span className={cn(
                            "font-medium",
                            strength.score >= 100 ? "text-green-600" :
                            strength.score >= 75 ? "text-lime-600" :
                            strength.score >= 50 ? "text-yellow-600" :
                            "text-red-600"
                          )}>
                            {strength.label}
                          </span>
                        </div>
                        <Progress value={strength.score} className={cn("h-2", strength.color)} />
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {strength.checks.map((check, i) => (
                            <div key={i} className={cn(
                              "flex items-center gap-1",
                              check.passed ? "text-green-600" : "text-muted-foreground"
                            )}>
                              {check.passed ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span>{check.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="change-confirm-password">Neues Passwort bestätigen</Label>
              <Input
                id="change-confirm-password"
                type="password"
                value={changePasswordForm.confirmNewPassword}
                onChange={(e) => setChangePasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                placeholder="Neues Passwort wiederholen"
              />
              {changePasswordForm.confirmNewPassword && changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword && (
                <p className="text-xs text-red-500">Passwörter stimmen nicht überein</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChangePasswordDialog(false)
              setChangePasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
            }}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={
                isChangingPassword || 
                !changePasswordForm.currentPassword || 
                !changePasswordForm.newPassword || 
                changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword
              }
            >
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

