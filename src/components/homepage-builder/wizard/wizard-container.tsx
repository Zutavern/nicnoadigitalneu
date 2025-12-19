'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import { StepProjectName } from './step-project-name'
import { StepContactData } from './step-contact-data'
import { StepPageConfig } from './step-page-config'
import { StepDesignStyle } from './step-design-style'
import { StepReview } from './step-review'

import { 
  WIZARD_STEPS, 
  generateSlug,
  DEFAULT_CONTACT_DATA 
} from '@/lib/homepage-builder'
import type { 
  WizardState, 
  WizardStep,
  HomepageTemplate,
  HomepagePageConfig,
  HomepageDesignStyle,
  HomepageContactData
} from '@/lib/homepage-builder'

interface WizardContainerProps {
  userRole: 'STYLIST' | 'SALON_OWNER'
  basePath: string // z.B. '/stylist/marketing/homepage' oder '/salon/marketing/homepage'
}

const STEP_ORDER: WizardStep[] = ['project-name', 'contact-data', 'page-config', 'design-style', 'review']

export function WizardContainer({ userRole, basePath }: WizardContainerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingContactData, setExistingContactData] = useState<HomepageContactData | null>(null)
  
  const [state, setState] = useState<WizardState>({
    currentStep: 'project-name',
    projectName: '',
    slug: '',
    templateType: null,
    pageConfig: null,
    designStyle: null,
    contactData: null,
    brandingColor: '#10b981',
    brandingLogoUrl: null
  })

  // Kontaktdaten aus der Datenbank laden
  useEffect(() => {
    async function loadContactData() {
      try {
        const endpoint = userRole === 'SALON_OWNER' 
          ? '/api/salon/settings' 
          : '/api/stylist/settings'
        
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          
          // Daten aufbereiten
          const contactData: HomepageContactData = {
            name: data.name || data.user?.name || '',
            email: data.email || data.user?.email || '',
            phone: data.phone || '',
            street: data.street || '',
            city: data.city || '',
            zipCode: data.zipCode || '',
            country: data.country || 'Deutschland',
            salonName: data.salonName || undefined,
            openingHours: data.openingHours || undefined,
            instagram: data.instagramUrl || data.instagram || undefined,
            facebook: data.facebook || undefined,
            tiktok: data.tiktokUrl || data.tiktok || undefined,
            website: data.websiteUrl || data.website || undefined
          }
          
          setExistingContactData(contactData)
          
          // Branding-Farbe übernehmen wenn vorhanden
          if (data.brandingColor) {
            setState(prev => ({ ...prev, brandingColor: data.brandingColor }))
          }
          if (data.brandingLogoUrl) {
            setState(prev => ({ ...prev, brandingLogoUrl: data.brandingLogoUrl }))
          }
        }
      } catch (error) {
        console.error('Error loading contact data:', error)
      }
    }
    
    loadContactData()
  }, [userRole])

  const currentStepIndex = STEP_ORDER.indexOf(state.currentStep)
  
  const canGoNext = useCallback(() => {
    switch (state.currentStep) {
      case 'project-name':
        return state.projectName.trim().length >= 3
      case 'contact-data':
        return state.contactData !== null && 
               state.contactData.name && 
               state.contactData.email
      case 'page-config':
        return state.pageConfig !== null
      case 'design-style':
        return state.designStyle !== null
      case 'review':
        return true
      default:
        return false
    }
  }, [state])

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEP_ORDER.length - 1 && canGoNext()) {
      // Beim Wechsel von project-name: Slug generieren
      if (state.currentStep === 'project-name') {
        setState(prev => ({
          ...prev,
          slug: generateSlug(prev.projectName),
          currentStep: STEP_ORDER[currentStepIndex + 1]
        }))
      } 
      // Beim Wechsel zu contact-data: Vorhandene Daten setzen
      else if (state.currentStep === 'project-name' && STEP_ORDER[currentStepIndex + 1] === 'contact-data') {
        setState(prev => ({
          ...prev,
          contactData: existingContactData || DEFAULT_CONTACT_DATA as HomepageContactData,
          currentStep: STEP_ORDER[currentStepIndex + 1]
        }))
      }
      else {
        setState(prev => ({
          ...prev,
          currentStep: STEP_ORDER[currentStepIndex + 1]
        }))
      }
    }
  }, [currentStepIndex, canGoNext, state.currentStep, existingContactData])

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStep: STEP_ORDER[currentStepIndex - 1]
      }))
    }
  }, [currentStepIndex])

  const handleSubmit = async () => {
    if (!state.pageConfig || !state.designStyle || !state.contactData) {
      toast.error('Bitte fülle alle Felder aus')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Template-Typ basierend auf Rolle bestimmen
      const templateType: HomepageTemplate = userRole === 'SALON_OWNER' 
        ? 'SALON_PROFESSIONAL' 
        : 'STYLIST_MODERN'

      const response = await fetch('/api/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.projectName,
          templateType,
          pageConfig: state.pageConfig,
          designStyle: state.designStyle,
          contactData: state.contactData,
          brandingColor: state.brandingColor,
          brandingLogoUrl: state.brandingLogoUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Erstellen')
      }

      const { project } = await response.json()
      
      toast.success('Homepage-Projekt erstellt!')
      
      // Zum Editor weiterleiten
      router.push(`${basePath}/${project.id}/edit`)
      
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen des Projekts')
    } finally {
      setIsSubmitting(false)
    }
  }

  // State-Update-Funktionen
  const updateProjectName = (name: string) => {
    setState(prev => ({ ...prev, projectName: name }))
  }

  const updateContactData = (data: HomepageContactData) => {
    setState(prev => ({ ...prev, contactData: data }))
  }

  const updatePageConfig = (config: HomepagePageConfig) => {
    setState(prev => ({ ...prev, pageConfig: config }))
  }

  const updateDesignStyle = (style: HomepageDesignStyle) => {
    setState(prev => ({ ...prev, designStyle: style }))
  }

  const updateBrandingColor = (color: string) => {
    setState(prev => ({ ...prev, brandingColor: color }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = state.currentStep === step.id
            const isCompleted = currentStepIndex > index
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isActive && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive && "text-primary"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-1 mx-2 rounded",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                    style={{ minWidth: '40px' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {state.currentStep === 'project-name' && (
                <StepProjectName
                  value={state.projectName}
                  onChange={updateProjectName}
                  slug={state.slug || generateSlug(state.projectName)}
                />
              )}
              
              {state.currentStep === 'contact-data' && (
                <StepContactData
                  value={state.contactData || existingContactData || DEFAULT_CONTACT_DATA as HomepageContactData}
                  onChange={updateContactData}
                  hasExistingData={!!existingContactData}
                  userRole={userRole}
                />
              )}
              
              {state.currentStep === 'page-config' && (
                <StepPageConfig
                  value={state.pageConfig}
                  onChange={updatePageConfig}
                  userRole={userRole}
                />
              )}
              
              {state.currentStep === 'design-style' && (
                <StepDesignStyle
                  value={state.designStyle}
                  onChange={updateDesignStyle}
                  brandingColor={state.brandingColor}
                  onBrandingColorChange={updateBrandingColor}
                />
              )}
              
              {state.currentStep === 'review' && (
                <StepReview
                  state={state}
                  userRole={userRole}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStepIndex === 0 ? () => router.push(basePath) : goToPrevStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStepIndex === 0 ? 'Abbrechen' : 'Zurück'}
        </Button>
        
        {state.currentStep === 'review' ? (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Homepage erstellen
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={goToNextStep}
            disabled={!canGoNext()}
          >
            Weiter
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}



