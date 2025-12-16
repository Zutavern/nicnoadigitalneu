'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronRight,
  Navigation,
  ExternalLink,
  Share2,
  Bookmark,
  X,
  Maximize2,
} from 'lucide-react'
import type { BusinessProfile, Review, BusinessService, BusinessPhoto, ReviewStats, BusinessHours } from '@/lib/google-business/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GooglePreviewProps {
  profile: BusinessProfile
  reviews?: Review[]
  services?: BusinessService[]
  photos?: BusinessPhoto[]
  hours?: BusinessHours[]
  reviewStats?: ReviewStats | null
  className?: string
  showFullscreen?: boolean
}

// Google-typische Farben
const GOOGLE_BLUE = '#1a73e8'

export function GooglePreview({
  profile,
  reviews = [],
  services = [],
  photos = [],
  hours = [],
  reviewStats,
  className,
  showFullscreen = true,
}: GooglePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const recentReviews = reviews.slice(0, 3)
  const displayServices = services.slice(0, 4)
  
  // Finde Logo und Cover aus den Fotos
  const logoPhoto = photos.find(p => p.type === 'logo')
  const coverPhoto = photos.find(p => p.type === 'cover') || photos.find(p => p.type === 'interior')
  
  // Prüfe ob der Salon gerade geöffnet ist
  const now = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const currentDay = dayNames[now.getDay()]
  const currentHours = hours.find(h => h.day === currentDay)
  const isOpen = currentHours && !currentHours.isClosed && currentHours.open && currentHours.close
  
  // Rating aus ReviewStats oder Standard
  const rating = reviewStats?.average || 4.5
  const totalReviews = reviewStats?.total || reviews.length

  const PreviewContent = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn(
      "bg-white text-gray-900 rounded-xl overflow-hidden shadow-xl w-full",
      compact ? "max-w-sm" : "max-w-[420px]"
    )}>
      {/* Cover Bild */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200">
        {coverPhoto ? (
          <img
            src={coverPhoto.url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-300" />
          </div>
        )}
        
        {/* Logo */}
        <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
          {logoPhoto ? (
            <img
              src={logoPhoto.url}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Google Maps Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white">
            <Bookmark className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Business Info */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">{rating.toFixed(1)}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.round(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({totalReviews})</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">Friseursalon</p>
            <div className="flex items-center gap-1 mt-1">
              {isOpen ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-green-500/30 text-green-700 bg-green-50">
                  Geöffnet
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-red-500/30 text-red-700 bg-red-50">
                  Geschlossen
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {isOpen ? `Schließt um ${currentHours?.close || '18:00'}` : 'Öffnet morgen'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-full bg-blue-50">
              <Phone className="h-4 w-4" style={{ color: GOOGLE_BLUE }} />
            </div>
            <span className="text-[10px] text-gray-600">Anrufen</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-full bg-blue-50">
              <Navigation className="h-4 w-4" style={{ color: GOOGLE_BLUE }} />
            </div>
            <span className="text-[10px] text-gray-600">Route</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-full bg-blue-50">
              <Globe className="h-4 w-4" style={{ color: GOOGLE_BLUE }} />
            </div>
            <span className="text-[10px] text-gray-600">Website</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-full bg-blue-50">
              <Bookmark className="h-4 w-4" style={{ color: GOOGLE_BLUE }} />
            </div>
            <span className="text-[10px] text-gray-600">Speichern</span>
          </button>
        </div>

        {/* Adresse */}
        <div className="mt-4 space-y-2">
          <button className="flex items-start gap-3 w-full text-left p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-2">{profile.address}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="flex items-center gap-3 w-full text-left p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-gray-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Öffnungszeiten</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {profile.phone && (
            <button className="flex items-center gap-3 w-full text-left p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="h-5 w-5 text-gray-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: GOOGLE_BLUE }}>{profile.phone}</p>
              </div>
            </button>
          )}

          {profile.website && (
            <button className="flex items-center gap-3 w-full text-left p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Globe className="h-5 w-5 text-gray-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: GOOGLE_BLUE }}>{profile.website}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Services (wenn vorhanden) */}
        {!compact && displayServices.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium text-sm mb-3">Leistungen</h3>
            <div className="flex flex-wrap gap-2">
              {displayServices.map((service) => (
                <Badge 
                  key={service.id}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {service.name}
                  {service.price && (
                    <span className="ml-1 text-gray-500">{service.price}</span>
                  )}
                </Badge>
              ))}
              {services.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 4} mehr
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Bewertungen */}
        {!compact && recentReviews.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Bewertungen</h3>
              <button className="text-xs" style={{ color: GOOGLE_BLUE }}>
                Alle {totalReviews} anzeigen
              </button>
            </div>
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                    {review.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{review.author}</span>
                      <div className="flex shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {review.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Attribution */}
        <div className="mt-4 pt-3 border-t flex items-center justify-center gap-1 text-xs text-gray-400">
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn("relative", className)}>
        <PreviewContent compact={!showFullscreen} />
        
        {showFullscreen && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-3 left-3 h-8 px-2 bg-white/90 backdrop-blur hover:bg-white shadow-sm"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Vollbild</span>
          </Button>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Google Business Vorschau</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg z-10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <PreviewContent compact={false} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

