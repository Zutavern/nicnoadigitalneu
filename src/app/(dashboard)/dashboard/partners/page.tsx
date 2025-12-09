'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  HandshakeIcon,
  Scissors,
  Calendar,
  Calculator,
  Gift,
  Copy,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Partner {
  id: string
  name: string
  slug: string
  category: string
  description: string
  offer: string
  code: string | null
  instructions: string[]
  link: string
  isHighlight: boolean
}

const partnerCategories = [
  { id: 'tools', label: 'Tools & Produkte', icon: Scissors, color: 'text-blue-500' },
  { id: 'booking', label: 'Buchung & Systeme', icon: Calendar, color: 'text-green-500' },
  { id: 'finance', label: 'Finanzen', icon: Calculator, color: 'text-purple-500' },
]

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/partners?includeDetails=true')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch`)
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setPartners(data)
      } else {
        console.error('Invalid response format:', data)
        setPartners([])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      setPartners([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPartners = partners.filter((partner) => {
    const matchesCategory = activeCategory === 'all' || partner.category === activeCategory
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Code kopiert!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getCategoryIcon = (categoryId: string) => {
    return partnerCategories.find(c => c.id === categoryId)?.icon || Scissors
  }

  const getCategoryColor = (categoryId: string) => {
    return partnerCategories.find(c => c.id === categoryId)?.color || 'text-primary'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
            <HandshakeIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Partner & Vorteile</h1>
            <p className="text-muted-foreground">
              Exklusive Rabatte und Angebote für NICNOA&CO.online Mitglieder
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Partner suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                  className="rounded-lg"
                >
                  Alle
                  <Badge variant="secondary" className="ml-2">
                    {partners.length}
                  </Badge>
                </Button>
                {partnerCategories.map((category) => {
                  const Icon = category.icon
                  const count = partners.filter((p) => p.category === category.id).length
                  return (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(category.id)}
                      className="rounded-lg"
                    >
                      <Icon className={`mr-2 h-4 w-4 ${activeCategory === category.id ? '' : category.color}`} />
                      {category.label}
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Partners Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </CardContent>
        </Card>
      ) : filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Keine Partner gefunden.</p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPartners.map((partner, index) => {
              const CategoryIcon = getCategoryIcon(partner.category)
              const categoryColor = getCategoryColor(partner.category)
              const category = partnerCategories.find((c) => c.id === partner.category)

              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`group h-full flex flex-col transition-all hover:shadow-lg hover:border-primary/30 ${
                    partner.isHighlight ? 'border-primary/50 bg-gradient-to-br from-primary/5 via-background to-background' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 ${
                            partner.isHighlight ? 'ring-2 ring-primary/30' : ''
                          }`}>
                            <div className="text-xl font-bold text-primary">
                              {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold line-clamp-1 mb-1">
                              {partner.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              {partner.isHighlight && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                  <Sparkles className="mr-1 h-3 w-3" />
                                  Exklusiv
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className={`mr-1 h-3 w-3 ${categoryColor}`} />
                                {category?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {partner.description}
                      </p>

                      {/* Offer Highlight */}
                      <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10">
                        <div className="flex items-start gap-2">
                          <Gift className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary mb-1">Dein Vorteil</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {partner.offer}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Code */}
                      {partner.code && (
                        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1 font-medium">Code</p>
                              <p className="font-mono font-bold text-sm text-foreground truncate">
                                {partner.code}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(partner.code!)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              {copiedCode === partner.code ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1"
                              size="sm"
                              onClick={() => setSelectedPartner(partner)}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                                  <div className="text-xl font-bold text-primary">
                                    {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                                  </div>
                                </div>
                                {partner.name}
                              </DialogTitle>
                              <DialogDescription>
                                {partner.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                              {/* Offer */}
                              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Gift className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm mb-1 text-foreground">Dein Vorteil:</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{partner.offer}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Code */}
                              {partner.code && (
                                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-xs text-muted-foreground mb-2 font-medium">Dein Code:</p>
                                      <p className="font-mono font-bold text-lg text-foreground break-all">{partner.code}</p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopyCode(partner.code!)}
                                      className="ml-3"
                                    >
                                      {copiedCode === partner.code ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Instructions */}
                              <div>
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Info className="h-4 w-4 text-primary" />
                                  </div>
                                  <h4 className="font-semibold text-sm">So geht's:</h4>
                                </div>
                                <ol className="space-y-3">
                                  {partner.instructions?.map((instruction, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm">
                                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                                        {idx + 1}
                                      </span>
                                      <span className="text-muted-foreground leading-relaxed pt-0.5">{instruction}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {/* CTA */}
                              <Button
                                asChild
                                className="w-full"
                                size="lg"
                              >
                                <a href={partner.link} target="_blank" rel="noopener noreferrer">
                                  Zum Partner
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          asChild
                          className="flex-1"
                          size="sm"
                        >
                          <a href={partner.link} target="_blank" rel="noopener noreferrer">
                            Zum Partner
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
