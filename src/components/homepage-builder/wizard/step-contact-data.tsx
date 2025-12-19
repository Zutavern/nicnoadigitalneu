'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Building, Instagram, Globe, CheckCircle } from 'lucide-react'
import type { HomepageContactData } from '@/lib/homepage-builder'

interface StepContactDataProps {
  value: HomepageContactData
  onChange: (value: HomepageContactData) => void
  hasExistingData: boolean
  userRole: 'STYLIST' | 'SALON_OWNER'
}

export function StepContactData({ value, onChange, hasExistingData, userRole }: StepContactDataProps) {
  const updateField = (field: keyof HomepageContactData, newValue: string) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Deine Kontaktdaten</h2>
        <p className="text-muted-foreground mt-2">
          Diese Informationen werden auf deiner Homepage angezeigt.
        </p>
        {hasExistingData && (
          <Badge variant="secondary" className="mt-3">
            <CheckCircle className="h-3 w-3 mr-1" />
            Daten aus deinem Profil übernommen
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {userRole === 'SALON_OWNER' ? 'Inhaber/in' : 'Name'}
          </Label>
          <Input
            id="name"
            value={value.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Max Mustermann"
          />
        </div>

        {/* Salon Name (nur für Salons) */}
        {userRole === 'SALON_OWNER' && (
          <div className="space-y-2">
            <Label htmlFor="salonName" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Salon-Name
            </Label>
            <Input
              id="salonName"
              value={value.salonName || ''}
              onChange={(e) => updateField('salonName', e.target.value)}
              placeholder="Hair Studio München"
            />
          </div>
        )}

        {/* E-Mail */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail
          </Label>
          <Input
            id="email"
            type="email"
            value={value.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="kontakt@beispiel.de"
          />
        </div>

        {/* Telefon */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefon
          </Label>
          <Input
            id="phone"
            value={value.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+49 123 456789"
          />
        </div>

        {/* Adresse */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Adresse
          </Label>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              value={value.street}
              onChange={(e) => updateField('street', e.target.value)}
              placeholder="Straße & Hausnummer"
              className="md:col-span-2"
            />
            <Input
              value={value.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              placeholder="PLZ"
            />
            <Input
              value={value.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Stadt"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram (optional)
          </Label>
          <Input
            id="instagram"
            value={value.instagram || ''}
            onChange={(e) => updateField('instagram', e.target.value)}
            placeholder="@dein_account"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Bestehende Website (optional)
          </Label>
          <Input
            id="website"
            value={value.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Du kannst diese Daten jederzeit später ändern.
      </p>
    </div>
  )
}



