'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Store, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Key,
  Shield,
  Loader2,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ShopifyConnectPage() {
  const router = useRouter()
  const [shopDomain, setShopDomain] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecretKey, setApiSecretKey] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; shopName?: string } | null>(null)

  // Test-Verbindung ohne zu speichern
  const handleTest = async () => {
    if (!shopDomain || !accessToken) {
      toast.error('Shop-Domain und Access Token sind erforderlich')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const res = await fetch('/api/salon/shop/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopDomain, 
          accessToken,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setTestResult({ 
          success: true, 
          message: `Verbindung erfolgreich! Shop: ${data.shopName}`,
          shopName: data.shopName,
        })
        toast.success(`Verbindung erfolgreich! Shop: ${data.shopName}`)
      } else {
        setTestResult({ 
          success: false, 
          message: data.error || 'Verbindung fehlgeschlagen' 
        })
        toast.error(data.error || 'Verbindung fehlgeschlagen')
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Netzwerkfehler' })
      toast.error('Netzwerkfehler')
    } finally {
      setIsTesting(false)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    setConnectionStatus('idle')

    try {
      const res = await fetch('/api/salon/shop/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopDomain, 
          accessToken,
          apiKey: apiKey || undefined,
          apiSecretKey: apiSecretKey || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setConnectionStatus('success')
        toast.success('Shopify erfolgreich verbunden!')
        setTimeout(() => router.push('/salon/shop'), 1500)
      } else {
        setConnectionStatus('error')
        toast.error(data.error || 'Verbindung fehlgeschlagen')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Verbindung fehlgeschlagen')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/salon/shop">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Shop
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Shopify verbinden</CardTitle>
              <CardDescription className="text-base">
                Verbinde deinen Shopify-Store mit NICNOA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-6">
                {/* Shop Domain */}
                <div className="space-y-2">
                  <Label htmlFor="shopDomain" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Shop-Domain *
                  </Label>
                  <div className="flex">
                    <Input
                      id="shopDomain"
                      placeholder="mein-shop"
                      value={shopDomain}
                      onChange={(e) => setShopDomain(e.target.value)}
                      className="rounded-r-none"
                      required
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted text-sm text-muted-foreground">
                      .myshopify.com
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Die myshopify.com-URL deines Shops (ohne https://)
                  </p>
                </div>

                {/* Admin API Access Token */}
                <div className="space-y-2">
                  <Label htmlFor="accessToken" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Admin API Access Token *
                  </Label>
                  <div className="relative">
                    <Input
                      id="accessToken"
                      type={showToken ? 'text' : 'password'}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="pr-10 font-mono text-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Beginnt mit <code className="bg-muted px-1 rounded">shpat_</code>
                  </p>
                </div>

                {/* Test Button */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting || !shopDomain || !accessToken}
                    className="flex-1"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Teste...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Verbindung testen
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Result */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      testResult.success 
                        ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' 
                        : 'text-red-500 bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </motion.div>
                )}

                <Separator />

                {/* Optional: API Credentials für Webhooks */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Optional: API Credentials (für Webhooks)</span>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      placeholder="z.B. c98d420438b7fd0ca40b33aa2fe9a7e0"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Für Webhook-Authentifizierung (optional)
                    </p>
                  </div>

                  {/* API Secret Key */}
                  <div className="space-y-2">
                    <Label htmlFor="apiSecretKey">API Secret Key</Label>
                    <div className="relative">
                      <Input
                        id="apiSecretKey"
                        type={showApiSecret ? 'text' : 'password'}
                        placeholder="shpss_xxxxxxxxxxxxxxxxxxxxx"
                        value={apiSecretKey}
                        onChange={(e) => setApiSecretKey(e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                      >
                        {showApiSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Beginnt mit <code className="bg-muted px-1 rounded">shpss_</code> - für Webhook-Verifizierung (optional)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Help Text */}
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-3">
                  <p className="font-medium flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-500" />
                    So erstellst du eine Custom App in Shopify:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Gehe zu{' '}
                      <a 
                        href="https://admin.shopify.com/store" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:underline inline-flex items-center gap-1"
                      >
                        Shopify Admin
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <strong>Einstellungen → Apps und Vertriebskanäle</strong>
                    </li>
                    <li>
                      Klicke auf <strong>&quot;Apps entwickeln&quot;</strong> (oben rechts)
                    </li>
                    <li>
                      Klicke auf <strong>&quot;App erstellen&quot;</strong>
                    </li>
                    <li>
                      Gib der App einen Namen (z.B. &quot;NICNOA Integration&quot;)
                    </li>
                    <li>
                      Unter <strong>&quot;API-Anmeldeinformationen konfigurieren&quot;</strong>:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Admin API Scopes: <code className="bg-muted px-1 rounded text-xs">read_products</code>, <code className="bg-muted px-1 rounded text-xs">write_products</code>, <code className="bg-muted px-1 rounded text-xs">read_inventory</code>, <code className="bg-muted px-1 rounded text-xs">write_inventory</code>, <code className="bg-muted px-1 rounded text-xs">read_orders</code></li>
                      </ul>
                    </li>
                    <li>
                      Klicke auf <strong>&quot;App installieren&quot;</strong>
                    </li>
                    <li>
                      Kopiere den <strong>Admin API Access Token</strong> (beginnt mit <code className="bg-muted px-1 rounded text-xs">shpat_</code>)
                    </li>
                  </ol>
                </div>

                {/* Status */}
                {connectionStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Verbindung erfolgreich! Du wirst weitergeleitet...</span>
                  </motion.div>
                )}

                {connectionStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span>Verbindung fehlgeschlagen. Bitte überprüfe deine Daten.</span>
                  </motion.div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  size="lg"
                  disabled={isConnecting || connectionStatus === 'success'}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Verbinde...
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Verbunden
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Mit Shopify verbinden & speichern
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
