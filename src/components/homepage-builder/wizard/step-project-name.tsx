'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Sparkles } from 'lucide-react'
import { generateSlug } from '@/lib/homepage-builder'

interface StepProjectNameProps {
  value: string
  onChange: (value: string) => void
  slug: string
}

export function StepProjectName({ value, onChange, slug }: StepProjectNameProps) {
  const generatedSlug = generateSlug(value)
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Wie soll deine Homepage heißen?</h2>
        <p className="text-muted-foreground mt-2">
          Wähle einen Namen für dein Projekt. Dieser wird auch in der URL verwendet.
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="projectName">Projekt-Name</Label>
          <Input
            id="projectName"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="z.B. Mein Salon, Hair by Lisa..."
            className="text-lg"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground text-right">
            {value.length}/50 Zeichen
          </p>
        </div>

        {value.length >= 3 && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Deine Website-Adresse:
            </p>
            <p className="text-lg font-mono bg-background px-3 py-2 rounded border">
              <span className="text-muted-foreground">https://</span>
              <span className="text-primary font-semibold">{generatedSlug}</span>
              <span className="text-muted-foreground">.nicnoa.online</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-8">
        <p className="text-sm text-muted-foreground w-full text-center mb-2">
          Inspirationen:
        </p>
        {['Hair Studio', 'Style Lounge', 'Beauty Corner', 'Mein Salon'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onChange(suggestion)}
            className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}



