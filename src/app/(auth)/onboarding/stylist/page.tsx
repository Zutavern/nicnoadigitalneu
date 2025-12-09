'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Upload,
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
  Info
} from 'lucide-react'

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

  // Step 1: Geschäftsdaten
  const [businessData, setBusinessData] = useState({
    companyName: '',
    taxId: '',
    vatId: '',
    businessStreet: '',
    businessCity: '',
    businessZipCode: '',
  })

  // Step 2: Compliance
  const [compliance, setCompliance] = useState<Record<string, boolean>>({
    ownPhone: false,
    ownAppointmentBook: false,
    ownCashRegister: false,
    ownPriceList: false,
    ownBranding: false,
  })

  // Step 3: Documents
  const [documents, setDocuments] = useState<Record<DocumentKey, { file: File | null; status: DocumentStatus; url?: string }>>({
    masterCertificate: { file: null, status: 'pending' },
    businessRegistration: { file: null, status: 'pending' },
    liabilityInsurance: { file: null, status: 'pending' },
    statusDetermination: { file: null, status: 'pending' },
    craftsChamber: { file: null, status: 'pending' },
  })

  // Step 4: Declaration
  const [declaration, setDeclaration] = useState(false)

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

  const allComplianceChecked = Object.values(compliance).every(Boolean)
  const allDocumentsUploaded = Object.values(documents).every(d => d.file !== null || d.status === 'uploaded')

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return businessData.companyName && businessData.businessStreet && businessData.businessCity && businessData.businessZipCode
      case 2:
        return allComplianceChecked
      case 3:
        return allDocumentsUploaded
      case 4:
        return declaration
      default:
        return false
    }
  }, [currentStep, businessData, allComplianceChecked, allDocumentsUploaded, declaration])

  const handleComplianceToggle = (key: string) => {
    setCompliance(prev => ({ ...prev, [key]: !prev[key] }))
    setComplianceError(false)
  }

  const handleFileUpload = async (key: DocumentKey, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], file, status: 'uploaded' as DocumentStatus }
    }))
  }

  const handleRemoveFile = (key: DocumentKey) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { file: null, status: 'pending' as DocumentStatus }
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
      // Upload documents
      const documentUrls: Record<string, string> = {}
      
      for (const [key, doc] of Object.entries(documents)) {
        if (doc.file) {
          const formData = new FormData()
          formData.append('file', doc.file)
          formData.append('documentType', key)
          
          const uploadRes = await fetch('/api/onboarding/documents/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!uploadRes.ok) {
            throw new Error(`Fehler beim Hochladen von ${key}`)
          }
          
          const { url } = await uploadRes.json()
          documentUrls[key] = url
        }
      }

      // Save all onboarding data
      const response = await fetch('/api/onboarding/stylist/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessData,
          compliance,
          documentUrls,
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
                        <Input
                          id="businessZipCode"
                          placeholder="z.B. 10115"
                          value={businessData.businessZipCode}
                          onChange={(e) => setBusinessData({ ...businessData, businessZipCode: e.target.value })}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessCity" className="text-white">Stadt *</Label>
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
                      <h2 className="text-2xl font-bold text-white">Selbstständigkeits-Check</h2>
                      <p className="text-muted-foreground">Wichtig: Diese Kriterien müssen für die Stuhlmiete erfüllt sein</p>
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

                  <div className="space-y-4">
                    {COMPLIANCE_ITEMS.map((item, index) => {
                      const Icon = item.icon
                      const isChecked = compliance[item.key]
                      
                      return (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => handleComplianceToggle(item.key)}
                            className={`
                              w-full p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left
                              ${isChecked 
                                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`
                                w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300
                                ${isChecked 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-white/10 border border-white/20'}
                              `}>
                                {isChecked && <Check className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <Icon className={`h-5 w-5 ${isChecked ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                                  <span className={`font-medium ${isChecked ? 'text-white' : 'text-white/80'}`}>
                                    {item.label}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-8">{item.description}</p>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>

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
                            <p className="font-medium text-red-400 mb-1">Alle Kriterien müssen erfüllt sein</p>
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
                      <h2 className="text-2xl font-bold text-white">Dokumente hochladen</h2>
                      <p className="text-muted-foreground">Lade alle erforderlichen Nachweise hoch</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {DOCUMENT_SLOTS.map((slot, index) => {
                      const doc = documents[slot.key]
                      const hasFile = doc.file !== null || doc.status === 'uploaded'
                      
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
                              : 'bg-white/5 border-white/10'}
                          `}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              ${hasFile 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-white/10 text-muted-foreground'}
                            `}>
                              {hasFile ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">{slot.label}</h3>
                                {slot.required && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Pflicht</span>
                                )}
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

                              {hasFile ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium truncate max-w-[200px]">
                                      {doc.file?.name || 'Hochgeladen'}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFile(slot.key)}
                                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-200">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-white">Datei auswählen</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleFileUpload(slot.key, file)
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Upload Progress Summary */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Upload-Fortschritt</span>
                      <span className="text-sm font-medium text-white">
                        {Object.values(documents).filter(d => d.file || d.status === 'uploaded').length} / {DOCUMENT_SLOTS.length}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(Object.values(documents).filter(d => d.file || d.status === 'uploaded').length / DOCUMENT_SLOTS.length) * 100}%` 
                        }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      />
                    </div>
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
                        <h3 className="font-semibold text-white">Hochgeladene Dokumente</h3>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {DOCUMENT_SLOTS.map(slot => {
                          const hasFile = documents[slot.key].file || documents[slot.key].status === 'uploaded'
                          return (
                            <div key={slot.key} className="flex items-center gap-2 text-sm">
                              {hasFile ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={hasFile ? 'text-white' : 'text-muted-foreground'}>{slot.label}</span>
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

