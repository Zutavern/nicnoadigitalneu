'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Loader2, 
  Sparkles,
  Building2,
  Shield,
  FileCheck,
  Signature,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Phone,
  BookOpen,
  CreditCard,
  Tag,
  User,
  X,
  FileText,
  Clock,
  Check,
  Info,
  HelpCircle,
  MapPin
} from 'lucide-react'
import { FileUploader } from '@/components/ui/file-uploader'

type ComplianceAnswer = 'yes' | 'no' | 'pending' | null

interface OnboardingConfig {
  ownPhoneInfo: string
  ownAppointmentBookInfo: string
  ownCashRegisterInfo: string
  ownPriceListInfo: string
  ownBrandingInfo: string
  masterCertificateInfo: string
  businessRegistrationInfo: string
  liabilityInsuranceInfo: string
  statusDeterminationInfo: string
  craftsChamberInfo: string
  step1Title: string
  step1Description: string
  step2Title: string
  step2Description: string
  step3Title: string
  step3Description: string
  step4Title: string
  step4Description: string
}

type DocumentKey = 
  | 'masterCertificate'
  | 'businessRegistration'
  | 'liabilityInsurance'
  | 'statusDetermination'
  | 'craftsChamber'

type DocumentStatus = 'pending' | 'uploaded' | 'approved' | 'rejected'

interface DocumentSlot {
  key: DocumentKey
  label: string
  description: string
  helpLink?: string
  helpText?: string
  required: boolean
}

interface ComplianceItem {
  key: string
  label: string
  icon: React.ElementType
  description: string
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { 
    key: 'ownPhone', 
    label: 'Ich nutze mein eigenes Telefon.', 
    icon: Phone,
    description: 'Für die eigenständige Kundenkommunikation'
  },
  { 
    key: 'ownAppointmentBook', 
    label: 'Ich führe ein eigenes Terminbuch und koordiniere Termine selbst.', 
    icon: BookOpen,
    description: 'Selbstständige Terminplanung ohne Weisungsbindung'
  },
  { 
    key: 'ownCashRegister', 
    label: 'Ich nutze meine eigene Kasse und mein eigenes EC-Terminal.', 
    icon: CreditCard,
    description: 'Eigenständige Abrechnung mit Kunden'
  },
  { 
    key: 'ownPriceList', 
    label: 'Ich habe meine eigene Preisliste und bestimme meine Preise selbst.', 
    icon: Tag,
    description: 'Freie Preisgestaltung ohne Vorgaben'
  },
  { 
    key: 'ownBranding', 
    label: 'Ich trete unter meinem eigenen Namen/Logo auf.', 
    icon: User,
    description: 'Eigene Markenidentität'
  },
]

const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    key: 'masterCertificate',
    label: 'Meisterbrief / Ausnahmebewilligung',
    description: 'Bitte lade deinen Meisterbrief hoch (Pflicht für Handwerksrolleneintrag).',
    required: true,
  },
  {
    key: 'businessRegistration',
    label: 'Gewerbeanmeldung',
    description: 'Deinen Nachweis vom Gewerbeamt.',
    required: true,
  },
  {
    key: 'liabilityInsurance',
    label: 'Betriebshaftpflichtversicherung',
    description: 'Kopie deiner Police (Deckungsnachweis).',
    required: true,
  },
  {
    key: 'statusDetermination',
    label: 'Statusfeststellung (V027)',
    description: 'Bestätigung der Rentenversicherung oder Antragskopie.',
    helpLink: 'https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Dienste/online-dienste_node.html',
    helpText: 'Noch kein Antrag gestellt? Hier geht\'s zum Online-Antrag der Deutschen Rentenversicherung.',
    required: true,
  },
  {
    key: 'craftsChamber',
    label: 'Eintragung Handwerkskammer',
    description: 'Bestätigung der Eintragung in die Handwerksrolle.',
    required: true,
  },
]

const TOTAL_STEPS = 4

