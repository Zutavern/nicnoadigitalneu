'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Loader2, 
  Sparkles,
  Building2,
  Shield,
  FileCheck,
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
  MapPin,
  Lightbulb,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import { FileUploader } from '@/components/ui/file-uploader'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import Link from 'next/link'

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
  infoText: string
  helpLink?: string
  helpText?: string
  required: boolean
}

interface ComplianceItem {
  key: string
  label: string
  icon: React.ElementType
  description: string
  infoText: string
  helpTip: string
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { 
    key: 'ownPhone', 
    label: 'Ich nutze mein eigenes Telefon.', 
    icon: Phone,
    description: 'Für die eigenständige Kundenkommunikation',
    infoText: 'Ein eigenes Telefon für geschäftliche Zwecke ist ein wichtiges Merkmal der Selbstständigkeit.',
    helpTip: 'Geh zu einem Telefonanbieter deiner Wahl und buche einen günstigen Tarif.'
  },
  { 
    key: 'ownAppointmentBook', 
    label: 'Ich führe ein eigenes Terminbuch.', 
    icon: BookOpen,
    description: 'Selbstständige Terminplanung',
    infoText: 'Die eigenständige Terminplanung ohne Weisungsbindung ist essentiell.',
    helpTip: 'Als NICNOA Online Kunde hast du Zugang zu unserer integrierten Terminverwaltung.'
  },
  { 
    key: 'ownCashRegister', 
    label: 'Ich nutze meine eigene Kasse.', 
    icon: CreditCard,
    description: 'Eigenständige Abrechnung mit Kunden',
    infoText: 'Eine eigene Kasse und ein eigenes EC-Terminal zeigen, dass du deine Einnahmen selbst verwaltest.',
    helpTip: 'Wir empfehlen Zettle – günstig, einfach und voll kompatibel mit NICNOA Online.'
  },
  { 
    key: 'ownPriceList', 
    label: 'Ich bestimme meine Preise selbst.', 
    icon: Tag,
    description: 'Freie Preisgestaltung',
    infoText: 'Die freie Preisgestaltung ist ein Kernmerkmal der Selbstständigkeit.',
    helpTip: 'Mit unserem Preislisten-Generator erstellst du in Minuten eine professionelle Preisliste.'
  },
  { 
    key: 'ownBranding', 
    label: 'Ich trete unter meinem eigenen Namen auf.', 
    icon: User,
    description: 'Eigene Markenidentität',
    infoText: 'Ein eigener Markenauftritt zeigt deine unternehmerische Eigenständigkeit.',
    helpTip: 'Nutze unsere Brand- und Marketing-Tools, um ein Logo zu erstellen.'
  },
]

const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    key: 'masterCertificate',
    label: 'Meisterbrief / Ausnahmebewilligung',
    description: 'Nachweis der fachlichen Qualifikation',
    infoText: 'Der Meisterbrief oder eine Ausnahmebewilligung ist die Grundlage für deine selbstständige Tätigkeit.',
    helpLink: 'https://www.hwk-muenchen.de/artikel/ausnahmebewilligung',
    helpText: 'So beantragst du eine Ausnahmebewilligung',
    required: true,
  },
  {
    key: 'businessRegistration',
    label: 'Gewerbeanmeldung',
    description: 'Offizieller Nachweis deines Gewerbes',
    infoText: 'Die Gewerbeanmeldung ist der offizielle Startschuss für dein Unternehmen.',
    helpLink: 'https://www.gewerbe-anmelden.info',
    helpText: 'So meldest du dein Gewerbe an',
    required: true,
  },
  {
    key: 'liabilityInsurance',
    label: 'Betriebshaftpflichtversicherung',
    description: 'Nachweis über den Versicherungsschutz',
    infoText: 'Die Betriebshaftpflichtversicherung schützt dich vor Schadensersatzansprüchen.',
    helpLink: 'https://www.check24.de/berufshaftpflicht',
    helpText: 'Versicherungen vergleichen',
    required: true,
  },
  {
    key: 'statusDetermination',
    label: 'Statusfeststellung (V027)',
    description: 'Bestätigung deines Selbstständigkeitsstatus',
    infoText: 'Die Statusfeststellung bestätigt offiziell, dass du selbstständig tätig bist.',
    helpLink: 'https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2023/230927_statusfeststellung.html',
    helpText: 'Mehr zur Statusfeststellung',
    required: true,
  },
  {
    key: 'craftsChamber',
    label: 'Eintragung Handwerkskammer',
    description: 'Nachweis der Handwerkskammer-Mitgliedschaft',
    infoText: 'Die Eintragung in die Handwerkskammer ist für alle Handwerker Pflicht.',
    helpLink: 'https://www.hwk.de',
    helpText: 'Zur Handwerkskammer',
    required: true,
  },
]

