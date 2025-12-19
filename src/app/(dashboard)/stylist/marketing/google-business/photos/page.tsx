'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { DevelopmentBadge } from '@/components/google-business'
import { MOCK_PHOTOS } from '@/lib/google-business/mock-data'
import type { BusinessPhoto } from '@/lib/google-business/types'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

const PHOTO_TYPES = {
  logo: { label: 'Logo', icon: ImageIcon, required: true },
  cover: { label: 'Titelbild', icon: ImageIcon, required: true },
  team: { label: 'Team', icon: ImageIcon, required: false },
  interior: { label: 'Innenraum', icon: ImageIcon, required: false },
  work: { label: 'Arbeiten', icon: ImageIcon, required: false },
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<BusinessPhoto[]>(MOCK_PHOTOS)

  const hasLogo = photos.some((p) => p.type === 'logo')
  const hasCover = photos.some((p) => p.type === 'cover')

  const handleUpload = (type: BusinessPhoto['type']) => {
    toast.info('Foto-Upload', {
      description: 'Der Upload wird in der finalen Version verfügbar sein. (Demo)',
    })
  }

  const handleDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    toast.success('Foto gelöscht!', {
      description: 'Das Foto wurde entfernt. (Demo)',
    })
  }

  // Gruppiere Fotos nach Typ
  const photosByType = photos.reduce(
    (acc, photo) => {
      if (!acc[photo.type]) acc[photo.type] = []
      acc[photo.type].push(photo)
      return acc
    },
    {} as Record<string, BusinessPhoto[]>
  )

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
            <h1 className="text-3xl font-bold">Fotos</h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground ml-12">
            Verwalte die Fotos deines Google Business Profils
          </p>
        </div>
        <Button onClick={() => handleUpload('other')}>
          <Upload className="h-4 w-4 mr-2" />
          Foto hochladen
        </Button>
      </div>

      {/* Warnings */}
      {(!hasLogo || !hasCover) && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Wichtige Fotos fehlen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {!hasLogo && 'Logo fehlt. '}
                  {!hasCover && 'Titelbild fehlt. '}
                  Diese Fotos verbessern die Sichtbarkeit deines Profils erheblich.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(PHOTO_TYPES).map(([type, config]) => {
          const count = photosByType[type]?.length || 0
          const isOk = !config.required || count > 0
          return (
            <Card key={type} className={!isOk ? 'border-yellow-500/30' : ''}>
              <CardContent className="pt-4 text-center">
                <div
                  className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    isOk ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}
                >
                  {isOk ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">{count} Foto(s)</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Photo Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(PHOTO_TYPES).map(([type, config]) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <config.icon className="h-5 w-5 text-blue-500" />
                    {config.label}
                  </span>
                  {config.required && (
                    <Badge variant="outline" className="text-xs">
                      Pflicht
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {type === 'logo' && 'Dein Salon-Logo (quadratisch empfohlen)'}
                  {type === 'cover' && 'Das Hauptbild deines Profils (16:9 empfohlen)'}
                  {type === 'team' && 'Fotos von dir und deinem Team'}
                  {type === 'interior' && 'Zeige den Innenraum deines Salons'}
                  {type === 'work' && 'Vorher/Nachher & Ergebnisse'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {photosByType[type]?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {photosByType[type].map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.description || config.label}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {formatDistanceToNow(photo.uploadedAt, { addSuffix: true, locale: de })}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => handleUpload(type as BusinessPhoto['type'])}
                      className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-xs">Hinzufügen</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpload(type as BusinessPhoto['type'])}
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-sm">Foto hochladen</span>
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}




