'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Check, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAGE_CONFIG_OPTIONS } from '@/lib/homepage-builder'
import type { HomepagePageConfig } from '@/lib/homepage-builder'

interface StepPageConfigProps {
  value: HomepagePageConfig | null
  onChange: (value: HomepagePageConfig) => void
  userRole: 'STYLIST' | 'SALON_OWNER'
}

export function StepPageConfig({ value, onChange, userRole }: StepPageConfigProps) {
  // Nur Optionen für die aktuelle Rolle zeigen
  const options = PAGE_CONFIG_OPTIONS.filter(
    opt => opt.forRole === userRole || opt.forRole === 'BOTH'
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Layers className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Wie umfangreich soll deine Homepage sein?</h2>
        <p className="text-muted-foreground mt-2">
          Wähle die Anzahl der Seiten, die deine Homepage haben soll.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value
          
          return (
            <Card
              key={`${option.value}-${option.forRole}`}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => onChange(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {option.label}
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <Badge variant={isSelected ? "default" : "secondary"}>
                    {option.pages.length} {option.pages.length === 1 ? 'Seite' : 'Seiten'}
                  </Badge>
                </div>
                
                <div className="space-y-1.5">
                  {option.pages.map((page, index) => (
                    <div 
                      key={page.slug}
                      className={cn(
                        "flex items-center gap-2 text-sm py-1 px-2 rounded",
                        index % 2 === 0 ? "bg-muted/50" : ""
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{page.title}</span>
                      {page.required && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Pflicht
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Tipp: Du kannst mit weniger Seiten starten und später erweitern.
      </p>
    </div>
  )
}