export default function StylistOnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [complianceError, setComplianceError] = useState(false)
  
  // CMS Config für Info-Texte
  const [config, setConfig] = useState<OnboardingConfig | null>(null)
  
  // PLZ Lookup State
  const [plzLoading, setPlzLoading] = useState(false)
  const [plzError, setPlzError] = useState('')
  const plzDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Step 1: Geschäftsdaten
  const [businessData, setBusinessData] = useState({
    companyName: '',
    taxId: '',
    vatId: '',
    businessStreet: '',
    businessCity: '',
    businessZipCode: '',
  })

  // Step 2: Compliance - erweitert mit yes/no/pending Antworten
  const [compliance, setCompliance] = useState<Record<string, ComplianceAnswer>>({
    ownPhone: null,
    ownAppointmentBook: null,
    ownCashRegister: null,
    ownPriceList: null,
    ownBranding: null,
  })

  // Step 3: Documents - erweitert mit notAvailable Flag
  const [documents, setDocuments] = useState<Record<DocumentKey, { 
    file: File | null
    status: DocumentStatus
    url?: string
    uploading?: boolean
    notAvailable?: boolean 
  }>>({
    masterCertificate: { file: null, status: 'pending' },
    businessRegistration: { file: null, status: 'pending' },
    liabilityInsurance: { file: null, status: 'pending' },
    statusDetermination: { file: null, status: 'pending' },
    craftsChamber: { file: null, status: 'pending' },
  })

  // Step 4: Declaration
  const [declaration, setDeclaration] = useState(false)
  
  // Load CMS Config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/onboarding/config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
      } catch (error) {
        console.error('Error loading onboarding config:', error)
      }
    }
    loadConfig()
  }, [])
  
  // PLZ Auto-Fill Function
  const lookupPLZ = useCallback(async (plz: string) => {
    if (plz.length !== 5 || !/^\d{5}$/.test(plz)) {
      return
    }
    
    setPlzLoading(true)
    setPlzError('')
    
    try {
      const res = await fetch(`/api/lookup/plz?plz=${plz}`)
      const data = await res.json()
      
      if (data.found && data.city) {
        setBusinessData(prev => ({
          ...prev,
          businessCity: data.city,
        }))
      } else if (data.error) {
        setPlzError(data.error)
      }
    } catch (error) {
      console.error('PLZ lookup error:', error)
    } finally {
      setPlzLoading(false)
    }
  }, [])
  
  // PLZ Change Handler with Debounce
  const handlePlzChange = (value: string) => {
    // Only allow digits
    const cleanValue = value.replace(/\D/g, '').slice(0, 5)
    setBusinessData(prev => ({ ...prev, businessZipCode: cleanValue }))
    setPlzError('')
    
    // Clear previous timeout
    if (plzDebounceRef.current) {
      clearTimeout(plzDebounceRef.current)
    }
    
    // Debounce PLZ lookup
    if (cleanValue.length === 5) {
      plzDebounceRef.current = setTimeout(() => {
        lookupPLZ(cleanValue)
      }, 300)
    } else {
      // Clear city if PLZ is incomplete
      setBusinessData(prev => ({ ...prev, businessCity: '' }))
    }
  }

  // Auth check - nur unauthentifizierte Nutzer weiterleiten
  // Compliance-Onboarding ist für alle eingeloggten Stylisten zugänglich,
  // die ihre Compliance noch nicht abgeschlossen haben
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    // Wir prüfen NICHT mehr auf onboardingCompleted, da dieses Onboarding
    // das zweite (Compliance) ist und unabhängig vom Basis-Onboarding ist
  }, [status, router])

  // Compliance ist erfüllt wenn alle "yes" haben
  const allComplianceChecked = Object.values(compliance).every(v => v === 'yes')
  // Alle Compliance-Fragen müssen beantwortet sein (nicht null)
  const allComplianceAnswered = Object.values(compliance).every(v => v !== null)
  // Dokumente sind ok wenn entweder hochgeladen oder als "nicht verfügbar" markiert
  const allDocumentsHandled = Object.values(documents).every(d => 
    d.url !== undefined || d.status === 'uploaded' || d.notAvailable === true
  )

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return businessData.companyName && businessData.businessStreet && businessData.businessCity && businessData.businessZipCode
      case 2:
        // Alle müssen beantwortet UND alle müssen "yes" sein
        return allComplianceAnswered && allComplianceChecked
      case 3:
        return allDocumentsHandled
      case 4:
        return declaration
      default:
        return false
    }
  }, [currentStep, businessData, allComplianceAnswered, allComplianceChecked, allDocumentsHandled, declaration])

  const handleComplianceAnswer = (key: string, answer: ComplianceAnswer) => {
    setCompliance(prev => ({ ...prev, [key]: answer }))
    setComplianceError(false)
  }
  
  const handleDocumentNotAvailable = (key: DocumentKey, notAvailable: boolean) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        notAvailable,
        // Wenn "nicht verfügbar" gewählt, lösche ggf. vorhandene Datei
        ...(notAvailable ? { file: null, url: undefined, status: 'pending' as DocumentStatus } : {})
      }
    }))
  }

  // Wird aufgerufen wenn eine Datei ausgewählt wird (vor dem Upload)
  const handleFileSelect = (key: DocumentKey, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { file, status: 'pending' as DocumentStatus, uploading: true }
    }))
  }

  // Wird aufgerufen nach erfolgreichem Upload
  const handleUploadComplete = (key: DocumentKey, response: { url: string; fileName: string }) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'uploaded' as DocumentStatus, url: response.url, uploading: false }
    }))
  }

  const handleRemoveFile = (key: DocumentKey) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { file: null, status: 'pending' as DocumentStatus, url: undefined, uploading: false }
    }))
  }

  const handleNext = async () => {
    // Validierung prüfen
    if (!canProceed()) {
      if (currentStep === 2) {
        setComplianceError(true)
      }
      return
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setFormError('')

    try {
      // Dokumente sind bereits hochgeladen - sammle URLs und "nicht verfügbar" Flags
      const documentUrls: Record<string, string> = {}
      const documentNotAvailable: Record<string, boolean> = {}
      
      for (const [key, doc] of Object.entries(documents)) {
        if (doc.url) {
          documentUrls[key] = doc.url
        }
        if (doc.notAvailable) {
          documentNotAvailable[key] = true
        }
      }

      // Save all onboarding data
      const response = await fetch('/api/onboarding/stylist/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessData,
          compliance, // Enthält jetzt "yes"/"no"/"pending" Antworten
          documentUrls,
          documentNotAvailable,
          declaration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ein Fehler ist aufgetreten')
      }

      // Update session
      await update({ onboardingCompleted: true })
      
      router.push('/stylist?onboarding=complete')
      router.refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-2xl opacity-20 rounded-full" />
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500 relative z-10" />
          </div>
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </motion.div>
      </div>
    )
  }

  const stepInfo = [
    { number: 1, title: 'Geschäftsdaten', icon: Building2 },
    { number: 2, title: 'Compliance', icon: Shield },
    { number: 3, title: 'Dokumente', icon: FileCheck },
    { number: 4, title: 'Abschluss', icon: Signature },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[128px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />
      </div>

      <div className="container max-w-4xl py-8 md:py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Einrichtungs-Assistent</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
            Willkommen bei NICNOA&CO.online
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lass uns dein Business starten. In nur wenigen Schritten bist du startklar.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepInfo.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isComplete = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive ? '0 0 30px rgba(16, 185, 129, 0.4)' : 'none'
                      }}
                      className={`
                        relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
                        transition-all duration-300
                        ${isComplete 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                          : isActive 
                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500' 
                            : 'bg-white/5 border border-white/10'}
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : (
                        <Icon className={`h-5 w-5 md:h-6 md:w-6 ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      )}
                    </motion.div>
                    <span className={`
                      mt-2 text-xs md:text-sm font-medium hidden md:block
                      ${isActive ? 'text-emerald-400' : isComplete ? 'text-white' : 'text-muted-foreground'}
                    `}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < stepInfo.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 md:mx-4 relative overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isComplete ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{formError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative bg-[#12121a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {/* Step 1: Geschäftsdaten */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Deine Geschäftsdaten</h2>
                      <p className="text-muted-foreground">Diese Daten benötigen wir für die Rechnungsstellung</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-white">Firmenname / Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="z.B. Hair by Max Mustermann"
                        value={businessData.companyName}
                        onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="taxId" className="text-white">Steuernummer</Label>
                        <Input
                          id="taxId"
                          placeholder="z.B. 12/345/67890"
                          value={businessData.taxId}
                          onChange={(e) => setBusinessData({ ...businessData, taxId: e.target.value })}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vatId" className="text-white">USt-IdNr. (optional)</Label>
                        <Input
                          id="vatId"
                          placeholder="z.B. DE123456789"
                          value={businessData.vatId}
                          onChange={(e) => setBusinessData({ ...businessData, vatId: e.target.value })}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessStreet" className="text-white">Geschäftsadresse *</Label>
                      <Input
                        id="businessStreet"
                        placeholder="Straße und Hausnummer"
                        value={businessData.businessStreet}
                        onChange={(e) => setBusinessData({ ...businessData, businessStreet: e.target.value })}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="businessZipCode" className="text-white">PLZ *</Label>
                        <div className="relative">
                          <Input
                            id="businessZipCode"
                            placeholder="z.B. 10115"
                            value={businessData.businessZipCode}
                            onChange={(e) => handlePlzChange(e.target.value)}
                            maxLength={5}
                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                          />
                          {plzLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                            </div>
                          )}
                        </div>
                        {plzError && (
                          <p className="text-xs text-red-400 mt-1">{plzError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessCity" className="text-white flex items-center gap-2">
                          Stadt *
                          {businessData.businessCity && businessData.businessZipCode.length === 5 && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <MapPin className="h-3 w-3" />
                              automatisch ermittelt
                            </span>
                          )}
                        </Label>
                        <Input
                          id="businessCity"
                          placeholder="z.B. Berlin"
                          value={businessData.businessCity}
                          onChange={(e) => setBusinessData({ ...businessData, businessCity: e.target.value })}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Compliance Check */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {config?.step2Title || 'Selbstständigkeits-Check'}
                      </h2>
                      <p className="text-muted-foreground">
                        {config?.step2Description || 'Diese Kriterien dokumentieren deine Selbstständigkeit'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-200">
                        <p className="font-medium mb-1">Warum ist das wichtig?</p>
                        <p className="text-amber-200/70">
                          Diese Punkte dokumentieren deine Selbstständigkeit und schützen sowohl dich als auch den Salonbetreiber vor dem Risiko der Scheinselbstständigkeit.
                        </p>
                      </div>
                    </div>
                  </div>

                  <TooltipProvider>
                    <div className="space-y-4">
                      {COMPLIANCE_ITEMS.map((item, index) => {
                        const Icon = item.icon
                        const answer = compliance[item.key]
                        const infoKey = `${item.key}Info` as keyof OnboardingConfig
                        const infoText = config?.[infoKey] || item.description
                        
                        return (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                              p-4 md:p-5 rounded-2xl border transition-all duration-300
                              ${answer === 'yes' 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : answer === 'no'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : 'bg-white/5 border-white/10'}
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <Icon className={`h-6 w-6 flex-shrink-0 mt-1 ${
                                answer === 'yes' ? 'text-emerald-400' : 
                                answer === 'no' ? 'text-red-400' : 'text-muted-foreground'
                              }`} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`font-medium ${
                                    answer === 'yes' ? 'text-white' : 
                                    answer === 'no' ? 'text-red-200' : 'text-white/80'
                                  }`}>
                                    {item.label}
                                  </span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-white" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs bg-[#1a1a2e] border-white/10 text-white">
                                      <p className="text-sm">{infoText}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                                
                                {/* Ja / Nein / Noch nicht Buttons */}
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={answer === 'yes' ? 'default' : 'outline'}
                                    onClick={() => handleComplianceAnswer(item.key, 'yes')}
                                    className={`${
                                      answer === 'yes' 
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                                        : 'border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                                    }`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Ja
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={answer === 'no' ? 'default' : 'outline'}
                                    onClick={() => handleComplianceAnswer(item.key, 'no')}
                                    className={`${
                                      answer === 'no' 
                                        ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                                        : 'border-white/20 hover:border-red-500/50 hover:bg-red-500/10'
                                    }`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Nein
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={answer === 'pending' ? 'default' : 'outline'}
                                    onClick={() => handleComplianceAnswer(item.key, 'pending')}
                                    className={`${
                                      answer === 'pending' 
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' 
                                        : 'border-white/20 hover:border-amber-500/50 hover:bg-amber-500/10'
                                    }`}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    In Arbeit
                                  </Button>
                                </div>
                                
                                {/* Warnung bei "Nein" */}
                                {answer === 'no' && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                  >
                                    <p className="text-xs text-red-300">
                                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                                      Dieses Kriterium muss erfüllt sein, um als selbstständig zu gelten.
                                    </p>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </TooltipProvider>

                  <AnimatePresence>
                    {complianceError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                      >
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-red-400 mb-1">Alle Kriterien müssen mit &quot;Ja&quot; beantwortet sein</p>
                            <p className="text-red-400/70">
                              Die Stuhlmiete setzt voraus, dass du alle oben genannten Kriterien erfüllst. 
                              Bitte bestätige jeden Punkt oder kontaktiere uns für weitere Informationen.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                      <FileCheck className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {config?.step3Title || 'Dokumente hochladen'}
                      </h2>
                      <p className="text-muted-foreground">
                        {config?.step3Description || 'Lade alle erforderlichen Nachweise hoch oder markiere, welche dir noch fehlen'}
                      </p>
                    </div>
                  </div>

                  <TooltipProvider>
                    <div className="space-y-4">
                      {DOCUMENT_SLOTS.map((slot, index) => {
                        const doc = documents[slot.key]
                        const hasFile = doc.url !== undefined || doc.status === 'uploaded'
                        const isNotAvailable = doc.notAvailable === true
                        const infoKey = `${slot.key}Info` as keyof OnboardingConfig
                        const infoText = config?.[infoKey] || slot.description
                        
                        return (
                          <motion.div
                            key={slot.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                              p-5 rounded-2xl border transition-all duration-300
                              ${hasFile 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : isNotAvailable
                                  ? 'bg-amber-500/10 border-amber-500/30'
                                  : 'bg-white/5 border-white/10'}
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                ${hasFile 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : isNotAvailable
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-white/10 text-muted-foreground'}
                              `}>
                                {hasFile ? <CheckCircle2 className="h-6 w-6" /> : 
                                 isNotAvailable ? <Clock className="h-6 w-6" /> : 
                                 <FileText className="h-6 w-6" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-white">{slot.label}</h3>
                                  {slot.required && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Pflicht</span>
                                  )}
                                  {/* Info Tooltip */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-white" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs bg-[#1a1a2e] border-white/10 text-white">
                                      <p className="text-sm">{infoText}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{slot.description}</p>
                                
                                {slot.helpLink && (
                                  <a
                                    href={slot.helpLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mb-3"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {slot.helpText || 'Weitere Informationen'}
                                  </a>
                                )}

                                {/* File Uploader - nur anzeigen wenn nicht "nicht verfügbar" */}
                                {!isNotAvailable && (
                                  <FileUploader
                                    value={doc.file || null}
                                    onFileSelect={(file) => handleFileSelect(slot.key, file)}
                                    onUpload={(response) => handleUploadComplete(slot.key, response as { url: string; fileName: string })}
                                    onRemove={() => handleRemoveFile(slot.key)}
                                    uploadEndpoint="/api/onboarding/documents/upload"
                                    uploadData={{ documentType: slot.key }}
                                    accept={{
                                      'application/pdf': ['.pdf'],
                                      'image/jpeg': ['.jpg', '.jpeg'],
                                      'image/png': ['.png'],
                                      'application/msword': ['.doc'],
                                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                    }}
                                    placeholder="Dokument hochladen"
                                    description="PDF, JPG, PNG, Word (max. 10MB)"
                                    autoUpload={true}
                                  />
                                )}
                                
                                {/* "Noch nicht vorhanden" Info wenn markiert */}
                                {isNotAvailable && (
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-sm text-amber-300 flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Du hast markiert, dass dieses Dokument dir noch nicht vorliegt. 
                                      Du kannst es später nachreichen.
                                    </p>
                                  </div>
                                )}
                                
                                {/* Checkbox "Dokument liegt mir noch nicht vor" */}
                                <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-white/10">
                                  <Checkbox
                                    id={`notAvailable-${slot.key}`}
                                    checked={isNotAvailable}
                                    onCheckedChange={(checked) => handleDocumentNotAvailable(slot.key, checked as boolean)}
                                    className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                  />
                                  <label
                                    htmlFor={`notAvailable-${slot.key}`}
                                    className="text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors"
                                  >
                                    Dokument liegt mir noch nicht vor
                                  </label>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </TooltipProvider>

                  {/* Upload Progress Summary */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Fortschritt</span>
                      <span className="text-sm font-medium text-white">
                        {Object.values(documents).filter(d => d.url || d.status === 'uploaded' || d.notAvailable).length} / {DOCUMENT_SLOTS.length}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(Object.values(documents).filter(d => d.url || d.status === 'uploaded' || d.notAvailable).length / DOCUMENT_SLOTS.length) * 100}%` 
                        }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Object.values(documents).filter(d => d.notAvailable).length > 0 && (
                        <span className="text-amber-400">
                          {Object.values(documents).filter(d => d.notAvailable).length} Dokument(e) zum Nachreichen markiert
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Summary & Declaration */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Signature className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Zusammenfassung & Abschluss</h2>
                      <p className="text-muted-foreground">Überprüfe deine Daten und schließe das Onboarding ab</p>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Business Data Summary */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-semibold text-white">Geschäftsdaten</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Firma:</span> <span className="text-white">{businessData.companyName}</span></p>
                        <p><span className="text-muted-foreground">Adresse:</span> <span className="text-white">{businessData.businessStreet}, {businessData.businessZipCode} {businessData.businessCity}</span></p>
                        {businessData.taxId && <p><span className="text-muted-foreground">Steuernr.:</span> <span className="text-white">{businessData.taxId}</span></p>}
                      </div>
                    </div>

                    {/* Compliance Summary */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-amber-400" />
                        <h3 className="font-semibold text-white">Compliance-Status</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Alle Kriterien erfüllt</span>
                      </div>
                    </div>

                    {/* Documents Summary */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <FileCheck className="h-5 w-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Dokumente</h3>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {DOCUMENT_SLOTS.map(slot => {
                          const doc = documents[slot.key]
                          const hasFile = doc.url || doc.status === 'uploaded'
                          const isNotAvailable = doc.notAvailable === true
                          return (
                            <div key={slot.key} className="flex items-center gap-2 text-sm">
                              {hasFile ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : isNotAvailable ? (
                                <Clock className="h-4 w-4 text-amber-400" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={hasFile ? 'text-white' : isNotAvailable ? 'text-amber-300' : 'text-muted-foreground'}>
                                {slot.label}
                                {isNotAvailable && ' (wird nachgereicht)'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <button
                      onClick={() => setDeclaration(!declaration)}
                      className="flex items-start gap-4 w-full text-left"
                    >
                      <div className={`
                        w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5
                        ${declaration 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/10 border border-white/20'}
                      `}>
                        {declaration && <Check className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Rechtliche Erklärung</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Hiermit erkläre ich, dass ich nicht weisungsgebunden arbeite und ausschließlich auf eigene Rechnung handele. 
                          Ich bestätige, dass alle angegebenen Informationen wahrheitsgemäß sind und die hochgeladenen Dokumente aktuell und gültig sind.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-400 mb-1">Was passiert als nächstes?</p>
                        <p className="text-blue-400/70">
                          Nach dem Abschluss werden deine Dokumente von unserem Team geprüft. 
                          Du erhältst eine Benachrichtigung, sobald alles bestätigt ist – in der Regel innerhalb von 24-48 Stunden.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-6"
                >
                  Weiter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird abgeschlossen...
                    </>
                  ) : (
                    <>
                      <Signature className="mr-2 h-4 w-4" />
                      Onboarding abschließen
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Schritt {currentStep} von {TOTAL_STEPS} • Dein Fortschritt wird automatisch gespeichert
          </p>
        </motion.div>
      </div>
    </div>
  )
}

