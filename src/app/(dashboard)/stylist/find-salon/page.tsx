'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Building2,
  MapPin,
  Star,
  Euro,
  Armchair,
  Filter,
  Loader2,
  ChevronRight,
  Heart,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Salon {
  id: string
  name: string
  address: string
  city: string
  zipCode: string
  description: string | null
  image: string | null
  rating: number
  reviewCount: number
  availableChairs: number
  minPrice: number
  maxPrice: number
  amenities: string[]
  owner: {
    name: string
    image: string | null
  }
}

export default function FindSalonPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSalons = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (selectedCity) params.append('city', selectedCity)

        const res = await fetch(`/api/stylist/find-salon?${params.toString()}`)
        if (!res.ok) throw new Error('Fehler beim Laden')
        const data = await res.json()
        setSalons(data)
      } catch (error) {
        console.error('Error fetching salons:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSalons()
  }, [searchTerm, selectedCity])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  const cities = [...new Set(salons.map(s => s.city))].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Salon finden</h1>
        <p className="text-muted-foreground">
          Entdecke verfügbare Stühle in Salons in deiner Nähe
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Salon suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {cities.slice(0, 5).map(city => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                    className={selectedCity === city ? 'bg-pink-500 hover:bg-pink-600' : ''}
                  >
                    {city}
                  </Button>
                ))}
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : salons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Keine Salons gefunden</h3>
            <p className="text-muted-foreground">
              Versuche eine andere Suche oder erweitere deine Filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {salons.map((salon, index) => (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                    {salon.image ? (
                      <img 
                        src={salon.image} 
                        alt={salon.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-16 w-16 text-pink-500/30" />
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(salon.id)}
                      className={cn(
                        'absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors',
                        favorites.has(salon.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      )}
                    >
                      <Heart className={cn('h-5 w-5', favorites.has(salon.id) && 'fill-current')} />
                    </button>
                    {salon.availableChairs > 0 && (
                      <Badge className="absolute bottom-3 left-3 bg-green-500">
                        {salon.availableChairs} {salon.availableChairs === 1 ? 'Stuhl' : 'Stühle'} frei
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Salon Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold group-hover:text-pink-500 transition-colors">
                          {salon.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {salon.city}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{salon.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({salon.reviewCount})</span>
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={salon.owner.image || undefined} />
                        <AvatarFallback className="text-xs">{salon.owner.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{salon.owner.name}</span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-pink-500" />
                        <span className="font-bold">
                          {salon.minPrice === salon.maxPrice 
                            ? `€${salon.minPrice}` 
                            : `€${salon.minPrice} - €${salon.maxPrice}`}
                        </span>
                        <span className="text-sm text-muted-foreground">/Monat</span>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="text-pink-500 hover:text-pink-600">
                        <Link href={`/stylist/find-salon/${salon.id}`}>
                          Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-pink-500/20">
              <Clock className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">So funktioniert's</h3>
              <p className="text-sm text-muted-foreground">
                Finde einen Salon, der zu dir passt, und sende eine Anfrage. Der Salonbesitzer 
                wird sich bei dir melden und ihr könnt die Details besprechen. Nach Vertragsabschluss 
                kannst du direkt loslegen!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