// Tipps für Compliance-Items
const COMPLIANCE_TIPS: Record<string, {
  icon: React.ElementType
  color: string
  needsHelp: {
    title: string
    description: string
    tips: string[]
    cta: { label: string; href: string; external: boolean }
  }
}> = {
  ownPhone: {
    icon: Phone,
    color: 'blue',
    needsHelp: {
      title: 'Eigenes Geschäftstelefon',
      description: 'Ein eigenes Telefon ist wichtig für die eigenständige Kundenkommunikation.',
      tips: [
        'Hol dir eine separate Geschäftsnummer – viele Anbieter bieten günstige Tarife ab 5€/Monat',
        'Nutze eine Dual-SIM-Funktion, um privat und geschäftlich zu trennen',
        'Eine professionelle Mailbox-Ansage wirkt seriös'
      ],
      cta: { label: 'Tarif finden', href: 'https://www.check24.de/handytarife/', external: true }
    }
  },
  ownAppointmentBook: {
    icon: BookOpen,
    color: 'purple',
    needsHelp: {
      title: 'Eigene Terminverwaltung',
      description: 'Eine unabhängige Terminplanung zeigt deine Selbstständigkeit.',
      tips: [
        'Mit NICNOA Online hast du eine integrierte Terminverwaltung – nutze sie!',
        'Kunden können direkt über dein Profil buchen',
        'Du bestimmst selbst deine verfügbaren Zeiten'
      ],
      cta: { label: 'Termine einrichten', href: '/stylist/calendar', external: false }
    }
  },
  ownCashRegister: {
    icon: CreditCard,
    color: 'emerald',
    needsHelp: {
      title: 'Eigene Kasse & Abrechnung',
      description: 'Eine eigene Kasse ist essenziell für die Selbstständigkeit.',
      tips: [
        'Zettle bietet günstige EC-Terminals ab 29€ – ideal für Starter',
        'SumUp ist eine gute Alternative mit flexiblen Tarifen',
        'Die Kassenbon-Pflicht gilt auch für dich – digitale Lösungen helfen dabei'
      ],
      cta: { label: 'Zettle entdecken', href: 'https://www.zettle.com/de', external: true }
    }
  },
  ownPriceList: {
    icon: Tag,
    color: 'amber',
    needsHelp: {
      title: 'Eigene Preisgestaltung',
      description: 'Freie Preissetzung ist ein Kernmerkmal der Selbstständigkeit.',
      tips: [
        'Analysiere die Preise in deiner Region und positioniere dich',
        'Erstelle eine professionelle Preisliste für dein Profil',
        'Du kannst Preise jederzeit anpassen – teste verschiedene Strategien'
      ],
      cta: { label: 'Preisliste erstellen', href: '/stylist/services', external: false }
    }
  },
  ownBranding: {
    icon: User,
    color: 'pink',
    needsHelp: {
      title: 'Eigener Markenauftritt',
      description: 'Dein eigener Name und Stil zeigen Kunden, wer du bist.',
      tips: [
        'Ein professionelles Profilbild macht einen guten ersten Eindruck',
        'Nutze einen einheitlichen Stil für dein Logo und Marketing',
        'Visitenkarten und Social Media vervollständigen deinen Auftritt'
      ],
      cta: { label: 'Profil bearbeiten', href: '/stylist/profile', external: false }
    }
  },
}

