'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Loader2, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Scissors, 
  Ruler, 
  Users, 
  User, 
  FileStack, 
  FilePlus2,
  Image as ImageIcon,
  Check,
  Ban
} from 'lucide-react'
import { PriceListPreview } from '@/components/pricelist'
import { 
  PRICELIST_TEMPLATES, 
  getTemplatesForPricingModel,
  PRICING_MODEL_LABELS,
  type PriceListTemplate, 
  type TemplateBlock 
} from '@/lib/pricelist/templates'
import type { PricingModel } from '@prisma/client'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'
import { cn } from '@/lib/utils'

type CreateStep = 'name' | 'start-type' | 'pricing-model' | 'background' | 'template'
type StartType = 'blank' | 'template'

interface Background {
  id: string
  url: string
  filename: string
  type: string
}

const PRICING_MODEL_OPTIONS: { value: PricingModel; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'FIXED_PRICE',
    label: 'Festpreise',
    description: 'Ein fester Preis pro Leistung',
    icon: <Scissors className="h-5 w-5" />,
  },
  {
    value: 'BY_HAIR_LENGTH',
    label: 'Nach Haarlänge',
    description: 'Unterschiedliche Preise für Kurz/Mittel/Lang',
    icon: <Ruler className="h-5 w-5" />,
  },
  {
    value: 'BY_CATEGORY',
    label: 'Nach Kategorie',
    description: 'Preise nach Damen/Herren/Kinder',
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: 'BY_GENDER',
    label: 'Nach Geschlecht',
    description: 'Unterschiedliche Preise für Damen/Herren',
    icon: <User className="h-5 w-5" />,
  },
]

