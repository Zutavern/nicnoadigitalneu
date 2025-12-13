'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, FileText, ArrowLeft, ChevronDown, Loader2 } from 'lucide-react'

// Types für Legal Page
interface LegalSection {
  id: string
  title: string
  content: string
  sortOrder: number
  isActive: boolean
  isCollapsible: boolean
}

interface LegalPageConfig {
  pageType: string
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  lastUpdated: string | null
  sections: LegalSection[]
}

// Helper: Entsperren und Blocking-Elemente entfernen
function unlockPage() {
  document.documentElement.classList.add('password-unlocked')
  // Entferne alle blocking Elemente
  const blockingStyle = document.getElementById('password-protection-block')
  if (blockingStyle) blockingStyle.remove()
  const ssrBlock = document.getElementById('ssr-password-block')
  if (ssrBlock) {
    ssrBlock.style.opacity = '0'
    ssrBlock.style.pointerEvents = 'none'
    setTimeout(() => ssrBlock.remove(), 300)
  }
}

export function PasswordProtection() {
  // Session-Status zuerst prüfen (synchron) um Flackern zu vermeiden
  const [hasSessionPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('passwordEntered') === 'true'
    }
    return false
  })
  
  const [isUnlocked, setIsUnlocked] = useState(hasSessionPassword)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null) // null = noch nicht geladen
  const [isChecking, setIsChecking] = useState(!hasSessionPassword) // Wenn Session-Passwort vorhanden, kein Check nötig
  const inputRef = useRef<HTMLInputElement>(null)
  const apiCheckStarted = useRef(false) // Verhindert doppelte API-Calls
  
  // Impressum State
  const [showImpressum, setShowImpressum] = useState(false)
  const [impressumData, setImpressumData] = useState<LegalPageConfig | null>(null)
  const [impressumLoading, setImpressumLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // HTML-Klasse setzen wenn entsperrt (nur hinzufügen, nie entfernen)
  useEffect(() => {
    if (isUnlocked) {
      unlockPage()
    }
  }, [isUnlocked])

  useEffect(() => {
    // Wenn bereits entsperrt, keinen API-Call machen
    if (hasSessionPassword) {
      setIsEnabled(false)
      setIsChecking(false)
      // Sofort entsperren
      unlockPage()
      return
    }

    // Verhindere doppelte API-Calls (React StrictMode, etc.)
    if (apiCheckStarted.current) return
    apiCheckStarted.current = true
    
    const checkPasswordProtection = async () => {
      try {
        const res = await fetch('/api/platform/password-protection-status')
        if (res.ok) {
          const data = await res.json()
          const enabled = data.enabled ?? true
          setIsEnabled(enabled)
          if (!enabled) {
            setIsUnlocked(true)
            unlockPage()
          }
        } else {
          // Bei Fehler: Schutz nicht anzeigen
          setIsEnabled(false)
          setIsUnlocked(true)
          unlockPage()
        }
      } catch (error) {
        console.error('Error checking password protection status:', error)
        // Bei Fehler: Schutz nicht anzeigen (bessere UX)
        setIsEnabled(false)
        setIsUnlocked(true)
        unlockPage()
      } finally {
        setIsChecking(false)
      }
    }
    checkPasswordProtection()
  }, [hasSessionPassword])

  useEffect(() => {
    if (isChecking || !isEnabled || hasSessionPassword) return
    setTimeout(() => inputRef.current?.focus(), 500)
  }, [isChecking, isEnabled, hasSessionPassword])

  // Countdown-Logik
  useEffect(() => {
    if (countdown === null) return
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setTimeout(() => {
        sessionStorage.setItem('passwordEntered', 'true')
        setIsAnimatingOut(true)
        setTimeout(() => {
          setIsUnlocked(true)
          unlockPage()
        }, 800)
      }, 500)
    }
  }, [countdown])

  // Impressum laden
  const loadImpressum = async () => {
    if (impressumData) {
      setShowImpressum(true)
      return
    }
    
    setImpressumLoading(true)
    try {
      const res = await fetch('/api/legal-page-config/impressum')
      if (res.ok) {
        const data = await res.json()
        setImpressumData(data)
      }
    } catch (err) {
      console.error('Error loading impressum:', err)
    } finally {
      setImpressumLoading(false)
      setShowImpressum(true)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Konvertiere Markdown-ähnlichen Text in HTML-Elemente
  const formatContent = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    return formatted
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState?.('CapsLock') ?? false)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState?.('CapsLock') ?? false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Letsmakemoney') {
      setError(false)
      setCountdown(3)
    } else {
      setError(true)
      setPassword('')
      const form = e.target as HTMLFormElement
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
        inputRef.current?.focus()
      }, 500)
    }
  }

  // SSR-Block entfernen sobald diese Komponente übernimmt
  useEffect(() => {
    const ssrBlock = document.getElementById('ssr-password-block')
    if (ssrBlock && !isUnlocked) {
      // Kurz warten bis diese Komponente sichtbar ist, dann SSR-Block entfernen
      setTimeout(() => {
        ssrBlock.style.opacity = '0'
        ssrBlock.style.pointerEvents = 'none'
        setTimeout(() => ssrBlock.remove(), 300)
      }, 50)
    }
  }, [isUnlocked])

  // Während des Checks: Schwarzen Bildschirm anzeigen, damit nichts durchscheint
  if (isChecking || isEnabled === null) {
    return (
      <div data-password-protection className="fixed inset-0 z-[9999] bg-[#020203]" />
    )
  }
  
  // Wenn entsperrt oder deaktiviert: nichts anzeigen
  if (isUnlocked) return null

  return (
    <div data-password-protection>
    <AnimatePresence mode="wait">
      {!isAnimatingOut ? (
        <motion.div
          key="password-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] overflow-hidden"
        >
          {/* ===== ATEMBERAUBENDER NICNOA HINTERGRUND ===== */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Basis: Tiefer dunkler Gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% 0%, hsl(151, 40%, 8%) 0%, transparent 50%),
                  radial-gradient(ellipse 60% 40% at 100% 100%, hsl(151, 35%, 6%) 0%, transparent 50%),
                  radial-gradient(ellipse 70% 50% at 0% 50%, hsl(151, 30%, 5%) 0%, transparent 50%),
                  linear-gradient(180deg, #020203 0%, #030304 25%, #040405 50%, #030304 75%, #020203 100%)
                `,
              }}
            />

            {/* Mesh-Gradient Overlay - Der WOW-Effekt */}
            <div className="absolute inset-0">
              {/* Großer zentraler Glow */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmax] h-[120vmax]"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  rotate: { duration: 120, repeat: Infinity, ease: "linear" },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                  background: `
                    conic-gradient(
                      from 0deg at 50% 50%,
                      hsl(151, 50%, 15%) 0deg,
                      hsl(151, 40%, 8%) 60deg,
                      hsl(151, 60%, 12%) 120deg,
                      hsl(151, 35%, 6%) 180deg,
                      hsl(151, 55%, 14%) 240deg,
                      hsl(151, 45%, 10%) 300deg,
                      hsl(151, 50%, 15%) 360deg
                    )
                  `,
                  filter: 'blur(80px)',
                  opacity: 0.4,
                }}
              />
            </div>
            
            {/* Animierte Lichtstreifen */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute h-[200vh] w-[1px] bg-gradient-to-b from-transparent via-[hsl(151,60%,50%)]/30 to-transparent"
                style={{ left: '20%', top: '-50%' }}
                animate={{ 
                  y: ['-100%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 0, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute h-[200vh] w-[1px] bg-gradient-to-b from-transparent via-[hsl(151,50%,45%)]/25 to-transparent"
                style={{ left: '40%', top: '-50%' }}
                animate={{ 
                  y: ['-100%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute h-[200vh] w-[1px] bg-gradient-to-b from-transparent via-[hsl(151,55%,50%)]/20 to-transparent"
                style={{ left: '65%', top: '-50%' }}
                animate={{ 
                  y: ['-100%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, delay: 3, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute h-[200vh] w-[1px] bg-gradient-to-b from-transparent via-[hsl(151,45%,40%)]/15 to-transparent"
                style={{ left: '85%', top: '-50%' }}
                animate={{ 
                  y: ['-100%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 2, ease: "easeInOut" }}
              />
            </div>

            {/* Floating Orbs - Premium Effekt */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(151, 50%, 25%) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                  left: '-10%',
                  top: '-10%',
                }}
                animate={{ 
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(151, 45%, 20%) 0%, transparent 70%)',
                  filter: 'blur(50px)',
                  right: '-5%',
                  bottom: '10%',
                }}
                animate={{ 
                  x: [0, -80, 0],
                  y: [0, -60, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
              <motion.div 
                className="absolute w-[350px] h-[350px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(151, 55%, 22%) 0%, transparent 70%)',
                  filter: 'blur(45px)',
                  left: '30%',
                  bottom: '-5%',
                }}
                animate={{ 
                  x: [0, 60, 0],
                  y: [0, -40, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              />
              <motion.div 
                className="absolute w-[300px] h-[300px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(151, 60%, 28%) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  right: '25%',
                  top: '15%',
                }}
                animate={{ 
                  x: [0, -40, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>

            {/* Subtiles Netz-Muster */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(151, 50%, 50%) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(151, 50%, 50%) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
                maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 70%)',
              }}
            />

            {/* Partikel-System */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Funkelnde Sterne */}
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={`star-${i}`}
                  className="absolute w-[2px] h-[2px] bg-white rounded-full"
                  style={{ 
                    left: `${5 + (i * 4.5)}%`, 
                    top: `${10 + ((i * 17) % 80)}%`,
                  }}
                  animate={{ 
                    opacity: [0.1, 0.8, 0.1],
                    scale: [0.8, 1.5, 0.8],
                  }}
                  transition={{ 
                    duration: 2 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Aufsteigende Partikel mit Glow */}
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={`rise-${i}`}
                  className="absolute w-[3px] h-[3px] rounded-full"
                  style={{ 
                    left: `${10 + (i * 12)}%`, 
                    bottom: '-2%',
                    background: 'hsl(151, 60%, 50%)',
                    boxShadow: '0 0 10px hsl(151, 60%, 50%), 0 0 20px hsl(151, 50%, 40%)',
                  }}
                  animate={{ 
                    y: [0, -window.innerHeight * 1.2],
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.3],
                  }}
                  transition={{ 
                    duration: 8 + (i % 4),
                    repeat: Infinity,
                    delay: i * 1.2,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Aurora Borealis Effekt */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <motion.div 
                className="absolute w-[200%] h-[60%] -top-[20%] -left-[50%]"
                style={{
                  background: `
                    linear-gradient(180deg, 
                      transparent 0%,
                      hsl(151, 50%, 20%) 20%,
                      hsl(151, 40%, 15%) 40%,
                      hsl(151, 60%, 25%) 60%,
                      transparent 100%
                    )
                  `,
                  filter: 'blur(40px)',
                  transform: 'skewY(-5deg)',
                }}
                animate={{ 
                  x: ['-20%', '20%', '-20%'],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute w-[200%] h-[50%] -top-[10%] -left-[50%]"
                style={{
                  background: `
                    linear-gradient(180deg, 
                      transparent 0%,
                      hsl(151, 45%, 18%) 30%,
                      hsl(151, 55%, 22%) 50%,
                      transparent 100%
                    )
                  `,
                  filter: 'blur(50px)',
                  transform: 'skewY(8deg)',
                }}
                animate={{ 
                  x: ['20%', '-20%', '20%'],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Zentrale Highlight-Pulse */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
              style={{
                background: 'radial-gradient(circle, hsl(151, 50%, 30%) 0%, transparent 60%)',
                filter: 'blur(80px)',
              }}
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Vignette für Tiefe */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
          </motion.div>

          {/* Content Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
            {showImpressum ? (
              /* ===== IMPRESSUM PANEL ===== */
              <motion.div
                key="impressum-panel"
                initial={{ scale: 0.9, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
              >
                {/* Glow-Effekt */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-r from-[hsl(151,50%,40%)] via-[hsl(151,40%,30%)] to-[hsl(151,50%,40%)] rounded-3xl blur-2xl"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Impressum Box */}
                <div className="relative rounded-2xl border border-[hsl(151,40%,50%)]/20 bg-[#0a0a0b]/95 backdrop-blur-xl shadow-2xl shadow-[hsl(151,40%,20%)]/30 flex flex-col max-h-[85vh]">
                  {/* Header */}
                  <div className="p-6 pb-4 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl">
                          <FileText className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">Impressum</h2>
                          <p className="text-sm text-muted-foreground">Angaben gemäß § 5 TMG</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImpressum(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Zurück
                      </Button>
                    </div>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="overflow-y-auto flex-1 p-6 space-y-4">
                    {impressumData?.sections?.filter(s => s.isActive).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>Impressum wird geladen...</p>
                      </div>
                    ) : (
                      impressumData?.sections?.filter(s => s.isActive).map((section) => (
                        <div key={section.id} className="border border-border/50 rounded-lg overflow-hidden bg-background/30">
                          {section.isCollapsible ? (
                            <>
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                              >
                                <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                                <ChevronDown
                                  className={`h-4 w-4 text-muted-foreground transform transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`}
                                />
                              </button>
                              <motion.div
                                initial={false}
                                animate={{ height: expandedSections.has(section.id) ? 'auto' : 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div 
                                  className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
                                />
                              </motion.div>
                            </>
                          ) : (
                            <div className="p-4">
                              <h3 className="text-base font-semibold text-foreground mb-3">{section.title}</h3>
                              <div 
                                className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    
                    {/* Kontakt */}
                    {impressumData && (impressumData.contactEmail || impressumData.contactPhone) && (
                      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                        <h3 className="text-base font-semibold text-foreground mb-2">Kontakt</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {impressumData.contactEmail && (
                            <p>E-Mail: <a href={`mailto:${impressumData.contactEmail}`} className="text-primary hover:underline">{impressumData.contactEmail}</a></p>
                          )}
                          {impressumData.contactPhone && (
                            <p>Telefon: <a href={`tel:${impressumData.contactPhone.replace(/\s/g, '')}`} className="text-primary hover:underline">{impressumData.contactPhone}</a></p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Stand */}
                    {impressumData?.lastUpdated && (
                      <p className="text-center text-xs text-muted-foreground pt-2">
                        Stand: {new Date(impressumData.lastUpdated).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 pt-3 border-t border-border/50 shrink-0">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowImpressum(false)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Zurück zur Anmeldung
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ===== LOGIN BOX ===== */
              <motion.div
                key="login-box"
                initial={{ scale: 0.9, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="relative w-full max-w-md"
              >
              {/* Mehrschichtiger Glow-Effekt */}
              <motion.div 
                className="absolute -inset-4 rounded-3xl opacity-50"
                style={{
                  background: 'conic-gradient(from 180deg, hsl(151, 60%, 35%), hsl(151, 40%, 25%), hsl(151, 50%, 30%), hsl(151, 45%, 28%), hsl(151, 60%, 35%))',
                  filter: 'blur(30px)',
                }}
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-[hsl(151,50%,40%)] via-[hsl(151,40%,30%)] to-[hsl(151,50%,40%)] rounded-3xl blur-2xl"
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.03, 1],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              
              {/* Die Box selbst - mit Glassmorphism */}
              <div className="relative rounded-2xl border border-[hsl(151,40%,50%)]/20 bg-[#0a0a0b]/90 backdrop-blur-xl p-8 shadow-2xl shadow-[hsl(151,40%,20%)]/30">
                
                {/* Header mit Logo */}
                <motion.div 
                  className="relative space-y-4 text-center mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Lock Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div 
                      className="relative"
                      animate={countdown !== null ? { rotateY: 180, scale: 1.1 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
                        <Lock className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* NICNOA&CO.online Logo - wie im Header */}
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">
                      <span className="text-foreground">NICNOA</span>
                      <span className="text-primary">&CO</span>
                      <span className="text-primary">.online</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Session-geschützter Preview-Zugang
                    </p>
                  </div>
                </motion.div>

                {/* Countdown Display */}
                <AnimatePresence mode="wait">
                  {countdown !== null ? (
                    <motion.div
                      key="countdown"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="relative"
                      >
                        <span className="text-8xl font-black text-primary">
                          {countdown === 0 ? '✓' : countdown}
                        </span>
                        {countdown > 0 && (
                          <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <span className="text-8xl font-black text-primary/30">
                              {countdown}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                      <p className="mt-4 text-muted-foreground text-sm">
                        {countdown === 0 ? 'Willkommen!' : 'Zugang wird freigeschaltet...'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      onSubmit={handleSubmit} 
                      className="space-y-6"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <motion.div 
                        className="space-y-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="relative">
                          <Input
                            ref={inputRef}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Session-Passwort eingeben..."
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setError(false)
                            }}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            className={`
                              h-14 pl-4 pr-12 text-lg
                              bg-background/50 border-border 
                              text-foreground placeholder:text-muted-foreground/50
                              focus:border-primary/50 focus:ring-2 focus:ring-primary/20
                              transition-all duration-300
                              ${error ? 'border-destructive/50' : ''}
                            `}
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Caps Lock Warnung */}
                        <AnimatePresence>
                          {capsLockOn && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Caps Lock ist aktiviert</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Fehler-Meldung */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Falsches Passwort. Bitte versuchen Sie es erneut.</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full h-14 text-lg font-semibold"
                          disabled={!password.trim()}
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Zugang freischalten
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Footer */}
                {countdown === null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-8 h-px bg-border" />
                      <Lock className="w-3 h-3" />
                      <span>Session-basierte Authentifizierung</span>
                      <div className="w-8 h-px bg-border" />
                    </div>
                    
                    {/* Impressum Link */}
                    <button
                      type="button"
                      onClick={loadImpressum}
                      disabled={impressumLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {impressumLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span>Impressum</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
            )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        /* Unlock Animation - Explodierender Effekt */
        <motion.div
          key="unlock-animation"
          className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
        >
          {/* Hintergrund fadeout mit Burst */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Radiale Expansion */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: '300vmax', height: '300vmax', opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                background: 'radial-gradient(circle, hsl(151, 60%, 40%) 0%, hsl(151, 50%, 20%) 30%, transparent 70%)',
              }}
            />
            
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(151, 40%, 10%) 0%, #020203 70%)',
              }}
            />
          </motion.div>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-md"
            >
              {/* Burst-Glow */}
              <motion.div 
                className="absolute inset-0 rounded-3xl"
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: 0,
                  scale: 3,
                }}
                transition={{ duration: 0.8 }}
                style={{
                  background: 'radial-gradient(circle, hsl(151, 60%, 50%) 0%, transparent 60%)',
                  filter: 'blur(40px)',
                }}
              />
              <div className="relative rounded-2xl border border-primary/30 bg-[#0a0a0b]/90 backdrop-blur-xl p-8 shadow-2xl">
                <div className="text-center">
                  <motion.div 
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.3, 1.1], rotate: [0, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg shadow-primary/30">
                      <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Willkommen!
                  </h2>
                  <p className="text-primary font-medium">
                    Zugang gewährt
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}
