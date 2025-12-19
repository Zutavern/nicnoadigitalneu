'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Sparkles,
  ArrowRight,
  Link2,
  ShoppingCart,
  Check,
  Loader2,
  ExternalLink,
  Copy,
  AlertCircle,
  Rocket,
  Settings,
  RefreshCw,
  X,
  Search,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface GoLiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  projectSlug: string
  connectedDomain?: string | null
  isPublished?: boolean
  onSuccess?: () => void
}

export function GoLiveDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectSlug,
  connectedDomain,
  isPublished = false,
  onSuccess,
}: GoLiveDialogProps) {
  const [step, setStep] = useState<'options' | 'search' | 'connect' | 'verify' | 'success' | 'manage'>('options')
  const [activeTab, setActiveTab] = useState<'subdomain' | 'buy' | 'connect'>('subdomain')
  
  // Domain-Suche State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DomainResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<DomainResult | null>(null)
  
  // Externe Domain State
  const [externalDomain, setExternalDomain] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [verificationInfo, setVerificationInfo] = useState<{
    type: string
    token: string
    domain: string
  } | null>(null)

  const subdomainUrl = `${projectSlug}.nicnoa.online`

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      if (connectedDomain) {
        setStep('manage')
      } else {
        setStep('options')
      }
      setSearchQuery('')
      setSearchResults([])
      setSelectedDomain(null)
      setExternalDomain('')
      setVerificationInfo(null)
    }
  }, [open, connectedDomain])

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast.error('Bitte mindestens 2 Zeichen eingeben')
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch('/api/domains/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery.trim(),
          tlds: ['.de', '.com', '.online', '.io', '.net']
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Domain search error:', data)
        toast.error(data.error || 'Fehler bei der Domain-Suche')
        return
      }

      setSearchResults(data.results || [])
      
      if (data.results?.length === 0) {
        toast.info('Keine verfügbaren Domains gefunden')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Netzwerkfehler bei der Domain-Suche')
    } finally {
      setIsSearching(false)
    }
  }

  const handlePublishSubdomain = async () => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/homepage/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useSubdomain: true }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Veröffentlichung fehlgeschlagen')
      }

      toast.success(`Homepage unter ${subdomainUrl} veröffentlicht!`)
      setStep('success')
      onSuccess?.()
    } catch (error) {
      console.error('Publish error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Veröffentlichen')
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePurchaseDomain = async () => {
    if (!selectedDomain) return

    setIsConnecting(true)
    try {
      const res = await fetch('/api/domains/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: selectedDomain.domain,
          homepageProjectId: projectId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Kauf fehlgeschlagen')
      }

      const data = await res.json()
      
      if (data.verification) {
        setVerificationInfo({
          type: data.verification.type,
          token: data.verification.token,
          domain: selectedDomain.domain,
        })
        setStep('verify')
      } else {
        setStep('success')
      }

      toast.success('Domain erfolgreich hinzugefügt!')
      onSuccess?.()
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Kauf')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnectExternal = async () => {
    if (!externalDomain.trim()) {
      toast.error('Bitte Domain eingeben')
      return
    }

    // Validiere Domain-Format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i
    if (!domainRegex.test(externalDomain)) {
      toast.error('Ungültiges Domain-Format (z.B. meinsalon.de)')
      return
    }

    setIsConnecting(true)
    try {
      const res = await fetch('/api/domains/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: externalDomain.toLowerCase(),
          homepageProjectId: projectId,
          isExternal: true,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Verbindung fehlgeschlagen')
      }

      const data = await res.json()
      
      if (data.verification) {
        setVerificationInfo({
          type: data.verification.type,
          token: data.verification.token,
          domain: externalDomain.toLowerCase(),
        })
        setStep('verify')
      } else {
        setStep('success')
      }

      toast.success('Domain wird verbunden...')
      onSuccess?.()
    } catch (error) {
      console.error('Connect error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Verbinden')
    } finally {
      setIsConnecting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('In die Zwischenablage kopiert')
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'manage' ? (
              <>
                <Settings className="h-5 w-5 text-emerald-600" />
                Live-Domain bearbeiten
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5 text-violet-600" />
                Homepage live nehmen
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'options' && `"${projectName}" veröffentlichen`}
            {step === 'search' && 'Finde deine perfekte Domain'}
            {step === 'connect' && 'Verbinde eine Domain, die du bereits besitzt'}
            {step === 'verify' && 'DNS-Einträge konfigurieren'}
            {step === 'success' && 'Deine Homepage ist jetzt online!'}
            {step === 'manage' && `Verbunden mit ${connectedDomain}`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step: Options */}
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="subdomain" className="text-xs gap-1">
                    <Globe className="h-3 w-3" />
                    Kostenlos
                  </TabsTrigger>
                  <TabsTrigger value="buy" className="text-xs gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    Domain kaufen
                  </TabsTrigger>
                  <TabsTrigger value="connect" className="text-xs gap-1">
                    <Link2 className="h-3 w-3" />
                    Verbinden
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subdomain" className="mt-4 space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Kostenlose Subdomain</h4>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                      Deine Homepage wird sofort unter folgender Adresse erreichbar:
                    </p>
                    <div className="bg-white dark:bg-black/20 rounded-lg px-4 py-3 font-mono text-sm flex items-center justify-between">
                      <span>{subdomainUrl}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`https://${subdomainUrl}`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handlePublishSubdomain} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Veröffentliche...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Jetzt live nehmen
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="buy" className="mt-4 space-y-4">
                  <div className="p-4 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-violet-600" />
                      <h4 className="font-medium">Eigene Domain registrieren</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Professioneller Auftritt mit eigener .de Domain</li>
                      <li>• SSL-Zertifikat inklusive</li>
                      <li>• Automatisch mit deiner Homepage verknüpft</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => setStep('search')} 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    Domain suchen
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="connect" className="mt-4 space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Bestehende Domain verbinden</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Domain bleibt bei deinem Provider</li>
                      <li>• Nur DNS-Eintrag nötig</li>
                      <li>• Keine zusätzlichen Kosten</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => setStep('connect')} 
                    className="w-full"
                    variant="outline"
                  >
                    Domain verbinden
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Step: Search */}
          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="z.B. mein-salon"
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suchen'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.domain}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                        result.available
                          ? selectedDomain?.domain === result.domain
                            ? 'bg-violet-100 dark:bg-violet-900/50 border-violet-500 shadow-sm'
                            : 'hover:bg-muted hover:border-muted-foreground/30'
                          : 'opacity-50 cursor-not-allowed bg-muted/50'
                      )}
                      onClick={() => result.available && setSelectedDomain(result)}
                    >
                      <div className="flex items-center gap-2">
                        {result.available ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{result.domain}</span>
                        {result.premium && (
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        )}
                      </div>
                      {result.available && result.customerPriceEur ? (
                        <span className="text-emerald-600 font-semibold">
                          €{result.customerPriceEur.toFixed(2)}/Jahr
                        </span>
                      ) : !result.available ? (
                        <span className="text-xs text-muted-foreground">Vergeben</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStep('options')}>
                  Zurück
                </Button>
                <Button 
                  onClick={handlePurchaseDomain} 
                  disabled={!selectedDomain || isConnecting}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaufe...
                    </>
                  ) : selectedDomain ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {selectedDomain.domain} kaufen
                    </>
                  ) : (
                    'Domain auswählen'
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step: Connect External */}
          {step === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label>Deine Domain</Label>
                <Input
                  value={externalDomain}
                  onChange={(e) => setExternalDomain(e.target.value)}
                  placeholder="z.B. meinsalon.de"
                />
                <p className="text-xs text-muted-foreground">
                  Gib die Domain ohne www oder https ein
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStep('options')}>
                  Zurück
                </Button>
                <Button 
                  onClick={handleConnectExternal} 
                  disabled={!externalDomain.trim() || isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verbinde...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Verbinden
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step: Verify */}
          {step === 'verify' && verificationInfo && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  DNS-Eintrag hinzufügen
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Füge folgenden Eintrag bei deinem Domain-Provider hinzu:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-black/20 rounded-lg">
                    <span className="text-muted-foreground">Typ:</span>
                    <span className="font-mono font-medium">{verificationInfo.type}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-muted-foreground">Wert:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(verificationInfo.token)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Kopieren
                      </Button>
                    </div>
                    <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded">
                      {verificationInfo.token}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Die Verifizierung kann bis zu 24 Stunden dauern. Du erhältst eine Benachrichtigung.
              </p>

              <DialogFooter>
                <Button onClick={handleClose} className="w-full">
                  Verstanden
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">🎉 Geschafft!</h3>
              <p className="text-muted-foreground mb-6">
                Deine Homepage ist jetzt online und für alle erreichbar.
              </p>
              <Button onClick={handleClose} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Fertig
              </Button>
            </motion.div>
          )}

          {/* Step: Manage (wenn bereits verbunden) */}
          {step === 'manage' && connectedDomain && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Domain verbunden</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>
                </div>
                <div className="bg-white dark:bg-black/20 rounded-lg px-4 py-3 font-mono text-sm flex items-center justify-between">
                  <span>{connectedDomain}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`https://${connectedDomain}`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`https://${connectedDomain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setStep('options')}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Andere Domain verbinden
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  DNS-Status prüfen
                </Button>
              </div>

              <DialogFooter>
                <Button onClick={handleClose} variant="outline" className="w-full">
                  Schließen
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}



