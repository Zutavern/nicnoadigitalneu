'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Camera,
  Save,
  Loader2,
  Instagram,
  Globe,
  Award,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StylistProfile {
  id: string
  name: string
  email: string
  image?: string
  profile: {
    bio?: string
    phone?: string
    address?: string
    city?: string
    zipCode?: string
    experience?: number
    instagram?: string
    website?: string
    skills: Array<{ name: string; rating: number }>
  }
  stats: {
    totalBookings: number
    averageRating: number
    totalReviews: number
  }
}

export default function StylistProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<StylistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    instagram: '',
    website: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/stylist/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData({
            name: data.name || '',
            bio: data.profile?.bio || '',
            phone: data.profile?.phone || '',
            address: data.profile?.address || '',
            city: data.profile?.city || '',
            zipCode: data.profile?.zipCode || '',
            instagram: data.profile?.instagram || '',
            website: data.profile?.website || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/stylist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const updated = await response.json()
        setProfile(prev => prev ? { ...prev, ...updated } : null)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
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
          <h1 className="text-3xl font-bold">Mein Profil</h1>
          <p className="text-muted-foreground">
            Verwalte deine öffentlichen Informationen
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.image} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl">
                      {profile?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold">{profile?.name}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                
                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 w-full border-t pt-4">
                  <div>
                    <div className="text-2xl font-bold text-pink-500">
                      {profile?.stats.totalBookings || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Buchungen</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">
                        {profile?.stats.averageRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Bewertung</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {profile?.stats.totalReviews || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                </div>

                {/* Experience Badge */}
                {profile?.profile?.experience && (
                  <Badge className="mt-4 bg-pink-500/20 text-pink-500">
                    <Award className="mr-1 h-3 w-3" />
                    {profile.profile.experience} Jahre Erfahrung
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Fähigkeiten</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.profile?.skills && profile.profile.skills.length > 0 ? (
                <div className="space-y-3">
                  {profile.profile.skills.slice(0, 6).map((skill, index) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              className={cn(
                                'h-3 w-3',
                                star <= skill.rating 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-muted-foreground'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keine Fähigkeiten hinterlegt
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Informationen</CardTitle>
              <CardDescription>
                Diese Informationen werden auf deinem öffentlichen Profil angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Erzähle etwas über dich..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
              <CardDescription>
                Deine Adresse für Rechnungen und Korrespondenz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Straße & Hausnummer</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Verlinke deine Social-Media-Profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@username"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}









