'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, ArrowLeft, KeyRound } from 'lucide-react'
import { AuthEvents, identifyUser } from '@/lib/analytics'

function TwoFactorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const isMagicLink = searchParams.get('magicLink') === 'true'
  const magicLinkUserId = searchParams.get('userId')
  const magicLinkToken = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [showBackupInput, setShowBackupInput] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Get credentials from sessionStorage (for password login) or URL params (for magic link)
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
    token: string
    isMagicLink?: boolean
    userId?: string
  } | null>(null)

  useEffect(() => {
    // Magic link flow
    if (isMagicLink && magicLinkUserId && magicLinkToken) {
      setCredentials({
        email: '',
        password: '',
        token: magicLinkToken,
        isMagicLink: true,
        userId: magicLinkUserId,
      })
      return
    }

    // Password flow
    const storedData = sessionStorage.getItem('pending2FA')
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setCredentials(parsed)
      } catch {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router, isMagicLink, magicLinkUserId, magicLinkToken])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (codeString?: string) => {
    if (!credentials) return

    const finalCode = codeString || code.join('')

    if (finalCode.length !== 6 && !showBackupInput) {
      setError('Bitte geben Sie den 6-stelligen Code ein')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Verify 2FA code
      const verifyResponse = await fetch('/api/auth/2fa/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentials.token,
          code: showBackupInput ? undefined : finalCode,
          backupCode: showBackupInput ? backupCode : undefined,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        AuthEvents.twoFactorFailed()
        setError(verifyData.error || 'Verifizierung fehlgeschlagen')
        if (!showBackupInput) {
          setCode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
        return
      }

      // Handle Magic Link flow differently
      if (credentials.isMagicLink && credentials.userId) {
        // For magic link, call a special endpoint that creates the session
        const magicLoginResponse = await fetch('/api/auth/magic-link/complete-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: credentials.userId }),
        })

        if (magicLoginResponse.ok) {
          AuthEvents.twoFactorCompleted(showBackupInput ? 'backup' : 'totp')
          AuthEvents.magicLinkClicked()
          identifyUser(credentials.userId)
          router.push(callbackUrl)
          router.refresh()
        } else {
          AuthEvents.twoFactorFailed()
          setError('Anmeldung fehlgeschlagen')
        }
        return
      }

      // 2FA verified - now sign in with password
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        AuthEvents.loginFailed('credentials_after_2fa')
        setError('Anmeldung fehlgeschlagen')
      } else {
        AuthEvents.twoFactorCompleted(showBackupInput ? 'backup' : 'totp')
        AuthEvents.loginCompleted('email', true)
        // Clear stored credentials
        sessionStorage.removeItem('pending2FA')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      AuthEvents.twoFactorFailed()
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (!credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Zwei-Faktor-Authentifizierung</h1>
          <p className="mt-2 text-slate-400">
            Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein
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

        {!showBackupInput ? (
          <div className="space-y-6">
            {/* Code Input */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-900 border-slate-700 text-white focus:border-primary"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              onClick={() => handleSubmit()}
              className="w-full h-12 bg-white text-black hover:bg-slate-200"
              disabled={isLoading || code.some(d => !d)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird verifiziert...
                </>
              ) : (
                'Verifizieren'
              )}
            </Button>

            <button
              type="button"
              onClick={() => setShowBackupInput(true)}
              className="w-full text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Backup-Code verwenden
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="backupCode" className="text-slate-300">Backup-Code</Label>
              <Input
                id="backupCode"
                type="text"
                placeholder="XXXX-XXXX"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                className="h-12 text-center text-lg font-mono bg-slate-900 border-slate-700 text-white focus:border-primary"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-slate-500 text-center">
                Geben Sie einen Ihrer Backup-Codes ein
              </p>
            </div>

            <Button
              onClick={() => handleSubmit()}
              className="w-full h-12 bg-white text-black hover:bg-slate-200"
              disabled={isLoading || !backupCode}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird verifiziert...
                </>
              ) : (
                'Mit Backup-Code anmelden'
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setShowBackupInput(false)
                setBackupCode('')
              }}
              className="w-full text-sm text-slate-400 hover:text-white"
            >
              ← Zurück zum Code
            </button>
          </div>
        )}

        <div className="text-center pt-4 border-t border-slate-800">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-2"
            onClick={() => sessionStorage.removeItem('pending2FA')}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function TwoFactorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<TwoFactorLoading />}>
      <TwoFactorForm />
    </Suspense>
  )
}


