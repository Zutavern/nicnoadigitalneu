'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, Phone, X, AlertTriangle
} from 'lucide-react'

interface PhoneVerificationOverlayProps {
  isOpen: boolean
  onClose?: () => void
  onVerified: () => void
  userId: string
}

// Generiere eine Session-ID für die SMS-Verifizierung
function generateSessionId(): string {
  return 'verify_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function PhoneVerificationOverlay({
  isOpen,
  onClose,
  onVerified,
  userId,
}: PhoneVerificationOverlayProps) {
  // Session-ID für SMS-Verifizierung
  const [sessionId] = useState(() => generateSessionId())
  
  // State
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState(['', '', '', ''])
  const [smsSent, setSmsSent] = useState(false)
  const [smsError, setSmsError] = useState('')
  const [remainingSms, setRemainingSms] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [maskedPhone, setMaskedPhone] = useState('')
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  
  // Code Input Refs
  const codeInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  
  // Telefon-Validierung
  const isPhoneValid = /^\+?[\d\s\-()]{8,20}$/.test(phone.replace(/\s/g, ''))

  // Reset bei Schließen
  useEffect(() => {
    if (!isOpen) {
      setPhone('')
      setSmsCode(['', '', '', ''])
      setSmsSent(false)
      setSmsError('')
      setMaskedPhone('')
    }
  }, [isOpen])
  
  // SMS senden
  const sendSms = async () => {
    if (!isPhoneValid) {
      setSmsError('Bitte geben Sie eine gültige Telefonnummer ein')
      return false
    }
    
    setIsResending(true)
    setSmsError('')
    
    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          sessionId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.blockedUntil) {
          setBlockedUntil(new Date(data.blockedUntil))
        }
        setSmsError(data.message || data.error)
        return false
      }
      
      setSmsSent(true)
      setMaskedPhone(data.maskedPhone)
      setRemainingSms(data.remainingSms)
      
      // Im Testmodus: Code in Console anzeigen
      if (data.testCode) {
        console.log('🔐 Test-Code:', data.testCode)
      }
      
      return true
    } catch {
      setSmsError('Fehler beim Senden der SMS')
      return false
    } finally {
      setIsResending(false)
    }
  }
  
  // Telefon bestätigen und SMS senden
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendSms()
  }
  
  // Code Input Handler
  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newCode = [...smsCode]
    newCode[index] = value.slice(-1)
    setSmsCode(newCode)
    
    // Auto-fokus zum nächsten Input
    if (value && index < 3) {
      codeInputRefs[index + 1].current?.focus()
    }
    
    // Wenn alle 4 Ziffern eingegeben wurden, automatisch verifizieren
    if (newCode.every(c => c !== '') && index === 3) {
      verifyCode(newCode.join(''))
    }
  }
  
  // Backspace Handler
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      codeInputRefs[index - 1].current?.focus()
    }
  }
  
  // Code verifizieren
  const verifyCode = async (code: string) => {
    setIsLoading(true)
    setSmsError('')
    
    try {
      // SMS Code verifizieren
      const verifyResponse = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          sessionId,
        }),
      })
      
      const verifyData = await verifyResponse.json()
      
      if (!verifyResponse.ok) {
        setSmsError(verifyData.message || verifyData.error)
        setSmsCode(['', '', '', ''])
        codeInputRefs[0].current?.focus()
        return
      }
      
      // User-Telefon aktualisieren
      await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          phone,
        }),
      })
      
      // Callback aufrufen
      onVerified()
      
    } catch {
      setSmsError('Fehler bei der Verifizierung')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Telefonnummer ändern
  const handleChangePhone = () => {
    setSmsSent(false)
    setSmsCode(['', '', '', ''])
    setSmsError('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md p-6 relative"
        >
          {/* Close Button (nur wenn onClose definiert) */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Telefon verifizieren</h2>
              <p className="text-slate-400 text-sm">
                {!smsSent 
                  ? 'Bitte verifizieren Sie Ihre Telefonnummer, um fortzufahren.'
                  : 'Geben Sie den Code aus der SMS ein.'}
              </p>
            </div>

            {/* Warning Banner */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium">Verifizierung erforderlich</p>
                  <p className="text-amber-200/70 mt-1">
                    Zur Sicherheit müssen alle Konten eine verifizierte Telefonnummer haben.
                  </p>
                </div>
              </div>
            </div>

            {smsError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
              >
                {smsError}
              </motion.div>
            )}

            {!smsSent ? (
              // Telefonnummer eingeben
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">Mobilnummer</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+49 170 1234567"
                      className="pl-10 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary text-white hover:bg-primary/90" 
                  disabled={isResending || !isPhoneValid}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'SMS-Code anfordern'
                  )}
                </Button>
              </form>
            ) : (
              // Code eingeben
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Code gesendet an</p>
                  <p className="text-white font-mono">{maskedPhone || phone}</p>
                </div>

                {/* Code Input */}
                <div className="flex justify-center gap-3">
                  {smsCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={codeInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold bg-slate-800 border-slate-700 text-white focus:border-primary"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {isLoading && (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleChangePhone}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
                  >
                    Falsche Nummer? <span className="text-primary">Ändern</span>
                  </button>

                  <div className="text-center">
                    <p className="text-slate-500 text-sm mb-2">Keine SMS erhalten?</p>
                    {blockedUntil && blockedUntil > new Date() ? (
                      <p className="text-red-400 text-sm">
                        Bitte warte {Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)} Minuten.
                      </p>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sendSms}
                        disabled={isResending || remainingSms <= 0}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        {isResending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Erneut senden {remainingSms > 0 && `(noch ${remainingSms})`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

