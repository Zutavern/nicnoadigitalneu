'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings,
  ArrowLeft,
  Save,
  Percent,
  Euro,
  CreditCard,
  Wallet,
  Link2,
  Unlink,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import Link from 'next/link'

interface ShopSettings {
  defaultMarginType: string
  defaultMarginValue: number
  defaultCommissionType: string
  defaultCommissionValue: number
  allowStripePayment: boolean
  allowRentAddition: boolean
  affiliateEnabled: boolean
}

export default function ShopSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // Form State
  const [marginType, setMarginType] = useState('PERCENTAGE')
  const [marginValue, setMarginValue] = useState('20')
  const [commissionType, setCommissionType] = useState('PERCENTAGE')
  const [commissionValue, setCommissionValue] = useState('10')
  const [allowStripe, setAllowStripe] = useState(true)
  const [allowRent, setAllowRent] = useState(true)
  const [affiliateEnabled, setAffiliateEnabled] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/salon/shop/settings')
      const data = await res.json()

      if (res.ok && data.settings) {
        setSettings(data.settings)
        setMarginType(data.settings.defaultMarginType)
        setMarginValue(data.settings.defaultMarginValue.toString())
        setCommissionType(data.settings.defaultCommissionType)
        setCommissionValue(data.settings.defaultCommissionValue.toString())
        setAllowStripe(data.settings.allowStripePayment)
        setAllowRent(data.settings.allowRentAddition)
        setAffiliateEnabled(data.settings.affiliateEnabled)
      } else {
        toast.error(data.error || 'Keine Einstellungen gefunden')
        router.push('/salon/shop')
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Einstellungen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/salon/shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultMarginType: marginType,
          defaultMarginValue: parseFloat(marginValue) || 0,
          defaultCommissionType: commissionType,
          defaultCommissionValue: parseFloat(commissionValue) || 0,
          allowStripePayment: allowStripe,
          allowRentAddition: allowRent,
          affiliateEnabled,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Einstellungen gespeichert')
        setSettings(data.settings)
      } else {
        toast.error(data.error || 'Speichern fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Speichern fehlgeschlagen')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const res = await fetch('/api/salon/shop/disconnect', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        toast.success('Shopify-Verbindung getrennt')
        router.push('/salon/shop')
      } else {
        toast.error(data.error || 'Trennen fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Trennen fehlgeschlagen')
    } finally {
      setIsDisconnecting(false)
      setShowDisconnectDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/salon/shop">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-purple-500" />
              Shop-Einstellungen
            </h1>
            <p className="text-muted-foreground">
              Globale Konfiguration für Preise und Zahlungen
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Marge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Globale Marge für Stuhlmieter</CardTitle>
              <CardDescription>
                Standardmarge die auf den Einkaufspreis (oder VK) aufgeschlagen wird
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select value={marginType} onValueChange={setMarginType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Prozentsatz
                        </div>
                      </SelectItem>
                      <SelectItem value="FIXED">
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          Fester Betrag
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wert</Label>
                  <div className="relative">
                    {marginType === 'PERCENTAGE' ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={marginValue}
                      onChange={(e) => setMarginValue(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {marginType === 'PERCENTAGE'
                  ? `Beispiel: Bei ${marginValue}% Marge und 10€ Basispreis → ${(10 * (1 + parseFloat(marginValue || '0') / 100)).toFixed(2)}€ Stylist-Preis`
                  : `Beispiel: Bei ${marginValue}€ Marge und 10€ Basispreis → ${(10 + parseFloat(marginValue || '0')).toFixed(2)}€ Stylist-Preis`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provision */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Affiliate-Provisionen</CardTitle>
              <CardDescription>
                Standard-Provision für Verkäufe über Stuhlmieter-Homepages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Affiliate-System aktivieren</Label>
                  <p className="text-xs text-muted-foreground">
                    Ermöglicht deinen Stuhlmietern, Produkte über ihre Homepage zu verkaufen
                  </p>
                </div>
                <Switch
                  checked={affiliateEnabled}
                  onCheckedChange={setAffiliateEnabled}
                />
              </div>

              {affiliateEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Provisions-Typ</Label>
                      <Select value={commissionType} onValueChange={setCommissionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Prozentsatz vom VK</SelectItem>
                          <SelectItem value="FIXED">Fester Betrag pro Verkauf</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Wert</Label>
                      <div className="relative">
                        {commissionType === 'PERCENTAGE' ? (
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Zahlungsoptionen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsoptionen für Stuhlmieter</CardTitle>
              <CardDescription>
                Welche Zahlungsmethoden können deine Stuhlmieter nutzen?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Label>Stripe-Zahlung</Label>
                    <p className="text-xs text-muted-foreground">
                      Sofortige Zahlung per Karte oder Link
                    </p>
                  </div>
                </div>
                <Switch checked={allowStripe} onCheckedChange={setAllowStripe} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <Label>Auf Stuhlmiete addieren</Label>
                    <p className="text-xs text-muted-foreground">
                      Betrag wird zur nächsten Stuhlmiete hinzugefügt
                    </p>
                  </div>
                </div>
                <Switch checked={allowRent} onCheckedChange={setAllowRent} />
              </div>

              {!allowStripe && !allowRent && (
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Mindestens eine Zahlungsmethode muss aktiviert sein
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Verbindung trennen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500">Gefahrenzone</CardTitle>
              <CardDescription>
                Shopify-Verbindung trennen und alle Shop-Daten löschen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDisconnectDialog(true)}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Verbindung trennen
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shopify-Verbindung trennen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle synchronisierten Produkte, Warenkörbe und Einstellungen werden gelöscht.
              Bestellungen bleiben erhalten. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDisconnecting ? 'Trennen...' : 'Verbindung trennen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

