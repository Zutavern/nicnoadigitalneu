'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { PRICING_MODEL_CONFIGS } from '@/lib/pricelist/types'
import { THEME_OPTIONS } from '@/lib/pricelist/themes'
import { Ruler, Users, Palette, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import type { PricingModel } from '@prisma/client'

interface PricingModelWizardProps {
  onComplete: (data: {
    name: string
    pricingModel: PricingModel
    theme: string
    backgroundId?: string
  }) => void
  onCancel: () => void
  backgrounds: { id: string; url: string; filename: string }[]
}

export function PricingModelWizard({ onComplete, onCancel, backgrounds }: PricingModelWizardProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [pricingModel, setPricingModel] = useState<PricingModel>('BY_HAIR_LENGTH')
  const [theme, setTheme] = useState('elegant')
  const [backgroundId, setBackgroundId] = useState<string | undefined>()

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete({ name, pricingModel, theme, backgroundId })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onCancel()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                s < step && 'bg-primary text-primary-foreground',
                s === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                s > step && 'bg-muted text-muted-foreground'
              )}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Preisliste benennen</CardTitle>
            <CardDescription>
              Gib deiner Preisliste einen Namen, z.B. &quot;Hauptpreisliste&quot; oder &quot;Sommeraktion&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name der Preisliste</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Meine Preisliste"
                  className="mt-1"
                  autoFocus
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing Model */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Preismodell wählen</CardTitle>
            <CardDescription>
              Wie möchtest du deine Preise strukturieren? Dies bestimmt die Varianten für deine Dienstleistungen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={pricingModel}
              onValueChange={(value) => setPricingModel(value as PricingModel)}
              className="grid grid-cols-1 gap-4"
            >
              {Object.values(PRICING_MODEL_CONFIGS).map((config) => (
                <Label
                  key={config.model}
                  htmlFor={config.model}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    pricingModel === config.model
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  )}
                >
                  <RadioGroupItem value={config.model} id={config.model} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {config.model === 'BY_HAIR_LENGTH' ? (
                        <Ruler className="h-5 w-5 text-primary" />
                      ) : (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    <div className="mt-2 flex gap-2">
                      {config.defaultVariantLabels.map((label) => (
                        <span
                          key={label}
                          className="text-xs bg-muted px-2 py-0.5 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Theme & Background */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Design wählen</CardTitle>
            <CardDescription>
              Wähle ein Theme und optional einen Hintergrund für deine Preisliste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div>
              <Label className="mb-3 block">Theme</Label>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((t) => (
                  <div
                    key={t.value}
                    className={cn(
                      'p-3 rounded-lg border-2 cursor-pointer transition-all',
                      theme === t.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                    onClick={() => setTheme(t.value)}
                  >
                    <div
                      className="h-12 rounded mb-2"
                      style={{ background: t.preview }}
                    />
                    <div className="text-sm font-medium">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background */}
            {backgrounds.length > 0 && (
              <div>
                <Label className="mb-3 block">Hintergrund (optional)</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div
                    className={cn(
                      'aspect-[210/297] rounded border-2 cursor-pointer flex items-center justify-center bg-muted/50',
                      !backgroundId ? 'border-primary' : 'border-muted'
                    )}
                    onClick={() => setBackgroundId(undefined)}
                  >
                    <span className="text-xs text-muted-foreground">Keiner</span>
                  </div>
                  {backgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      className={cn(
                        'aspect-[210/297] rounded border-2 cursor-pointer overflow-hidden',
                        backgroundId === bg.id ? 'border-primary' : 'border-muted'
                      )}
                      onClick={() => setBackgroundId(bg.id)}
                    >
                      <img
                        src={bg.url}
                        alt={bg.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? 'Abbrechen' : 'Zurück'}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          {step === 3 ? 'Preisliste erstellen' : 'Weiter'}
          {step < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}


