'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Building2, 
  Users, 
  Armchair,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  Sparkles,
  Instagram,
  Globe,
  AlertCircle,
  Scissors,
  Palette,
  Droplets,
  Wand2,
  Heart,
  Crown,
  Gem,
  Zap
} from 'lucide-react'

// Validation Errors Type
interface ValidationErrors {
  [key: string]: string
}

// Service types from API
interface ServiceFromAPI {
  id: string
  name: string
  description: string | null
}

interface ServiceCategoryFromAPI {
  id: string
  name: string
  icon: string | null
  color: string | null
  services: ServiceFromAPI[]
}

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  scissors: Scissors,
  palette: Palette,
  droplets: Droplets,
  sparkles: Sparkles,
  wand2: Wand2,
  heart: Heart,
  crown: Crown,
  gem: Gem,
  zap: Zap,
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  
  // Services from API
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryFromAPI[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  // Salon Owner form data
  const [salonData, setSalonData] = useState({
    salonName: '',
    street: '',
    city: '',
    zipCode: '',
    phone: '',
    employeeCount: '',
    chairCount: '',
    description: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    website: '',
  })

  // Stylist form data
  const [stylistData, setStylistData] = useState({
    yearsExperience: '',
    street: '',
    city: '',
    zipCode: '',
    phone: '',
    bio: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    website: '',
  })

  // Skill Ratings
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})

  const isSalonOwner = session?.user?.role === 'SALON_OWNER'
  const totalSteps = isSalonOwner ? 3 : 4

  // Flatten all services for counting and submission
  const allServices = serviceCategories.flatMap(cat => 
    cat.services.map(s => ({ ...s, category: cat.name, categoryId: cat.id }))
  )

  // Load services from API
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServiceCategories(data)
          // Initialize skill ratings
          const initial: Record<string, number> = {}
          data.forEach((cat: ServiceCategoryFromAPI) => {
            cat.services.forEach((s: ServiceFromAPI) => {
              initial[s.id] = 0
            })
          })
          setSkillRatings(initial)
        }
      } catch (error) {
        console.error('Failed to load services:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }
    loadServices()
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.onboardingCompleted) {
      const dashboard = getDashboardRoute(session.user.role)
      router.push(dashboard)
    }
  }, [status, session, router])

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin'
      case 'SALON_OWNER':
        return '/salon'
      case 'STYLIST':
        return '/stylist'
      default:
        return '/dashboard'
    }
  }

  // Validation Functions
  const validateStep = useCallback((currentStep: number): boolean => {
    const errors: ValidationErrors = {}
    
    if (isSalonOwner) {
      if (currentStep === 1) {
        if (!salonData.salonName.trim()) {
          errors.salonName = 'Salonname ist erforderlich'
        } else if (salonData.salonName.length < 2) {
          errors.salonName = 'Salonname muss mindestens 2 Zeichen haben'
        }
        if (salonData.employeeCount && (isNaN(Number(salonData.employeeCount)) || Number(salonData.employeeCount) < 0)) {
          errors.employeeCount = 'Bitte eine gültige Zahl eingeben'
        }
        if (salonData.chairCount && (isNaN(Number(salonData.chairCount)) || Number(salonData.chairCount) < 1)) {
          errors.chairCount = 'Mindestens 1 Stuhl erforderlich'
        }
      } else if (currentStep === 2) {
        if (!salonData.street.trim()) {
          errors.street = 'Straße ist erforderlich'
        }
        if (!salonData.zipCode.trim()) {
          errors.zipCode = 'PLZ ist erforderlich'
        } else if (!/^\d{5}$/.test(salonData.zipCode)) {
          errors.zipCode = 'PLZ muss 5 Ziffern haben'
        }
        if (!salonData.city.trim()) {
          errors.city = 'Stadt ist erforderlich'
        }
        if (salonData.phone && !/^[\d\s\-+()]+$/.test(salonData.phone)) {
          errors.phone = 'Ungültige Telefonnummer'
        }
        // Social Media Validation
        if (salonData.instagram && !salonData.instagram.match(/^@?[\w.]+$/)) {
          errors.instagram = 'Ungültiger Instagram-Username'
        }
        if (salonData.website && !salonData.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
          errors.website = 'Ungültige Website-URL'
        }
      }
    } else {
      // Stylist Validation
      if (currentStep === 1) {
        if (!stylistData.yearsExperience.trim()) {
          errors.yearsExperience = 'Erfahrung ist erforderlich'
        } else if (isNaN(Number(stylistData.yearsExperience)) || Number(stylistData.yearsExperience) < 0 || Number(stylistData.yearsExperience) > 60) {
          errors.yearsExperience = 'Bitte eine gültige Zahl (0-60) eingeben'
        }
      } else if (currentStep === 2) {
        // Skills - mindestens 3 Services mit Rating
        const ratedServices = Object.values(skillRatings).filter(r => r > 0).length
        if (ratedServices < 3) {
          errors.skills = 'Bitte bewerte mindestens 3 Dienstleistungen'
        }
      } else if (currentStep === 3) {
        if (!stylistData.street.trim()) {
          errors.street = 'Straße ist erforderlich'
        }
        if (!stylistData.zipCode.trim()) {
          errors.zipCode = 'PLZ ist erforderlich'
        } else if (!/^\d{5}$/.test(stylistData.zipCode)) {
          errors.zipCode = 'PLZ muss 5 Ziffern haben'
        }
        if (!stylistData.city.trim()) {
          errors.city = 'Stadt ist erforderlich'
        }
        if (stylistData.phone && !/^[\d\s\-+()]+$/.test(stylistData.phone)) {
          errors.phone = 'Ungültige Telefonnummer'
        }
        // Social Media Validation
        if (stylistData.instagram && !stylistData.instagram.match(/^@?[\w.]+$/)) {
          errors.instagram = 'Ungültiger Instagram-Username'
        }
        if (stylistData.website && !stylistData.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
          errors.website = 'Ungültige Website-URL'
        }
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [isSalonOwner, salonData, stylistData, skillRatings])

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1)
        setValidationErrors({})
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setValidationErrors({})
    }
  }

  const handleSkillRating = (serviceId: string, rating: number) => {
    setSkillRatings(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] === rating ? 0 : rating // Toggle if same rating clicked
    }))
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    
    setIsLoading(true)
    setFormError('')

    try {
      const endpoint = isSalonOwner ? '/api/onboarding/salon' : '/api/onboarding/stylist'
      
      // Prepare data with skills for stylist
      const data = isSalonOwner 
        ? salonData 
        : {
            ...stylistData,
            skills: Object.entries(skillRatings)
              .filter(([_, rating]) => rating > 0)
              .map(([id, rating]) => {
                const service = allServices.find(s => s.id === id)
                return { serviceId: id, name: service?.name, category: service?.category, rating }
              })
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setFormError(errorData.error || 'Ein Fehler ist aufgetreten')
        return
      }

      // Update session
      await update({ onboardingCompleted: true })

      // Redirect to dashboard
      const dashboard = getDashboardRoute(session?.user?.role || 'STYLIST')
      router.push(dashboard)
      router.refresh()
    } catch {
      setFormError('Ein Fehler ist aufgetreten')
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
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </motion.div>
      </div>
    )
  }

  // Star Rating Component
  const StarRating = ({ serviceId, currentRating }: { serviceId: string; currentRating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleSkillRating(serviceId, star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= currentRating
                ? 'fill-amber-400 text-amber-400'
                : 'text-white/20 hover:text-amber-400/50'
            }`}
          />
        </button>
      ))}
    </div>
  )

  // Input with Error Component
  const InputWithError = ({ 
    id, 
    label, 
    value, 
    onChange, 
    error, 
    placeholder,
    type = 'text',
    icon: Icon,
    optional = false
  }: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    type?: string
    icon?: React.ElementType
    optional?: boolean
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white flex items-center gap-2">
        {label}
        {optional && <span className="text-xs text-muted-foreground">(optional)</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  )

  const stepLabels = isSalonOwner 
    ? ['Salon-Info', 'Standort & Social', 'Fertig']
    : ['Erfahrung', 'Skills', 'Kontakt & Social', 'Fertig']

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="container max-w-4xl py-8 md:py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Profil einrichten</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
            Willkommen bei NICNOA&CO.online 👋
          </h1>
          <p className="text-muted-foreground">
            {isSalonOwner ? 'Vervollständige dein Salon-Profil' : 'Zeig uns, was du drauf hast!'}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 max-w-xl mx-auto">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`flex items-center ${i < totalSteps - 1 ? 'flex-1' : ''}`}>
                <motion.div
                  animate={{
                    scale: i + 1 === step ? 1.1 : 1,
                    boxShadow: i + 1 === step ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                    i + 1 <= step
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-white/10 text-muted-foreground'
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </motion.div>
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: i + 1 < step ? '100%' : '0%' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground max-w-xl mx-auto">
            {stepLabels.map((label, i) => (
              <span key={i} className={i + 1 === step ? 'text-emerald-400' : ''}>{label}</span>
            ))}
          </div>
        </div>

        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{formError}</p>
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative bg-[#12121a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* ========== SALON OWNER STEPS ========== */}
              {isSalonOwner && step === 1 && (
                <motion.div
                  key="salon-step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Dein Salon</h2>
                      <p className="text-muted-foreground">Erzähl uns von deinem Salon</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <InputWithError
                      id="salonName"
                      label="Salonname"
                      placeholder="z.B. Beauty Space Berlin"
                      value={salonData.salonName}
                      onChange={(v) => setSalonData({ ...salonData, salonName: v })}
                      error={validationErrors.salonName}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <InputWithError
                        id="employeeCount"
                        label="Anzahl Mitarbeiter"
                        type="number"
                        placeholder="z.B. 5"
                        value={salonData.employeeCount}
                        onChange={(v) => setSalonData({ ...salonData, employeeCount: v })}
                        error={validationErrors.employeeCount}
                        icon={Users}
                        optional
                      />
                      <InputWithError
                        id="chairCount"
                        label="Anzahl Stühle"
                        type="number"
                        placeholder="z.B. 8"
                        value={salonData.chairCount}
                        onChange={(v) => setSalonData({ ...salonData, chairCount: v })}
                        error={validationErrors.chairCount}
                        icon={Armchair}
                        optional
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {isSalonOwner && step === 2 && (
                <motion.div
                  key="salon-step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Standort & Social Media</h2>
                      <p className="text-muted-foreground">Wo finden Kunden dich?</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <InputWithError
                      id="street"
                      label="Straße & Hausnummer"
                      placeholder="Musterstraße 123"
                      value={salonData.street}
                      onChange={(v) => setSalonData({ ...salonData, street: v })}
                      error={validationErrors.street}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <InputWithError
                        id="zipCode"
                        label="PLZ"
                        placeholder="10115"
                        value={salonData.zipCode}
                        onChange={(v) => setSalonData({ ...salonData, zipCode: v })}
                        error={validationErrors.zipCode}
                      />
                      <InputWithError
                        id="city"
                        label="Stadt"
                        placeholder="Berlin"
                        value={salonData.city}
                        onChange={(v) => setSalonData({ ...salonData, city: v })}
                        error={validationErrors.city}
                      />
                    </div>

                    <InputWithError
                      id="phone"
                      label="Telefon"
                      type="tel"
                      placeholder="+49 30 123456"
                      value={salonData.phone}
                      onChange={(v) => setSalonData({ ...salonData, phone: v })}
                      error={validationErrors.phone}
                      icon={Phone}
                      optional
                    />

                    {/* Social Media */}
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-400" />
                        Social Media
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InputWithError
                          id="instagram"
                          label="Instagram"
                          placeholder="@deinsalon"
                          value={salonData.instagram}
                          onChange={(v) => setSalonData({ ...salonData, instagram: v })}
                          error={validationErrors.instagram}
                          icon={Instagram}
                          optional
                        />
                        <InputWithError
                          id="tiktok"
                          label="TikTok"
                          placeholder="@deinsalon"
                          value={salonData.tiktok}
                          onChange={(v) => setSalonData({ ...salonData, tiktok: v })}
                          optional
                        />
                        <InputWithError
                          id="facebook"
                          label="Facebook"
                          placeholder="facebook.com/deinsalon"
                          value={salonData.facebook}
                          onChange={(v) => setSalonData({ ...salonData, facebook: v })}
                          optional
                        />
                        <InputWithError
                          id="website"
                          label="Website"
                          placeholder="www.deinsalon.de"
                          value={salonData.website}
                          onChange={(v) => setSalonData({ ...salonData, website: v })}
                          error={validationErrors.website}
                          icon={Globe}
                          optional
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isSalonOwner && step === 3 && (
                <motion.div
                  key="salon-step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Fast fertig!</h2>
                      <p className="text-muted-foreground">Noch ein paar Details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="description" className="text-white">Beschreibung deines Salons</Label>
                    <Textarea
                      id="description"
                      placeholder="Erzähl potenziellen Mietern von deinem Salon..."
                      rows={4}
                      value={salonData.description}
                      onChange={(e) => setSalonData({ ...salonData, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400">
                      ✨ Dein Profil kann jederzeit im Dashboard bearbeitet werden
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========== STYLIST STEPS ========== */}
              {!isSalonOwner && step === 1 && (
                <motion.div
                  key="stylist-step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Award className="h-7 w-7 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Deine Erfahrung</h2>
                      <p className="text-muted-foreground">Erzähl uns von dir</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <InputWithError
                      id="yearsExperience"
                      label="Wie viele Jahre Erfahrung hast du?"
                      type="number"
                      placeholder="z.B. 5"
                      value={stylistData.yearsExperience}
                      onChange={(v) => setStylistData({ ...stylistData, yearsExperience: v })}
                      error={validationErrors.yearsExperience}
                      icon={Zap}
                    />

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex gap-3">
                        <Crown className="h-5 w-5 text-amber-400 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-400 mb-1">Im nächsten Schritt</p>
                          <p className="text-amber-400/70">
                            Zeig uns deine Skills! Bewerte deine Fähigkeiten in verschiedenen Bereichen mit Sternen.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Skills Rating */}
              {!isSalonOwner && step === 2 && (
                <motion.div
                  key="stylist-step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Gem className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Deine Skills</h2>
                      <p className="text-muted-foreground">Bewerte deine Erfahrung mit Sternen (1-5)</p>
                    </div>
                  </div>

                  {validationErrors.skills && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="text-sm text-red-400">{validationErrors.skills}</p>
                    </motion.div>
                  )}

                  {isLoadingServices ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {serviceCategories.map((category, catIndex) => {
                        const Icon = ICON_MAP[category.icon || 'scissors'] || Scissors
                        const colorClasses: Record<string, string> = {
                          emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
                          violet: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
                          cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
                          amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
                          rose: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
                          indigo: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400',
                        }
                        const colorClass = colorClasses[category.color || 'emerald'] || colorClasses.emerald

                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.1 }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClass} border flex items-center justify-center`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                            </div>
                            
                            <div className="grid gap-3">
                              {category.services.map((service) => (
                                <div
                                  key={service.id}
                                  className={`
                                    flex items-center justify-between p-4 rounded-xl transition-all duration-200
                                    ${skillRatings[service.id] > 0 
                                      ? 'bg-white/10 border border-white/20' 
                                      : 'bg-white/5 border border-transparent hover:bg-white/10'}
                                  `}
                                >
                                  <div className="flex-1 min-w-0 mr-4">
                                    <span className={`font-medium ${skillRatings[service.id] > 0 ? 'text-white' : 'text-white/70'}`}>
                                      {service.name}
                                    </span>
                                    {service.description && (
                                      <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                                    )}
                                  </div>
                                  <StarRating serviceId={service.id} currentRating={skillRatings[service.id] || 0} />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bewertete Services</span>
                      <span className="text-sm font-medium text-white">
                        {Object.values(skillRatings).filter(r => r > 0).length} / {allServices.length}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address & Social Media */}
              {!isSalonOwner && step === 3 && (
                <motion.div
                  key="stylist-step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Kontakt & Social Media</h2>
                      <p className="text-muted-foreground">Wie können dich Kunden erreichen?</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <InputWithError
                      id="stylistStreet"
                      label="Straße & Hausnummer"
                      placeholder="Musterstraße 123"
                      value={stylistData.street}
                      onChange={(v) => setStylistData({ ...stylistData, street: v })}
                      error={validationErrors.street}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <InputWithError
                        id="stylistZipCode"
                        label="PLZ"
                        placeholder="10115"
                        value={stylistData.zipCode}
                        onChange={(v) => setStylistData({ ...stylistData, zipCode: v })}
                        error={validationErrors.zipCode}
                      />
                      <InputWithError
                        id="stylistCity"
                        label="Stadt"
                        placeholder="Berlin"
                        value={stylistData.city}
                        onChange={(v) => setStylistData({ ...stylistData, city: v })}
                        error={validationErrors.city}
                      />
                    </div>

                    <InputWithError
                      id="stylistPhone"
                      label="Telefon"
                      type="tel"
                      placeholder="+49 170 1234567"
                      value={stylistData.phone}
                      onChange={(v) => setStylistData({ ...stylistData, phone: v })}
                      error={validationErrors.phone}
                      icon={Phone}
                      optional
                    />

                    {/* Social Media */}
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-400" />
                        Social Media
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InputWithError
                          id="stylistInstagram"
                          label="Instagram"
                          placeholder="@deinname"
                          value={stylistData.instagram}
                          onChange={(v) => setStylistData({ ...stylistData, instagram: v })}
                          error={validationErrors.instagram}
                          icon={Instagram}
                          optional
                        />
                        <InputWithError
                          id="stylistTiktok"
                          label="TikTok"
                          placeholder="@deinname"
                          value={stylistData.tiktok}
                          onChange={(v) => setStylistData({ ...stylistData, tiktok: v })}
                          optional
                        />
                        <InputWithError
                          id="stylistFacebook"
                          label="Facebook"
                          placeholder="facebook.com/deinname"
                          value={stylistData.facebook}
                          onChange={(v) => setStylistData({ ...stylistData, facebook: v })}
                          optional
                        />
                        <InputWithError
                          id="stylistWebsite"
                          label="Website"
                          placeholder="www.deinname.de"
                          value={stylistData.website}
                          onChange={(v) => setStylistData({ ...stylistData, website: v })}
                          error={validationErrors.website}
                          icon={Globe}
                          optional
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Final */}
              {!isSalonOwner && step === 4 && (
                <motion.div
                  key="stylist-step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Fast fertig!</h2>
                      <p className="text-muted-foreground">Stell dich vor</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="bio" className="text-white">Über dich</Label>
                    <Textarea
                      id="bio"
                      placeholder="Erzähl potenziellen Kunden und Salonbetreibern von dir..."
                      rows={4}
                      value={stylistData.bio}
                      onChange={(e) => setStylistData({ ...stylistData, bio: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Gem className="h-5 w-5 text-purple-400" />
                      Deine Top-Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(skillRatings)
                        .filter(([_, rating]) => rating >= 4)
                        .slice(0, 6)
                        .map(([id, rating]) => {
                          const service = allServices.find(s => s.id === id)
                          return (
                            <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm">
                              <span>{service?.name}</span>
                              <div className="flex">
                                {Array.from({ length: rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400">
                      ✨ Dein Profil kann jederzeit im Dashboard bearbeitet werden
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              
              {step < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-6"
                >
                  Weiter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    'Profil erstellen'
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Schritt {step} von {totalSteps}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
