'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Globe, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  Paintbrush,
  Sparkles,
  Check,
  FileText
} from 'lucide-react'
import { 
  PAGE_CONFIG_OPTIONS, 
  DESIGN_STYLE_CONFIGS,
  generateSlug 
} from '@/lib/homepage-builder'
import type { WizardState } from '@/lib/homepage-builder'

interface StepReviewProps {
  state: WizardState
  userRole: 'STYLIST' | 'SALON_OWNER'
}

export function StepReview({ state, userRole }: StepReviewProps) {
  const pageConfig = PAGE_CONFIG_OPTIONS.find(
    opt => opt.value === state.pageConfig && opt.forRole === userRole
  )
  const designConfig = state.designStyle ? DESIGN_STYLE_CONFIGS[state.designStyle] : null

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Alles bereit!</h2>
        <p className="text-muted-foreground mt-2">
          Überprüfe deine Angaben und starte die Erstellung deiner Homepage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Projekt-Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Projekt</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{state.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">URL</p>
                <p className="font-mono text-sm">
                  {generateSlug(state.projectName)}.nicnoa.online
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontaktdaten */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Kontaktdaten</h3>
            </div>
            <div className="space-y-2 text-sm">
              {state.contactData?.salonName && (
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Salon:</span>
                  {state.contactData.salonName}
                </p>
              )}
              <p className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {state.contactData?.name || '-'}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {state.contactData?.email || '-'}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {state.contactData?.phone || '-'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {state.contactData?.street}, {state.contactData?.zipCode} {state.contactData?.city}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seiten */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Seiten</h3>
              <Badge variant="secondary" className="ml-auto">
                {pageConfig?.pages.length || 0} Seiten
              </Badge>
            </div>
            <div className="space-y-1">
              {pageConfig?.pages.map((page) => (
                <div 
                  key={page.slug}
                  className="flex items-center gap-2 text-sm py-1"
                >
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{page.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Design */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Paintbrush className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Design</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Stil</p>
                <p className="font-medium">{designConfig?.label || '-'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {designConfig?.description}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Primärfarbe</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg shadow-sm border"
                    style={{ backgroundColor: state.brandingColor }}
                  />
                  <span className="font-mono text-sm">{state.brandingColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Was passiert als nächstes */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Was passiert als nächstes?
          </h3>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              <span>Dein Projekt wird erstellt und der Editor öffnet sich</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              <span>Klicke auf &quot;Generieren&quot; um deine Homepage mit KI zu erstellen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              <span>Passe einzelne Seiten nach deinen Wünschen an</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
              <span>Veröffentliche deine Homepage mit einem Klick!</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}



