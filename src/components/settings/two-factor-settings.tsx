'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Shield, 
  ShieldCheck, 
  ShieldOff,
  Loader2, 
  Copy, 
  Check,
  AlertTriangle,
  Smartphone,
  Key
} from 'lucide-react'
import { toast } from 'sonner'

interface TwoFactorSettingsProps {
  enabled: boolean
  onUpdate: () => void
}

export function TwoFactorSettings({ enabled, onUpdate }: TwoFactorSettingsProps) {
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isDisableOpen, setIsDisableOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [setupData, setSetupData] = useState<{
    secret: string
    qrCode: string
    backupCodes: string[]
  } | null>(null)
  const [verifyToken, setVerifyToken] = useState('')
  const [disableToken, setDisableToken] = useState('')
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Setup fehlgeschlagen')
      }

      const data = await response.json()
      setSetupData(data)
      setIsSetupOpen(true)
      setStep('qr')
    } catch (error) {
      toast.error('2FA-Setup fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (verifyToken.length !== 6) {
      toast.error('Bitte gib einen 6-stelligen Code ein')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      })

      if (!response.ok) {
        throw new Error('Verifizierung fehlgeschlagen')
      }

      setStep('backup')
      toast.success('2FA erfolgreich aktiviert!')
    } catch (error) {
      toast.error('Ungültiger Code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    if (disableToken.length !== 6) {
      toast.error('Bitte gib einen 6-stelligen Code ein')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableToken }),
      })

      if (!response.ok) {
        throw new Error('Deaktivierung fehlgeschlagen')
      }

      setIsDisableOpen(false)
      setDisableToken('')
      onUpdate()
      toast.success('2FA deaktiviert')
    } catch (error) {
      toast.error('Ungültiger Code')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
    }
    toast.success('In Zwischenablage kopiert')
  }

  const handleClose = () => {
    setIsSetupOpen(false)
    setSetupData(null)
    setVerifyToken('')
    setStep('qr')
    if (step === 'backup') {
      onUpdate()
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${enabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                {enabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Zwei-Faktor-Authentifizierung</CardTitle>
                <CardDescription>
                  Erhöhe die Sicherheit deines Kontos
                </CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {enabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dein Konto ist durch 2FA geschützt. Bei jeder Anmeldung wird ein Code aus deiner Authenticator-App benötigt.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setIsDisableOpen(true)}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                2FA deaktivieren
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aktiviere die Zwei-Faktor-Authentifizierung für zusätzliche Sicherheit. Du benötigst eine Authenticator-App wie Google Authenticator oder Authy.
              </p>
              <Button 
                onClick={handleSetup}
                disabled={isLoading}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                2FA aktivieren
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>2FA einrichten</DialogTitle>
            <DialogDescription>
              {step === 'qr' && 'Scanne den QR-Code mit deiner Authenticator-App'}
              {step === 'verify' && 'Gib den Code aus deiner App ein'}
              {step === 'backup' && 'Speichere deine Backup-Codes'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 'qr' && setupData && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={setupData.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Oder gib diesen Code manuell ein:
                  </Label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {setupData.secret}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(setupData.secret, 'secret')}
                    >
                      {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setStep('verify')}
                >
                  Weiter
                </Button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Smartphone className="h-5 w-5 text-pink-500" />
                  <p className="text-sm">
                    Öffne deine Authenticator-App und gib den 6-stelligen Code ein.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Verifizierungscode</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('qr')}
                    className="flex-1"
                  >
                    Zurück
                  </Button>
                  <Button 
                    onClick={handleVerify}
                    disabled={isLoading || verifyToken.length !== 6}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verifizieren'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'backup' && setupData && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Speichere diese Codes sicher. Du benötigst sie, falls du den Zugang zu deiner Authenticator-App verlierst.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Backup-Codes
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'backup')}
                    >
                      {copiedBackup ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Kopieren
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                    {setupData.backupCodes.map((code, i) => (
                      <code key={i} className="text-sm font-mono text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500" 
                  onClick={handleClose}
                >
                  Fertig
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>2FA deaktivieren</DialogTitle>
            <DialogDescription>
              Gib deinen aktuellen 2FA-Code ein, um die Zwei-Faktor-Authentifizierung zu deaktivieren.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verifizierungscode</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDisableOpen(false)}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDisable}
                disabled={isLoading || disableToken.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Deaktivieren'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}