export default function CreatePricelistPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  
  // Step state
  const [step, setStep] = useState<CreateStep>('name')
  
  // Form state
  const [name, setName] = useState('')
  const [startType, setStartType] = useState<StartType>('template')
  const [pricingModel, setPricingModel] = useState<PricingModel>('FIXED_PRICE')
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null)
  
  // Backgrounds state
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(false)

  // Hintergründe laden
  useEffect(() => {
    const fetchBackgrounds = async () => {
      setIsLoadingBackgrounds(true)
      try {
        const res = await fetch('/api/pricelist/available-backgrounds')
        if (res.ok) {
          const data = await res.json()
          setBackgrounds(data.backgrounds || [])
        }
      } catch (error) {
        console.error('Error fetching backgrounds:', error)
      } finally {
        setIsLoadingBackgrounds(false)
      }
    }
    fetchBackgrounds()
  }, [])

  // Gefilterte Templates basierend auf Preismodell
  const filteredTemplates = useMemo(() => {
    return getTemplatesForPricingModel(pricingModel).filter(t => t.id !== 'blank')
  }, [pricingModel])

  // Gewählter Hintergrund
  const selectedBackground = useMemo(() => {
    return backgrounds.find(bg => bg.id === selectedBackgroundId)
  }, [backgrounds, selectedBackgroundId])

  // Steps für Progress-Anzeige
  const getSteps = () => {
    if (startType === 'blank') {
      return ['name', 'start-type', 'pricing-model', 'background']
    }
    return ['name', 'start-type', 'pricing-model', 'background', 'template']
  }

  const handleNext = () => {
    if (step === 'name') {
      if (!name.trim()) {
        toast.error('Bitte gib einen Namen ein')
        return
      }
      setStep('start-type')
    } else if (step === 'start-type') {
      setStep('pricing-model')
    } else if (step === 'pricing-model') {
      setStep('background')
    } else if (step === 'background') {
      if (startType === 'blank') {
        // Direkt erstellen
        handleCreate(null)
      } else {
        setStep('template')
      }
    }
  }

  const handleBack = () => {
    if (step === 'start-type') {
      setStep('name')
    } else if (step === 'pricing-model') {
      setStep('start-type')
    } else if (step === 'background') {
      setStep('pricing-model')
    } else if (step === 'template') {
      setStep('background')
    }
  }

  const handleCreate = async (template: PriceListTemplate | null) => {
    setIsCreating(true)
    try {
      // Preisliste erstellen
      const res = await fetch('/api/pricelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          pricingModel,
          theme: template?.theme || 'minimal',
          fontFamily: template?.fontFamily || 'inter',
          backgroundId: selectedBackgroundId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      const { priceList } = data

      // Wenn Vorlage ausgewählt, Blöcke erstellen
      if (template && template.blocks.length > 0) {
        await createTemplateBlocks(priceList.id, template.blocks)
      }

      toast.success('Preisliste erstellt!')
      router.push(`/stylist/pricelist/${priceList.id}/edit`)
    } catch (error) {
      console.error('Error creating pricelist:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen der Preisliste')
      setIsCreating(false)
    }
  }

  // Erstellt Blöcke aus der Vorlage
  const createTemplateBlocks = async (priceListId: string, templateBlocks: TemplateBlock[]) => {
    for (let i = 0; i < templateBlocks.length; i++) {
      const block = templateBlocks[i]
      
      await fetch(`/api/pricelist/${priceListId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: block.type,
          sortOrder: i,
          title: block.title,
          subtitle: block.subtitle,
          itemName: block.itemName,
          description: block.description,
          priceType: block.priceType || 'FIXED',
          price: block.price,
          priceMax: block.priceMax,
          priceText: block.priceText,
          qualifier: block.qualifier,
          content: block.content,
          spacerSize: block.spacerSize || 'MEDIUM',
          badgeText: block.badgeText,
          badgeStyle: block.badgeStyle,
          badgeColor: block.badgeColor,
          footerText: block.footerText,
          textAlign: block.textAlign || 'left',
          variants: block.variants,
        }),
      })
    }
  }

  // Template-Karte Komponente
  const TemplateCard = ({ template, onSelect }: { template: PriceListTemplate; onSelect: () => void }) => {
    const [isHovered, setIsHovered] = useState(false)

    // Erstelle eine Mock-PriceList für die Vorschau
    const mockPriceList: PriceListClient = {
      id: 'preview',
      userId: '',
      name: template.name,
      pricingModel: template.pricingModel === 'ALL' ? pricingModel : template.pricingModel,
      theme: template.theme,
      fontFamily: template.fontFamily,
      backgroundUrl: selectedBackground?.url,
      showLogo: false,
      showContact: false,
      columns: template.columns,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 15,
      paddingRight: 15,
      contentScale: 1,
      contentOffsetX: 0,
      contentOffsetY: 0,
      blocks: template.blocks as PriceBlockClient[],
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect()
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden cursor-pointer',
            'bg-card hover:shadow-lg hover:border-primary/30'
          )}
        >
          {/* Preview */}
          <div className="relative aspect-[3/4] bg-muted/30 flex items-center justify-center border-b overflow-hidden">
            <PriceListPreview
              priceList={mockPriceList}
              blocks={template.blocks as PriceBlockClient[]}
              scale={0.18}
              className="!shadow-md"
            />
            
            {/* Hover Overlay */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <span className="text-white text-sm font-medium px-4 py-2 rounded-full bg-primary/80">
                Auswählen
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 h-[72px] flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm mb-0.5 line-clamp-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{template.blocks.length} Blöcke</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Background-Karte Komponente
  const BackgroundCard = ({ 
    background, 
    isSelected, 
    onSelect 
  }: { 
    background: Background | null
    isSelected: boolean
    onSelect: () => void 
  }) => {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelect()
          }
        }}
        className={cn(
          'relative aspect-[3/4] rounded-lg border-2 cursor-pointer transition-all overflow-hidden',
          'hover:shadow-md',
          isSelected 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-border hover:border-primary/30'
        )}
      >
        {background ? (
          <img
            src={background.url}
            alt={background.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-2">
            <Ban className="h-8 w-8 text-muted-foreground/50" />
            <span className="text-sm text-muted-foreground">Kein Hintergrund</span>
          </div>
        )}
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
    )
  }

  const steps = getSteps()
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'name') {
                    router.push('/stylist/pricelist')
                  } else {
                    handleBack()
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Neue Preisliste</h1>
                <p className="text-sm text-muted-foreground">
                  {step === 'name' && 'Schritt 1: Name eingeben'}
                  {step === 'start-type' && 'Schritt 2: Wie möchtest du starten?'}
                  {step === 'pricing-model' && 'Schritt 3: Preismodell wählen'}
                  {step === 'background' && 'Schritt 4: Hintergrund wählen'}
                  {step === 'template' && 'Schritt 5: Vorlage auswählen'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    currentStepIndex === i ? 'bg-primary' : 
                    currentStepIndex > i ? 'bg-primary/50' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Name */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name der Preisliste</Label>
                      <Input
                        id="name"
                        placeholder="z.B. Hauptpreisliste, Frühlingsangebote..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleNext()
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <Button onClick={handleNext} className="w-full">
                      Weiter
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Start Type */}
          {step === 'start-type' && (
            <motion.div
              key="start-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4 text-center">
                    Wie möchtest du starten?
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Leer starten */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setStartType('blank')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setStartType('blank')
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all',
                        startType === 'blank' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FilePlus2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">Leer starten</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Erstelle alles selbst von Grund auf
                      </p>
                    </div>

                    {/* Mit Vorlage */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setStartType('template')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setStartType('template')
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all',
                        startType === 'template' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileStack className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">Mit Vorlage</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Starte mit einer fertigen Vorlage
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Zurück
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Weiter
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Pricing Model */}
          {step === 'pricing-model' && (
            <motion.div
              key="pricing-model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4 text-center">
                    Wie möchtest du deine Preise strukturieren?
                  </h2>
                  <RadioGroup
                    value={pricingModel}
                    onValueChange={(value) => setPricingModel(value as PricingModel)}
                    className="space-y-3"
                  >
                    {PRICING_MODEL_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all',
                          pricingModel === option.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        )}
                        onClick={() => setPricingModel(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {option.icon}
                          </div>
                          <div>
                            <Label htmlFor={option.value} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Zurück
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Weiter
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Background Selection */}
          {step === 'background' && (
            <motion.div
              key="background"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold">Wähle einen Hintergrund</h2>
                <p className="text-sm text-muted-foreground">
                  Optional: Du kannst auch ohne Hintergrund starten
                </p>
              </div>

              {isLoadingBackgrounds ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[210/297] rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Kein Hintergrund Option */}
                  <BackgroundCard
                    background={null}
                    isSelected={selectedBackgroundId === null}
                    onSelect={() => setSelectedBackgroundId(null)}
                  />
                  
                  {/* Verfügbare Hintergründe */}
                  {backgrounds.map((bg) => (
                    <BackgroundCard
                      key={bg.id}
                      background={bg}
                      isSelected={selectedBackgroundId === bg.id}
                      onSelect={() => setSelectedBackgroundId(bg.id)}
                    />
                  ))}
                </div>
              )}

              {backgrounds.length === 0 && !isLoadingBackgrounds && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Keine Hintergründe verfügbar</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dein Salon hat noch keine Hintergründe hochgeladen
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button onClick={handleNext}>
                  {startType === 'blank' ? (
                    <>
                      Erstellen
                      {isCreating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                    </>
                  ) : (
                    <>
                      Weiter zur Vorlage
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Template Selection */}
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold">Wähle eine Vorlage für „{name}"</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredTemplates.length} Vorlagen für {PRICING_MODEL_LABELS[pricingModel]}
                  {selectedBackground && ' • Mit gewähltem Hintergrund'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleCreate(template)}
                  />
                ))}
              </div>

              {isCreating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Preisliste wird erstellt...</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Hintergrund
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
