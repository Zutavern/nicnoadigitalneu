'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Phone, ArrowLeft, Check } from 'lucide-react'

// Generiere eine Session-ID für die SMS-Verifizierung
function generateSessionId(): string {
  return 'verify_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export default function VerifyPhonePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  
  const [sessionId] = useState(() => generateSessionId())
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // SMS-Verifizierung State
  const [smsCode, setSmsCode] = useState(['', '', '', ''])
  const [remainingSms, setRemainingSms] = useState(3)
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
  
  // Wenn User bereits verifiziert ist, weiterleiten
  useEffect(() => {
    if (session?.user?.phoneVerified) {
      const role = session.user.role
      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'SALON_OWNER') {
        router.push('/salon')
      } else {
        router.push('/stylist')
      }
    }
  }, [session, router])
  
  // SMS senden
  const sendSms = async () => {
    if (!phone || !/^\+?[\d\s\-()]{8,20}$/.test(phone.replace(/\s/g, ''))) {
      setError('Bitte geben Sie eine gültige Telefonnummer ein')
      return
    }
    
    setIsLoading(true)
    setError('')
    
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
        setError(data.message || data.error)
        return
      }
      
      setMaskedPhone(data.maskedPhone)
      setRemainingSms(data.remainingSms)
      setStep('verify')
      
      // Im Testmodus: Code im Console anzeigen
      if (data.testCode) {
        console.log('🔐 Test-Code:', data.testCode)
      }
      
    } catch {
      setError('Fehler beim Senden der SMS')
    } finally {
      setIsLoading(false)
    }
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
    setError('')
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          sessionId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.message || data.error)
        setSmsCode(['', '', '', ''])
        codeInputRefs[0].current?.focus()
        return
      }
      
      // User-Telefon in DB aktualisieren
      if (session?.user?.id) {
        await fetch('/api/user/update-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            sessionId,
          }),
        })
      }
      
      // Session aktualisieren
      await update({ phoneVerified: true })
      
      // Weiterleiten
      const role = session?.user?.role
      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'SALON_OWNER') {
        router.push('/salon')
      } else {
        router.push('/onboarding')
      }
      
    } catch {
      setError('Fehler bei der Verifizierung')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Telefonnummer ändern
  const handleChangePhone = () => {
    setStep('input')
    setSmsCode(['', '', '', ''])
  }
  
  // Erneut senden
  const resendSms = async () => {
    setIsResending(true)
    await sendSms()
    setIsResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-4 justify-center">
          <span className="text-2xl font-bold tracking-tight text-white">
            NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
          </span>
        </Link>

        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 'input' ? 'Telefon verifizieren' : 'Code eingeben'}
          </h1>
          <p className="text-slate-400">
            {step === 'input' 
              ? 'Bitte verifizieren Sie Ihre Telefonnummer, um fortzufahren.'
              : `Wir haben eine SMS an ${maskedPhone} gesendet.`
            }
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {step === 'input' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Telefonnummer (Mobil)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+49 170 1234567"
                  className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500">
                Wir senden Ihnen einen SMS-Code zur Verifizierung.
              </p>
            </div>

            <Button 
              onClick={sendSms}
              className="w-full h-12 bg-white text-black hover:bg-slate-200" 
              disabled={isLoading || !phone}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SMS wird gesendet...
                </>
              ) : (
                'SMS-Code anfordern'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
                  className="w-14 h-14 text-center text-2xl font-bold bg-slate-900 border-slate-700 text-white focus:border-primary"
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
                <ArrowLeft className="h-4 w-4" />
                Telefonnummer ändern
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
                    onClick={resendSms}
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

        <p className="text-center text-slate-500 text-sm">
          Probleme? <Link href="/hilfe" className="text-primary hover:underline">Kontaktiere den Support</Link>
        </p>
      </motion.div>
    </div>
  )
}