// Tipps für fehlende Dokumente
const DOCUMENT_TIPS: Record<string, {
  title: string
  tips: string[]
}> = {
  masterCertificate: {
    title: 'Meisterbrief / Ausnahmebewilligung',
    tips: [
      'Bei der Handwerkskammer beantragen',
      'Ausnahmebewilligung möglich mit Berufserfahrung',
      'Bearbeitungszeit: ca. 4-6 Wochen'
    ]
  },
  businessRegistration: {
    title: 'Gewerbeanmeldung',
    tips: [
      'Beim Gewerbeamt der Stadt beantragen',
      'Kosten: ca. 15-65€ je nach Stadt',
      'Oft auch online möglich'
    ]
  },
  liabilityInsurance: {
    title: 'Betriebshaftpflicht',
    tips: [
      'Vergleich über Check24 oder Verivox',
      'Friseur-spezifische Policen ab ca. 100€/Jahr',
      'Versicherungsbestätigung sofort nach Abschluss'
    ]
  },
  statusDetermination: {
    title: 'Statusfeststellung (V027)',
    tips: [
      'Bei der Deutschen Rentenversicherung beantragen',
      'Formular V027 ausfüllen',
      'Bearbeitungszeit: ca. 3 Monate'
    ]
  },
  craftsChamber: {
    title: 'Handwerkskammer-Eintragung',
    tips: [
      'Automatisch nach Gewerbeanmeldung',
      'Bestätigung kommt per Post',
      'Bei Verzögerung direkt nachfragen'
    ]
  },
}

