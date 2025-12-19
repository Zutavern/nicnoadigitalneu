'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2, Check, X, Globe, ShoppingCart, Info } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface DomainResult {
  domain: string
  available: boolean
  premium: boolean
  vercelPriceUsd: number | null
  customerPriceEur: number | null
  renewalPriceEur: number | null
  message?: string
}

interface DomainSearchProps {
  onSelect?: (domain: DomainResult) => void
  onPurchase?: (domain: DomainResult) => void
  selectedDomain?: string
  className?: string
}

export function DomainSearch({ 
  onSelect, 
  onPurchase, 
  selectedDomain,
  className 
}: DomainSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DomainResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) {
      toast.error('Bitte mindestens 2 Zeichen eingeben')
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch('/api/domains/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          tlds: ['.de', '.com', '.online', '.io', '.net']
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Fehler bei der Domain-Suche')
        return
      }

      const data = await res.json()
      setResults(data.results || [])

      if (data.availableCount === 0) {
        toast.info('Keine verfügbaren Domains gefunden')
      }
    } catch (error) {
      console.error('Domain search error:', error)
      toast.error('Netzwerkfehler bei der Domain-Suche')
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-emerald-500" />
          Domain finden
        </CardTitle>
        <CardDescription>
          Suche nach einer eigenen Domain für deine Homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suchfeld */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z.B. mein-salon, hair-by-anna..."
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Suchen'
            )}
          </Button>
        </div>

        {/* Ergebnisse */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                Prüfe Verfügbarkeit...
              </p>
            </motion.div>
          )}

          {!loading && searched && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {results.map((result, index) => (
                <motion.div
                  key={result.domain}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    result.available 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-muted/50 border-muted',
                    selectedDomain === result.domain && 'ring-2 ring-emerald-500'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-full',
                      result.available 
                        ? 'bg-emerald-100 dark:bg-emerald-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    )}>
                      {result.available ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        'font-medium',
                        !result.available && 'text-muted-foreground'
                      )}>
                        {result.domain}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.available 
                          ? result.premium 
                            ? 'Premium-Domain verfügbar' 
                            : 'Verfügbar'
                          : result.message || 'Nicht verfügbar'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {result.available && result.customerPriceEur && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="text-right">
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  €{result.customerPriceEur.toFixed(2)}/Jahr
                                </p>
                                {result.premium && (
                                  <Badge variant="secondary" className="text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verlängerung: €{result.renewalPriceEur?.toFixed(2)}/Jahr</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div className="flex gap-1">
                          {onSelect && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelect(result)}
                              className={cn(
                                selectedDomain === result.domain && 'bg-emerald-100 dark:bg-emerald-900'
                              )}
                            >
                              Auswählen
                            </Button>
                          )}
                          {onPurchase && (
                            <Button
                              size="sm"
                              onClick={() => onPurchase(result)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Kaufen
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && searched && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-muted-foreground"
            >
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Ergebnisse gefunden</p>
              <p className="text-sm mt-1">Versuche einen anderen Suchbegriff</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p>
              Domains werden über Vercel registriert und automatisch mit deiner Homepage verknüpft.
              Die Verlängerung erfolgt automatisch jährlich.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



