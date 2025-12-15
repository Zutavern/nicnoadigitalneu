'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Clock,
  Check,
  Star,
  CreditCard,
  History,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Gift,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Credits {
  balance: number
  lifetimeUsed: number
  lifetimeBought: number
  lastTopUpAt: string | null
  isUnlimited: boolean
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  createdAt: string
  packageName?: string
}

interface CreditPackage {
  id: string
  name: string
  description: string | null
  credits: number
  priceEur: number
  pricePerCredit: number
  isPopular: boolean
  maxPerUser: number | null
  validDays: number | null
  purchasedCount: number
  canPurchase: boolean
}

const transactionTypeConfig: Record<string, { label: string; icon: typeof Coins; color: string }> = {
  purchase: { label: 'Kauf', icon: ShoppingCart, color: 'text-green-500' },
  usage: { label: 'Verbrauch', icon: Zap, color: 'text-orange-500' },
  bonus: { label: 'Bonus', icon: Gift, color: 'text-purple-500' },
  refund: { label: 'Erstattung', icon: RefreshCw, color: 'text-blue-500' },
  admin_adjustment: { label: 'Anpassung', icon: Coins, color: 'text-gray-500' },
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credits | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/user/credits?includeTransactions=true&limit=20')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        console.error('API Error:', res.status, errorData)
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setCredits(data.credits)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching credits:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Laden der Credits')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/user/credits/packages')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setPackages(data.packages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Fehler beim Laden der Pakete')
    } finally {
      setIsLoadingPackages(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
    fetchPackages()
  }, [fetchCredits, fetchPackages])

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsPurchasing(true)
    try {
      // TODO: Stripe Integration für echte Zahlung
      toast.info('Zahlungsintegration kommt bald!', {
        description: 'Die Credit-Pakete können bald über Stripe gekauft werden.',
      })
      setSelectedPackage(null)
    } catch (error) {
      console.error('Error purchasing package:', error)
      toast.error('Fehler beim Kauf')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              credits?.isUnlimited 
                ? "bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20"
                : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            )}>
              <Sparkles className={cn(
                "h-6 w-6",
                credits?.isUnlimited ? "text-purple-500" : "text-amber-500"
              )} />
            </div>
            AI Credits
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine AI-Credits und kaufe neue Pakete
          </p>
        </div>
        <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
          {!credits?.isUnlimited && (
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => setSelectedPackage(packages.find(p => p.isPopular) || packages[0] || null)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Credits kaufen
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Credit-Pakete
              </DialogTitle>
              <DialogDescription>
                Wähle ein Paket für deine AI-Funktionen
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {isLoadingPackages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Pakete verfügbar
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {packages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card 
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-lg relative overflow-hidden',
                          selectedPackage?.id === pkg.id && 'ring-2 ring-amber-500',
                          pkg.isPopular && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/10'
                        )}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        {pkg.isPopular && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Beliebt
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          {pkg.description && (
                            <CardDescription>{pkg.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold">
                              {pkg.priceEur.toFixed(2)}€
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({pkg.pricePerCredit.toFixed(2)}€/Credit)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                            <Coins className="h-4 w-4" />
                            {pkg.credits.toLocaleString('de-DE')} Credits
                          </div>
                          {pkg.validDays && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <Clock className="inline h-3 w-3 mr-1" />
                              Gültig für {pkg.validDays} Tage
                            </p>
                          )}
                          {!pkg.canPurchase && (
                            <Badge variant="secondary" className="mt-2">
                              Maximum erreicht
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {selectedPackage && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => handlePurchase(selectedPackage)}
                  disabled={isPurchasing || !selectedPackage.canPurchase}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isPurchasing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {selectedPackage.priceEur.toFixed(2)}€ bezahlen
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cn(
            credits?.isUnlimited 
              ? "bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-fuchsia-950/40 border-purple-200/50"
              : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={cn(
                "text-sm font-medium",
                credits?.isUnlimited 
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-amber-700 dark:text-amber-300"
              )}>
                Aktuelles Guthaben
              </CardTitle>
              <Sparkles className={cn(
                "h-5 w-5",
                credits?.isUnlimited 
                  ? "text-purple-500 animate-pulse" 
                  : "text-amber-500"
              )} />
            </CardHeader>
            <CardContent>
              {credits?.isUnlimited ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      ∞
                    </span>
                    <span className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                      Unlimited
                    </span>
                  </div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                    Unbegrenzte AI-Nutzung
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                    {credits?.balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Verfügbare Credits
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt gekauft
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {credits?.lifetimeBought.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Credits insgesamt
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verbraucht
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {credits?.lifetimeUsed.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Credits verwendet
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Feature Pricing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Funktionen & Credit-Verbrauch
          </CardTitle>
          <CardDescription>
            Übersicht über die Kosten verschiedener AI-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium">Text-Generierung</span>
              </div>
              <p className="text-2xl font-bold">~1 Credit</p>
              <p className="text-xs text-muted-foreground">pro 1.000 Tokens</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
                <span className="font-medium">Bild-Generierung</span>
              </div>
              <p className="text-2xl font-bold">~5 Credits</p>
              <p className="text-xs text-muted-foreground">pro Bild</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                </div>
                <span className="font-medium">Video-Generierung</span>
              </div>
              <p className="text-2xl font-bold">~50 Credits</p>
              <p className="text-xs text-muted-foreground">pro 10 Sekunden</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <span className="font-medium">Übersetzungen</span>
              </div>
              <p className="text-2xl font-bold">~0.5 Credits</p>
              <p className="text-xs text-muted-foreground">pro 1.000 Zeichen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Transaktionsverlauf
          </CardTitle>
          <CardDescription>
            Die letzten 20 Transaktionen auf deinem Credit-Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Noch keine Transaktionen</p>
              <p className="text-sm mt-1">
                Kaufe Credits oder nutze AI-Funktionen, um Transaktionen zu sehen.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {transactions.map((tx, index) => {
                    const config = transactionTypeConfig[tx.type] || transactionTypeConfig.usage
                    const Icon = config.icon
                    const isPositive = tx.amount > 0

                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center',
                              isPositive 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-orange-100 dark:bg-orange-900/30'
                            )}>
                              <Icon className={cn('h-4 w-4', config.color)} />
                            </div>
                            <span className="font-medium">{config.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {tx.packageName || tx.description || 'AI-Nutzung'}
                            </p>
                            {tx.description && tx.packageName && (
                              <p className="text-xs text-muted-foreground">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(tx.createdAt), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            'font-mono font-medium flex items-center justify-end gap-1',
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                          )}>
                            {isPositive ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {isPositive ? '+' : ''}{tx.amount.toLocaleString('de-DE', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

