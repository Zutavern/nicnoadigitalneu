'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Save,
  Euro,
  Percent,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Cloud,
  CloudOff,
  Pencil,
  Info,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InventoryBadge, PriceDisplay } from '@/components/shop'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  description: string | null
  vendor: string | null
  productType: string | null
  imageUrl: string | null
  images: string[]
  shopifyProductId: string
  shopifyVariantId: string | null
  shopifyInventoryId: string | null
  shopifyPrice: number
  compareAtPrice: number | null
  purchasePrice: number | null
  customMarginType: string | null
  customMarginValue: number | null
  customCommissionType: string | null
  customCommissionValue: number | null
  inventoryQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  isActive: boolean
  isAffiliateEnabled: boolean
  calculatedStylistPrice: number
  calculatedCommission: number
  // Sync-Fähigkeiten
  canSyncInventory: boolean
  canSyncPrice: boolean
  canSyncProduct: boolean
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Shopify Form State
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [vendor, setVendor] = useState<string>('')
  const [productType, setProductType] = useState<string>('')
  const [shopifyPrice, setShopifyPrice] = useState<string>('')
  const [inventoryQuantity, setInventoryQuantity] = useState<string>('')

  // NICNOA Form State
  const [purchasePrice, setPurchasePrice] = useState<string>('')
  const [marginType, setMarginType] = useState<string>('global')
  const [marginValue, setMarginValue] = useState<string>('')
  const [commissionType, setCommissionType] = useState<string>('global')
  const [commissionValue, setCommissionValue] = useState<string>('')
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('')
  const [isActive, setIsActive] = useState(true)
  const [isAffiliateEnabled, setIsAffiliateEnabled] = useState(true)

  // Sync State
  const [syncToShopify, setSyncToShopify] = useState(true)
  const [hasShopifyChanges, setHasShopifyChanges] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/salon/shop/products/${id}`)
      const data = await res.json()

      if (res.ok && data.product) {
        setProduct(data.product)

        // Shopify-Daten füllen
        setTitle(data.product.title || '')
        setDescription(data.product.description || '')
        setVendor(data.product.vendor || '')
        setProductType(data.product.productType || '')
        setShopifyPrice(data.product.shopifyPrice?.toString() || '')
        setInventoryQuantity(data.product.inventoryQuantity?.toString() || '0')

        // NICNOA-Daten füllen
        setPurchasePrice(data.product.purchasePrice?.toString() || '')
        setMarginType(data.product.customMarginType || 'global')
        setMarginValue(data.product.customMarginValue?.toString() || '')
        setCommissionType(data.product.customCommissionType || 'global')
        setCommissionValue(data.product.customCommissionValue?.toString() || '')
        setLowStockThreshold(data.product.lowStockThreshold?.toString() || '5')
        setIsActive(data.product.isActive)
        setIsAffiliateEnabled(data.product.isAffiliateEnabled)
        setHasShopifyChanges(false)
      } else {
        toast.error(data.error || 'Produkt nicht gefunden')
        router.push('/salon/shop/products')
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Produkts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        // NICNOA-Felder
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        customMarginType: marginType === 'global' ? null : marginType,
        customMarginValue:
          marginType === 'global' ? null : parseFloat(marginValue) || null,
        customCommissionType: commissionType === 'global' ? null : commissionType,
        customCommissionValue:
          commissionType === 'global' ? null : parseFloat(commissionValue) || null,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        isActive,
        isAffiliateEnabled,
      }

      // Shopify-Felder hinzufügen wenn geändert
      if (hasShopifyChanges || syncToShopify) {
        payload.title = title
        payload.description = description
        payload.vendor = vendor
        payload.productType = productType
        payload.shopifyPrice = shopifyPrice ? parseFloat(shopifyPrice) : undefined
        payload.inventoryQuantity = parseInt(inventoryQuantity) || 0
        payload.syncToShopify = syncToShopify
      } else {
        payload.inventoryQuantity = parseInt(inventoryQuantity) || 0
      }

      const res = await fetch(`/api/salon/shop/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.shopifyErrors && data.shopifyErrors.length > 0) {
          toast.warning(
            `Lokal gespeichert, aber Shopify-Fehler: ${data.shopifyErrors.join(', ')}`
          )
        } else {
          toast.success(
            syncToShopify && hasShopifyChanges
              ? 'Produkt gespeichert und zu Shopify synchronisiert'
              : 'Produkt gespeichert'
          )
        }
        setHasShopifyChanges(false)
        loadProduct() // Refresh für berechnete Preise
      } else {
        toast.error(data.error || 'Speichern fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Speichern fehlgeschlagen')
    } finally {
      setIsSaving(false)
    }
  }

  // Shopify-Änderung tracken
  const handleShopifyFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    setHasShopifyChanges(true)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/salon/shop/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{title || product.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {vendor && <span>{vendor}</span>}
                {productType && (
                  <>
                    <span>•</span>
                    <span>{productType}</span>
                  </>
                )}
                {hasShopifyChanges && (
                  <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                    <Pencil className="h-3 w-3 mr-1" />
                    Ungespeichert
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Sync Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <Switch
                    id="syncToShopify"
                    checked={syncToShopify}
                    onCheckedChange={setSyncToShopify}
                  />
                  <Label htmlFor="syncToShopify" className="text-sm cursor-pointer">
                    {syncToShopify ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <Cloud className="h-4 w-4" />
                        Sync aktiv
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CloudOff className="h-4 w-4" />
                        Nur lokal
                      </span>
                    )}
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {syncToShopify
                    ? 'Änderungen werden zu Shopify synchronisiert'
                    : 'Änderungen werden nur lokal gespeichert'}
                </p>
              </TooltipContent>
            </Tooltip>

            <Button onClick={handleSave} disabled={isSaving}>
              {syncToShopify && hasShopifyChanges ? (
                <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving
                ? 'Speichern...'
                : syncToShopify && hasShopifyChanges
                  ? 'Speichern & Sync'
                  : 'Speichern'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produkt-Info Sidebar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-0">
                {/* Bild */}
                <div className="relative aspect-square bg-muted">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <InventoryBadge
                      quantity={parseInt(inventoryQuantity) || 0}
                      threshold={parseInt(lowStockThreshold) || 5}
                    />
                    {!isActive && <Badge variant="secondary">Inaktiv</Badge>}
                    {syncToShopify && (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        <Cloud className="h-3 w-3 mr-1" />
                        Shopify
                      </Badge>
                    )}
                  </div>

                  {/* Preise Übersicht */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shopify VK:</span>
                      <span className="font-medium">
                        {(parseFloat(shopifyPrice) || 0).toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                    {purchasePrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Einkaufspreis:</span>
                        <span className="font-medium">
                          {parseFloat(purchasePrice).toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Stylist-Preis:</span>
                      <span className="font-bold text-purple-500">
                        {product.calculatedStylistPrice.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  </div>

                  {/* Shopify Link */}
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://admin.shopify.com/store/*/products/${product.shopifyProductId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      In Shopify öffnen
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        {/* Hauptbereich mit Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="shopify" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shopify" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Shopify-Daten
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Preise & Marge
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            {/* Tab: Shopify-Daten */}
            <TabsContent value="shopify" className="space-y-6">
              {/* Sync-Warnung wenn nicht alle IDs vorhanden */}
              {(!product.canSyncInventory || !product.canSyncPrice) && (
                <Card className="border-amber-500/50 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-medium text-amber-500">
                          Eingeschränkte Sync-Möglichkeiten
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {!product.canSyncInventory && (
                            <li>• Lagerbestand kann nicht synchronisiert werden (Inventory-ID fehlt)</li>
                          )}
                          {!product.canSyncPrice && (
                            <li>• Preis kann nicht synchronisiert werden (Varianten-ID fehlt)</li>
                          )}
                        </ul>
                        <p className="text-sm">
                          <strong>Lösung:</strong> Gehe zur{' '}
                          <Link href="/salon/shop/products" className="text-purple-500 underline">
                            Produktübersicht
                          </Link>{' '}
                          und klicke auf &quot;Synchronisieren&quot;, um alle Produkte neu zu laden.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-green-500" />
                    Produktdaten
                  </CardTitle>
                  <CardDescription>
                    Diese Daten werden direkt in deinem Shopify-Store aktualisiert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Titel */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Produkttitel</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => handleShopifyFieldChange(setTitle, e.target.value)}
                      placeholder="Produktname"
                    />
                  </div>

                  {/* Beschreibung */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) =>
                        handleShopifyFieldChange(setDescription, e.target.value)
                      }
                      placeholder="Produktbeschreibung..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      HTML-Tags werden unterstützt
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Vendor */}
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Hersteller / Marke</Label>
                      <Input
                        id="vendor"
                        value={vendor}
                        onChange={(e) =>
                          handleShopifyFieldChange(setVendor, e.target.value)
                        }
                        placeholder="z.B. L'Oréal"
                      />
                    </div>

                    {/* Produkttyp */}
                    <div className="space-y-2">
                      <Label htmlFor="productType">Produktkategorie</Label>
                      <Input
                        id="productType"
                        value={productType}
                        onChange={(e) =>
                          handleShopifyFieldChange(setProductType, e.target.value)
                        }
                        placeholder="z.B. Haarpflege"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shopify Preis & Lagerbestand */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preis & Lagerbestand</CardTitle>
                  <CardDescription>
                    Wird mit Shopify synchronisiert wenn aktiv
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Preis */}
                    <div className="space-y-2">
                      <Label htmlFor="shopifyPrice">Verkaufspreis (VK)</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="shopifyPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={shopifyPrice}
                          onChange={(e) =>
                            handleShopifyFieldChange(setShopifyPrice, e.target.value)
                          }
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Endkundenpreis in Shopify
                      </p>
                    </div>

                    {/* Lagerbestand */}
                    <div className="space-y-2">
                      <Label htmlFor="inventoryQuantity">Lagerbestand</Label>
                      <Input
                        id="inventoryQuantity"
                        type="number"
                        min="0"
                        value={inventoryQuantity}
                        onChange={(e) =>
                          handleShopifyFieldChange(setInventoryQuantity, e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Verfügbare Menge
                      </p>
                    </div>
                  </div>

                  {parseInt(inventoryQuantity) <= parseInt(lowStockThreshold) && (
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Lagerbestand unter Warngrenze ({lowStockThreshold} Stück)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Preise & Marge */}
            <TabsContent value="pricing" className="space-y-6">
              {/* Preisgestaltung */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preisgestaltung (NICNOA)</CardTitle>
                  <CardDescription>
                    Einkaufspreis und Marge für Stuhlmieter konfigurieren
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Einkaufspreis */}
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Einkaufspreis (optional)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Wenn leer, wird der Shopify-VK als Basis verwendet
                    </p>
                  </div>

                  <Separator />

                  {/* Marge */}
                  <div className="space-y-2">
                    <Label>Marge für Stuhlmieter</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={marginType} onValueChange={setMarginType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global (Standard)</SelectItem>
                          <SelectItem value="PERCENTAGE">Prozentsatz</SelectItem>
                          <SelectItem value="FIXED">Fester Betrag</SelectItem>
                        </SelectContent>
                      </Select>

                      {marginType !== 'global' && (
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
                            placeholder={marginType === 'PERCENTAGE' ? '20' : '5,00'}
                            value={marginValue}
                            onChange={(e) => setMarginValue(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preis-Vorschau */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Preisberechnung</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Basis:</span>
                      <span>
                        {purchasePrice
                          ? `${parseFloat(purchasePrice).toFixed(2)} € (EK)`
                          : `${parseFloat(shopifyPrice).toFixed(2)} € (VK)`}
                      </span>
                      <span className="text-muted-foreground">+ Marge:</span>
                      <span>
                        {marginType === 'global'
                          ? 'Global'
                          : marginType === 'PERCENTAGE'
                            ? `${marginValue || 0}%`
                            : `${marginValue || 0} €`}
                      </span>
                      <span className="text-muted-foreground font-medium">= Stylist-Preis:</span>
                      <span className="font-bold text-purple-500">
                        {product.calculatedStylistPrice.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate-Provision */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Affiliate-Provision</CardTitle>
                  <CardDescription>
                    Provision für Verkäufe über Stuhlmieter-Homepages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Affiliate aktiviert</Label>
                      <p className="text-xs text-muted-foreground">
                        Produkt kann über Affiliate-Links verkauft werden
                      </p>
                    </div>
                    <Switch
                      checked={isAffiliateEnabled}
                      onCheckedChange={setIsAffiliateEnabled}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Provision</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={commissionType} onValueChange={setCommissionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global (Standard)</SelectItem>
                          <SelectItem value="PERCENTAGE">Prozentsatz</SelectItem>
                          <SelectItem value="FIXED">Fester Betrag</SelectItem>
                        </SelectContent>
                      </Select>

                      {commissionType !== 'global' && (
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
                            placeholder={commissionType === 'PERCENTAGE' ? '10' : '2,00'}
                            value={commissionValue}
                            onChange={(e) => setCommissionValue(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      )}
                    </div>

                    {product.calculatedCommission > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Aktuelle Provision:{' '}
                        <span className="font-medium text-foreground">
                          {product.calculatedCommission.toFixed(2).replace('.', ',')} €
                        </span>{' '}
                        pro Verkauf
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Einstellungen */}
            <TabsContent value="settings" className="space-y-6">
              {/* Lagerbestand-Einstellungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lagerbestand-Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Warngrenze</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Benachrichtigung bei Unterschreitung dieser Menge
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Sichtbarkeit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Produkt aktiv</Label>
                      <p className="text-xs text-muted-foreground">
                        Inaktive Produkte werden nicht im Shop angezeigt
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Synchronisation</p>
                      <p className="text-xs text-muted-foreground">
                        Wenn &quot;Sync aktiv&quot; oben aktiviert ist, werden Änderungen an
                        Shopify-Daten (Titel, Beschreibung, Preis, Lagerbestand)
                        automatisch zu deinem Shopify-Store übertragen.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        NICNOA-Einstellungen (Einkaufspreis, Marge, Provision) werden
                        immer nur lokal gespeichert.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
    </TooltipProvider>
  )
}