interface StylistOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function StylistOnboardingDialog({ open, onOpenChange, onComplete }: StylistOnboardingDialogProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [complianceError, setComplianceError] = useState(false)
  
  const TOTAL_STEPS = 4

  // Analyse State
  const [analysisPhase, setAnalysisPhase] = useState<'idle' | 'analyzing' | 'complete'>('idle')
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Business Data State
  const [businessData, setBusinessData] = useState({
    companyName: '',
    taxId: '',
    vatId: '',
    businessStreet: '',
    businessCity: '',
    businessZipCode: '',
  })

  // Compliance State
  const [compliance, setCompliance] = useState<Record<string, ComplianceAnswer>>({
    ownPhone: null,
    ownAppointmentBook: null,
    ownCashRegister: null,
    ownPriceList: null,
    ownBranding: null,
  })

  // Documents State
  const [documents, setDocuments] = useState<Record<DocumentKey, {
    file?: File
    url?: string
    status: DocumentStatus
    notAvailable?: boolean
  }>>({
    masterCertificate: { status: 'pending' },
    businessRegistration: { status: 'pending' },
    liabilityInsurance: { status: 'pending' },
    statusDetermination: { status: 'pending' },
    craftsChamber: { status: 'pending' },
  })

  // PLZ Lookup
  const [plzLoading, setPlzLoading] = useState(false)
  const plzDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const lookupPLZ = async (plz: string) => {
    if (plz.length !== 5) return
    setPlzLoading(true)
    try {
      const response = await fetch(`https://openplzapi.org/de/Localities?postalCode=${plz}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setBusinessData(prev => ({
            ...prev,
            businessCity: data[0].name || ''
          }))
        }
      }
    } catch (error) {
      console.error('PLZ lookup failed:', error)
    } finally {
      setPlzLoading(false)
    }
  }

  const handlePLZChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 5)
    setBusinessData(prev => ({ ...prev, businessZipCode: cleanValue }))
    
    if (plzDebounceRef.current) {
      clearTimeout(plzDebounceRef.current)
    }
    
    if (cleanValue.length === 5) {
      plzDebounceRef.current = setTimeout(() => {
        lookupPLZ(cleanValue)
      }, 300)
    } else {
      setBusinessData(prev => ({ ...prev, businessCity: '' }))
    }
  }

  // Load existing data
  useEffect(() => {
    if (open && session?.user?.id) {
      loadExistingData()
      // Reset analysis when dialog opens
      setAnalysisPhase('idle')
      setAnalysisProgress(0)
    }
  }, [open, session?.user?.id])

  const loadExistingData = async () => {
    try {
      const res = await fetch('/api/onboarding/stylist/status')
      if (res.ok) {
        const data = await res.json()
        if (data.exists) {
          // Load business data
          if (data.businessData) {
            setBusinessData(prev => ({
              ...prev,
              companyName: data.businessData.companyName || '',
              taxId: data.businessData.taxId || '',
              vatId: data.businessData.vatId || '',
              businessStreet: data.businessData.businessStreet || '',
              businessCity: data.businessData.businessCity || '',
              businessZipCode: data.businessData.businessZipCode || '',
            }))
          }
          // Load compliance answers
          if (data.compliance) {
            setCompliance(data.compliance)
          }
          // Load documents
          if (data.documents) {
            const docs: Record<string, { url?: string; status: DocumentStatus; notAvailable?: boolean }> = {}
            for (const [key, doc] of Object.entries(data.documents as Record<string, { uploaded: boolean; notAvailable?: boolean; url?: string }>)) {
              docs[key] = {
                url: doc.url,
                status: doc.uploaded ? 'uploaded' : 'pending',
                notAvailable: doc.notAvailable,
              }
            }
            setDocuments(prev => ({ ...prev, ...docs }))
          }
          // Set current step (max 3, analysis is triggered separately)
          if (data.currentStep && data.currentStep > 0 && data.currentStep <= 3) {
            setCurrentStep(data.currentStep)
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error)
    }
  }

  // Compliance checks
  const allComplianceAnswered = Object.values(compliance).every(v => v !== null)
  const allDocumentsHandled = Object.values(documents).every(d => 
    d.url !== undefined || d.status === 'uploaded' || d.notAvailable === true
  )

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return businessData.companyName && businessData.businessStreet && businessData.businessCity && businessData.businessZipCode
      case 2:
        return allComplianceAnswered
      case 3:
        return true // Can always proceed from documents to analysis
      case 4:
        return true // Can always complete from analysis
      default:
        return false
    }
  }, [currentStep, businessData, allComplianceAnswered])

  // Handle file upload
  const handleFileUpload = async (key: DocumentKey, file: File | null) => {
    if (!file) {
      setDocuments(prev => ({
        ...prev,
        [key]: { status: 'pending', notAvailable: false }
      }))
      return
    }

    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], file, status: 'pending' }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', key)

      const response = await fetch('/api/onboarding/stylist/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setDocuments(prev => ({
          ...prev,
          [key]: { url, status: 'uploaded', file, notAvailable: false }
        }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setDocuments(prev => ({
        ...prev,
        [key]: { status: 'pending', file }
      }))
    }
  }

  // Handle "not available" toggle
  const handleNotAvailable = (key: DocumentKey, checked: boolean) => {
    setDocuments(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        notAvailable: checked,
        file: checked ? undefined : prev[key].file,
        url: checked ? undefined : prev[key].url,
        status: checked ? 'pending' : prev[key].status,
      }
    }))
  }

  // Save data to server
  const saveData = async (declaration: boolean = false, provisional: boolean = false) => {
    const documentUrls: Record<string, string> = {}
    const documentNotAvailable: Record<string, boolean> = {}
    
    for (const [key, doc] of Object.entries(documents)) {
      if (doc.url) documentUrls[key] = doc.url
      if (doc.notAvailable) documentNotAvailable[key] = true
    }

    const response = await fetch('/api/onboarding/stylist/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessData,
        compliance,
        documentUrls,
        documentNotAvailable,
        declaration,
        provisional,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Ein Fehler ist aufgetreten')
    }

    return response.json()
  }

  // Close and save
  const handleCloseAndSave = async () => {
    if (!businessData.companyName || !businessData.businessStreet || !businessData.businessCity || !businessData.businessZipCode) {
      onOpenChange(false)
      return
    }
    
    setIsLoading(true)
    
    try {
      await saveData(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving onboarding:', error)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Start analysis animation when entering step 4
  const startAnalysis = useCallback(() => {
    setAnalysisPhase('analyzing')
    setAnalysisProgress(0)
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setAnalysisPhase('complete')
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Go to analysis (step 4)
  const goToAnalysis = async () => {
    setIsLoading(true)
    setFormError('')

    try {
      await saveData(false)
      setCurrentStep(4)
      startAnalysis()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  // Complete onboarding
  const completeOnboarding = async (provisional: boolean = false) => {
    setIsLoading(true)
    setFormError('')

    try {
      await saveData(true, provisional)
      
      // Update session
      await update({ onboardingCompleted: true })
      
      // Close dialog and complete
      onOpenChange(false)
      onComplete?.()
      
      // Reload to reflect changes
      window.location.reload()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (!canProceed()) {
      if (currentStep === 2) setComplianceError(true)
      return
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
      setComplianceError(false)
    } else if (currentStep === 3) {
      await goToAnalysis()
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && currentStep <= 3) {
      setCurrentStep(prev => prev - 1)
      setComplianceError(false)
    }
  }

  // Calculate stats for analysis
  const getComplianceStats = () => {
    let ready = 0, pending = 0, missing = 0
    Object.values(compliance).forEach(value => {
      if (value === 'yes') ready++
      else if (value === 'pending') pending++
      else missing++
    })
    return { ready, pending, missing }
  }

  const getDocumentStats = () => {
    let uploaded = 0, pending = 0
    Object.values(documents).forEach(doc => {
      if (doc.url || doc.status === 'uploaded') uploaded++
      else pending++
    })
    return { uploaded, pending }
  }

  const complianceStats = getComplianceStats()
  const documentStats = getDocumentStats()
  const overallScore = Math.round(
    ((complianceStats.ready * 20) + (documentStats.uploaded * 10)) / 1.5
  )

  // Check if everything is complete (no tips needed)
  const isEverythingComplete = complianceStats.ready === 5 && documentStats.uploaded === 5

  const stepInfo = [
    { number: 1, title: 'Geschäftsdaten', icon: Building2 },
    { number: 2, title: 'Compliance', icon: Shield },
    { number: 3, title: 'Dokumente', icon: FileCheck },
    { number: 4, title: 'Analyse', icon: BarChart3 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-[#0a0a0f] border-white/10 flex flex-col" hideCloseButton>
        <VisuallyHidden.Root>
          <DialogTitle>Stylist Onboarding</DialogTitle>
        </VisuallyHidden.Root>
        
        {/* Close Button - Fixed position */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseAndSave}
            disabled={isLoading}
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            title="Speichern und schließen"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Analysis Loading Animation */}
          {currentStep === 4 && analysisPhase === 'analyzing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-8"
              >
                <div className="w-full h-full rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Analysiere deine Daten...
              </h2>
              <p className="text-muted-foreground mb-8">
                Wir erstellen deinen persönlichen Selbstständigkeits-Report
              </p>
              
              <div className="space-y-4">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {analysisProgress < 30 && 'Compliance-Check wird ausgewertet...'}
                    {analysisProgress >= 30 && analysisProgress < 60 && 'Dokumente werden geprüft...'}
                    {analysisProgress >= 60 && analysisProgress < 90 && 'Tipps werden zusammengestellt...'}
                    {analysisProgress >= 90 && 'Fast fertig...'}
                  </span>
                  <span className="text-emerald-400 font-medium">{Math.round(analysisProgress)}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Regular content (not analyzing) */}
          {!(currentStep === 4 && analysisPhase === 'analyzing') && (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">
                    {currentStep === 4 ? 'Dein persönlicher Report' : 'Einrichtungs-Assistent'}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                  {currentStep === 4 ? 'Dein Selbstständigkeits-Status' : 'Compliance-Onboarding'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 4 
                    ? 'Wir haben deine Daten analysiert und personalisierte Tipps für dich.' 
                    : `Schritt ${currentStep} von ${TOTAL_STEPS}`}
                </p>
              </motion.div>

              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  {stepInfo.map((step, index) => {
                    const isComplete = currentStep > step.number
                    const isActive = currentStep === step.number
                    const Icon = step.icon

                    return (
                      <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <motion.div
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                            }}
                            className={`
                              relative w-10 h-10 rounded-xl flex items-center justify-center
                              transition-all duration-300
                              ${isComplete 
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                                : isActive 
                                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500' 
                                  : 'bg-white/5 border border-white/10'}
                            `}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            ) : (
                              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                            )}
                          </motion.div>
                          <span className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                            {step.title}
                          </span>
                        </div>
                        
                        {index < stepInfo.length - 1 && (
                          <div className="flex-1 h-0.5 mx-2 mt-[-20px] sm:mt-[-30px]">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              currentStep > step.number ? 'bg-emerald-500' : 'bg-white/10'
                            }`} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Form Error */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                >
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{formError}</p>
                </motion.div>
              )}

              {/* Step Content */}
              <TooltipProvider>
                <AnimatePresence mode="wait">
                  {/* Step 1: Business Data */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Deine Geschäftsdaten</h2>
                        <p className="text-muted-foreground text-sm">Diese Daten benötigen wir für deine Compliance-Prüfung.</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="companyName">Firmenname / Einzelunternehmer-Name *</Label>
                          <Input
                            id="companyName"
                            value={businessData.companyName}
                            onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder="z.B. Max Mustermann Friseurbetrieb"
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxId">Steuernummer</Label>
                          <Input
                            id="taxId"
                            value={businessData.taxId}
                            onChange={(e) => setBusinessData(prev => ({ ...prev, taxId: e.target.value }))}
                            placeholder="z.B. 123/456/78901"
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vatId">USt-IdNr. (falls vorhanden)</Label>
                          <Input
                            id="vatId"
                            value={businessData.vatId}
                            onChange={(e) => setBusinessData(prev => ({ ...prev, vatId: e.target.value }))}
                            placeholder="z.B. DE123456789"
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="businessStreet">Geschäftsadresse (Straße & Hausnummer) *</Label>
                          <Input
                            id="businessStreet"
                            value={businessData.businessStreet}
                            onChange={(e) => setBusinessData(prev => ({ ...prev, businessStreet: e.target.value }))}
                            placeholder="z.B. Musterstraße 123"
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessZipCode">PLZ *</Label>
                          <div className="relative">
                            <Input
                              id="businessZipCode"
                              value={businessData.businessZipCode}
                              onChange={(e) => handlePLZChange(e.target.value)}
                              placeholder="z.B. 80331"
                              maxLength={5}
                              className="bg-white/5 border-white/10"
                            />
                            {plzLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessCity">Stadt *</Label>
                          <div className="relative">
                            <Input
                              id="businessCity"
                              value={businessData.businessCity}
                              onChange={(e) => setBusinessData(prev => ({ ...prev, businessCity: e.target.value }))}
                              placeholder="z.B. München"
                              className="bg-white/5 border-white/10"
                            />
                            {businessData.businessCity && businessData.businessZipCode.length === 5 && (
                              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Compliance */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Compliance-Check</h2>
                        <p className="text-muted-foreground text-sm">Beantworte diese Fragen ehrlich – wir helfen dir bei Lücken.</p>
                      </div>

                      {complianceError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <p className="text-red-400 text-sm">Bitte beantworte alle Fragen, bevor du fortfährst.</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {COMPLIANCE_ITEMS.map((item, index) => {
                          const Icon = item.icon
                          const answer = compliance[item.key]

                          return (
                            <motion.div
                              key={item.key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`
                                p-4 rounded-xl border transition-all duration-300
                                ${answer === 'yes' 
                                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                                  : answer === 'no'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : answer === 'pending'
                                      ? 'bg-amber-500/10 border-amber-500/30'
                                      : 'bg-white/5 border-white/10'}
                              `}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                                  answer === 'yes' ? 'text-emerald-400' : 
                                  answer === 'no' ? 'text-red-400' : 
                                  answer === 'pending' ? 'text-amber-400' : 'text-muted-foreground'
                                }`} />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="text-muted-foreground hover:text-white">
                                          <Info className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-zinc-900 border-white/10">
                                        <p>{item.infoText}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {(['yes', 'no', 'pending'] as const).map((value) => (
                                      <button
                                        key={value}
                                        onClick={() => setCompliance(prev => ({ ...prev, [item.key]: value }))}
                                        className={`
                                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                          ${answer === value 
                                            ? value === 'yes' 
                                              ? 'bg-emerald-500 text-white' 
                                              : value === 'no'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-amber-500 text-white'
                                            : 'bg-white/5 text-muted-foreground hover:bg-white/10'}
                                        `}
                                      >
                                        {value === 'yes' ? 'Ja' : value === 'no' ? 'Nein' : 'In Arbeit'}
                                      </button>
                                    ))}
                                  </div>

                                  {(answer === 'no' || answer === 'pending') && (
                                    <motion.p
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="mt-3 text-xs text-amber-400/80 bg-amber-500/10 p-2 rounded-lg"
                                    >
                                      💡 {item.helpTip}
                                    </motion.p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Documents */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Dokumente hochladen</h2>
                        <p className="text-muted-foreground text-sm">Lade deine Dokumente hoch oder markiere sie als &quot;wird nachgereicht&quot;.</p>
                      </div>

                      <div className="space-y-4">
                        {DOCUMENT_SLOTS.map((slot, index) => {
                          const doc = documents[slot.key]
                          const hasFile = doc.url || doc.status === 'uploaded'
                          const isNotAvailable = doc.notAvailable

                          return (
                            <motion.div
                              key={slot.key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`
                                p-4 rounded-xl border transition-all duration-300
                                ${hasFile 
                                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                                  : isNotAvailable
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : 'bg-white/5 border-white/10'}
                              `}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`
                                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                  ${hasFile 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : isNotAvailable
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-white/10 text-muted-foreground'}
                                `}>
                                  {hasFile ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-white">{slot.label}</p>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="text-muted-foreground hover:text-white">
                                          <HelpCircle className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-zinc-900 border-white/10">
                                        <p className="mb-2">{slot.infoText}</p>
                                        {slot.helpLink && (
                                          <a 
                                            href={slot.helpLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-emerald-400 hover:underline text-xs flex items-center gap-1"
                                          >
                                            {slot.helpText} <ExternalLink className="h-3 w-3" />
                                          </a>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">{slot.description}</p>

                                  {!isNotAvailable && (
                                    <FileUploader
                                      value={doc.file || null}
                                      onFileSelect={(file: File) => handleFileUpload(slot.key, file)}
                                      maxSize={10 * 1024 * 1024}
                                      accept={{
                                        'image/*': ['.jpg', '.jpeg', '.png'],
                                        'application/pdf': ['.pdf'],
                                      }}
                                    />
                                  )}

                                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isNotAvailable}
                                      onChange={(e) => handleNotAvailable(slot.key, e.target.checked)}
                                      className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      Dokument liegt mir noch nicht vor (wird nachgereicht)
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Analysis Results */}
                  {currentStep === 4 && analysisPhase === 'complete' && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Score Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                      >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="relative">
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle
                                cx="56"
                                cy="56"
                                r="48"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-white/10"
                              />
                              <motion.circle
                                cx="56"
                                cy="56"
                                r="48"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 302" }}
                                animate={{ strokeDasharray: `${(overallScore / 100) * 302} 302` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                              <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <motion.span 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.8 }}
                                  className="text-2xl font-bold text-white"
                                >
                                  {overallScore}%
                                </motion.span>
                                <p className="text-xs text-muted-foreground">Ready</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-white mb-2">
                              {overallScore >= 80 && 'Du bist fast startklar! 🎉'}
                              {overallScore >= 50 && overallScore < 80 && 'Guter Fortschritt! 💪'}
                              {overallScore < 50 && 'Ein paar Schritte fehlen noch 📋'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {overallScore >= 80 && 'Nur noch wenige Kleinigkeiten und du kannst durchstarten.'}
                              {overallScore >= 50 && overallScore < 80 && 'Du hast schon vieles erledigt. Schau dir die Tipps an.'}
                              {overallScore < 50 && 'Keine Sorge – wir helfen dir bei jedem Schritt.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-white">{complianceStats.ready} Kriterien erfüllt</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-amber-400" />
                                <span className="text-white">{complianceStats.pending} in Arbeit</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-blue-400" />
                                <span className="text-white">{documentStats.uploaded}/5 Dokumente</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Compliance Tips */}
                      {(complianceStats.pending > 0 || complianceStats.missing > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                              <Lightbulb className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-white">Unsere Tipps für dich</h2>
                              <p className="text-xs text-muted-foreground">So erreichst du 100% Selbstständigkeit</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {Object.entries(compliance).map(([key, value]) => {
                              if (value === 'yes') return null
                              
                              const tip = COMPLIANCE_TIPS[key]
                              if (!tip) return null
                              
                              const Icon = tip.icon
                              const colorClasses: Record<string, string> = {
                                blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
                                purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
                                emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
                                amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
                                pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
                              }
                              const iconColors: Record<string, string> = {
                                blue: 'text-blue-400',
                                purple: 'text-purple-400',
                                emerald: 'text-emerald-400',
                                amber: 'text-amber-400',
                                pink: 'text-pink-400',
                              }

                              return (
                                <motion.div
                                  key={key}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[tip.color]} border`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 ${iconColors[tip.color]}`}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-white text-sm">{tip.needsHelp.title}</h3>
                                        {value === 'pending' && (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                            In Arbeit
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2">{tip.needsHelp.description}</p>
                                      
                                      <ul className="space-y-1 mb-3">
                                        {tip.needsHelp.tips.slice(0, 2).map((tipText, i) => (
                                          <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                                            <ChevronRight className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            {tipText}
                                          </li>
                                        ))}
                                      </ul>
                                      
                                      {tip.needsHelp.cta && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs border-white/20 hover:bg-white/10"
                                          asChild
                                        >
                                          {tip.needsHelp.cta.external ? (
                                            <a href={tip.needsHelp.cta.href} target="_blank" rel="noopener noreferrer">
                                              {tip.needsHelp.cta.label}
                                              <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                          ) : (
                                            <Link href={tip.needsHelp.cta.href}>
                                              {tip.needsHelp.cta.label}
                                              <ArrowRight className="h-3 w-3 ml-1" />
                                            </Link>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* Document Tips */}
                      {documentStats.pending > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-white">Fehlende Dokumente</h2>
                              <p className="text-xs text-muted-foreground">So kommst du an die nötigen Unterlagen</p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {Object.entries(documents).map(([key, doc]) => {
                              if (doc.url || doc.status === 'uploaded') return null
                              
                              const tip = DOCUMENT_TIPS[key as keyof typeof DOCUMENT_TIPS]
                              if (!tip) return null

                              return (
                                <motion.div
                                  key={key}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                      <FileText className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white text-sm">{tip.title}</h4>
                                      {doc.notAvailable && (
                                        <span className="text-xs text-amber-400">Wird nachgereicht</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <ul className="space-y-1">
                                    {tip.tips.map((tipText, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <span className="text-emerald-400 mt-0.5">•</span>
                                        {tipText}
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* Success Message if everything complete */}
                      {isEverythingComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 text-center"
                        >
                          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">Perfekt! 🎉</h3>
                          <p className="text-muted-foreground">
                            Du hast alle Compliance-Kriterien erfüllt und alle Dokumente hochgeladen. 
                            Dein Onboarding kann jetzt abgeschlossen werden!
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TooltipProvider>
            </>
          )}
        </div>

        {/* Navigation - Fixed at bottom */}
        {!(currentStep === 4 && analysisPhase === 'analyzing') && (
          <div className="flex-shrink-0 border-t border-white/10 bg-[#0a0a0f] p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              {currentStep < 4 && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="text-muted-foreground hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Zurück
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {currentStep === 3 ? 'Zur Analyse' : 'Weiter'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}

              {currentStep === 4 && analysisPhase === 'complete' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {!isEverythingComplete && (
                    <Button
                      variant="outline"
                      onClick={() => completeOnboarding(true)}
                      disabled={isLoading}
                      className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Vorläufig abschließen
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => completeOnboarding(false)}
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 ${isEverythingComplete ? 'w-full' : ''}`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {isEverythingComplete ? 'Onboarding abschließen' : 'Trotzdem abschließen'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
