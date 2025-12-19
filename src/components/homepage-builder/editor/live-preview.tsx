'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  FileText, 
  Clock, 
  Sparkles,
  Monitor,
  Smartphone,
  Code,
  ExternalLink,
  Pencil,
  Copy,
  Download,
  RefreshCw,
  MoreVertical,
  Image,
  Share2,
  FileCode,
  Maximize2,
  Code2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomepagePage, HomepageProjectClient } from '@/lib/homepage-builder'
import { DESIGN_STYLE_CONFIGS } from '@/lib/homepage-builder'
import { PromptLibraryButton } from './prompt-library-button'

interface LivePreviewProps {
  page: HomepagePage | undefined
  project: HomepageProjectClient
  previewMode: 'desktop' | 'mobile'
  onRegenerate?: (pageSlug: string) => void
  onPrompt?: (pageSlug: string, prompt: string) => Promise<void>
  isPrompting?: boolean
}

export function LivePreview({ page, project, previewMode, onRegenerate, onPrompt, isPrompting }: LivePreviewProps) {
  const designConfig = DESIGN_STYLE_CONFIGS[project.designStyle]
  const primaryColor = project.brandingColor || '#10b981'
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [promptInput, setPromptInput] = useState('')

  // Prompt absenden
  const handleSubmitPrompt = async () => {
    if (!promptInput.trim() || !page || !onPrompt) return
    
    await onPrompt(page.slug, promptInput.trim())
    setPromptInput('')
  }

  // Enter-Taste zum Absenden
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPrompt()
    }
  }

  // Code kopieren
  const handleCopyCode = async () => {
    if (page?.generatedCode) {
      await navigator.clipboard.writeText(page.generatedCode)
      setCopiedCode(true)
      toast.success('Code in Zwischenablage kopiert!')
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  // Code als Datei herunterladen
  const handleDownloadCode = () => {
    if (page?.generatedCode) {
      const blob = new Blob([page.generatedCode], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page.slug || 'page'}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Datei heruntergeladen!')
    }
  }

  // Link teilen
  const handleShare = async () => {
    const shareUrl = page?.v0WebUrl || page?.v0DemoUrl
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link kopiert!')
    }
  }

  // Generierte Vorschau oder Platzhalter
  const previewContent = useMemo(() => {
    if (!page) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-30" />
          <p>Keine Seite ausgewählt</p>
        </div>
      )
    }

    if (!page.isGenerated) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <div className="relative mb-6">
            <Clock className="h-16 w-16 opacity-30" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
          </div>
          <p className="text-lg font-medium mb-2">Seite noch nicht generiert</p>
          <p className="text-sm text-center max-w-md">
            Klicke auf &quot;Homepage generieren&quot; um diese Seite mit KI zu erstellen.
          </p>
        </div>
      )
    }

    // Wenn V0 Demo-URL vorhanden, zeige iframe (ohne Prompt-Fenster, das kommt separat)
    if (page.v0DemoUrl) {
      return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden" data-has-prompt="true">
          {/* Kompakte Toolbar */}
          <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                V0
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">
                {page.title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                onClick={() => setShowCodeDialog(true)}
              >
                <Code2 className="h-3.5 w-3.5 mr-1" />
                Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                onClick={handleCopyCode}
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                onClick={() => window.open(page.v0DemoUrl, '_blank')}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowCodeDialog(true)}>
                    <FileCode className="h-4 w-4 mr-2" />
                    Code anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Als HTML herunterladen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Link teilen
                  </DropdownMenuItem>
                  {onRegenerate && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onRegenerate(page.slug)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Komplett neu generieren
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* iframe Preview - nimmt den verfügbaren Platz */}
          <div className="flex-1 relative bg-white min-h-0">
            {/* Loading Overlay */}
            {isPrompting && (
              <div className="absolute inset-0 bg-zinc-900/90 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="relative">
                    <Sparkles className="h-16 w-16 text-emerald-500 animate-pulse mx-auto" />
                    <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-white font-medium mt-4">V0 generiert Änderungen...</p>
                  <p className="text-zinc-400 text-sm mt-1">Das kann einige Sekunden dauern</p>
                </div>
              </div>
            )}
            <iframe
              src={page.v0DemoUrl}
              className="absolute inset-0 w-full h-full border-0"
              title={`Preview: ${page.title}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      )
    }

    // Prüfe ob generatedCode vollständiges HTML ist (beginnt mit <!DOCTYPE oder <html)
    const isFullHtml = page.generatedCode && (
      page.generatedCode.trim().startsWith('<!DOCTYPE') || 
      page.generatedCode.trim().startsWith('<html')
    )

    // Wenn vollständiges HTML vorhanden (Mock-Generierung), zeige es
    if (isFullHtml && page.generatedCode) {
      return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
          {/* Preview Mode Badge */}
          <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Preview
              </Badge>
              <span className="text-xs text-zinc-400">{page.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                onClick={() => setShowCodeDialog(true)}
              >
                <Code2 className="h-3.5 w-3.5 mr-1" />
                Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                onClick={handleDownloadCode}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {/* iframe mit srcdoc */}
          <div className="flex-1 relative bg-white min-h-0">
            {isPrompting && (
              <div className="absolute inset-0 bg-zinc-900/90 flex items-center justify-center z-10">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-white font-medium mt-4">Generiere mit V0...</p>
                </div>
              </div>
            )}
            <iframe
              srcDoc={page.generatedCode}
              className="absolute inset-0 w-full h-full border-0"
              title={`Preview: ${page.title}`}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )
    }

    // Fallback: Mock-Vorschau einer generierten Seite
    return (
      <div className="h-full overflow-auto">
        {/* Mini-Header */}
        <header 
          className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2">
            {project.brandingLogoUrl ? (
              <div className="w-8 h-8 bg-white/20 rounded" />
            ) : (
              <span className="text-white font-bold text-lg">{project.name}</span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-4">
            {(project.pages as HomepagePage[]).slice(0, 5).map(p => (
              <span 
                key={p.slug}
                className={cn(
                  "text-sm text-white/80 hover:text-white cursor-pointer",
                  p.slug === page.slug && "text-white font-medium"
                )}
              >
                {p.title}
              </span>
            ))}
          </nav>
        </header>

        {/* Page Content */}
        <div className="min-h-screen">
          {page.slug === 'home' && (
            <HomePagePreview 
              project={project} 
              primaryColor={primaryColor}
              designConfig={designConfig}
            />
          )}
          {page.slug === 'ueber-mich' && (
            <AboutPagePreview 
              project={project} 
              primaryColor={primaryColor}
            />
          )}
          {page.slug === 'kontakt' && (
            <ContactPagePreview 
              project={project} 
              primaryColor={primaryColor}
            />
          )}
          {!['home', 'ueber-mich', 'kontakt'].includes(page.slug) && (
            <GenericPagePreview 
              page={page}
              primaryColor={primaryColor}
            />
          )}
        </div>

        {/* Mini-Footer */}
        <footer className="bg-gray-900 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-400 mb-2">
              © {new Date().getFullYear()} {project.name}
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>Impressum</span>
              <span>Datenschutz</span>
            </div>
          </div>
        </footer>
      </div>
    )
  }, [page, project, primaryColor, designConfig])

  // Prüfen ob Prompt-Fenster angezeigt werden soll (V0-generiert oder Mock mit Code)
  const showPromptField = page?.isGenerated && (page?.v0DemoUrl || page?.generatedCode)

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
      {/* Preview Container - Begrenzt auf verfügbare Höhe */}
      <Card 
        className={cn(
          "flex-1 overflow-hidden bg-white flex flex-col min-h-0",
          "rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700"
        )}
      >
        {previewContent}
      </Card>

      {/* PROMPT-FENSTER - Außerhalb des useMemo für reaktives State-Handling */}
      {showPromptField && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg mt-3 p-3 flex-shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitPrompt()}
                placeholder="Beschreibe Änderungen... z.B. 'Header vergrößern' oder 'Farben ändern'"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                disabled={isPrompting}
              />
            </div>
            {/* Prompt Library Button */}
            {page && (
              <PromptLibraryButton
                pageSlug={page.slug}
                templateType={project.templateType}
                onSelectPrompt={(prompt) => setPromptInput(prompt)}
                disabled={isPrompting}
              />
            )}
            <Button
              onClick={handleSubmitPrompt}
              disabled={!promptInput.trim() || isPrompting}
              className={cn(
                "px-4 rounded-lg shrink-0",
                promptInput.trim() && !isPrompting
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {isPrompting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Ändern
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Generierter Code - {page?.title}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">HTML Preview</TabsTrigger>
              <TabsTrigger value="code">Quellcode</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                {page?.generatedCode && (
                  <iframe
                    srcDoc={page.generatedCode}
                    className="w-full h-[400px] border-0"
                    title="Code Preview"
                    sandbox="allow-scripts"
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="code" className="mt-4">
              <ScrollArea className="h-[400px] w-full rounded-lg border bg-zinc-950">
                <pre className="p-4 text-sm text-zinc-300 font-mono whitespace-pre-wrap break-all">
                  <code>{page?.generatedCode || 'Kein Code verfügbar'}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCopyCode}>
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-500" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Code kopieren
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDownloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Herunterladen
            </Button>
            {page?.v0WebUrl && (
              <Button onClick={() => window.open(page.v0WebUrl, '_blank')}>
                <Pencil className="h-4 w-4 mr-2" />
                In V0 bearbeiten
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Vorschau-Komponenten für verschiedene Seiten-Typen
function HomePagePreview({ 
  project, 
  primaryColor,
  designConfig 
}: { 
  project: HomepageProjectClient
  primaryColor: string
  designConfig: typeof DESIGN_STYLE_CONFIGS[keyof typeof DESIGN_STYLE_CONFIGS]
}) {
  return (
    <>
      {/* Hero */}
      <section 
        className="relative py-20 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
          <p className="text-lg text-gray-600 mb-8">
            Willkommen bei uns – Dein Experte für perfektes Styling
          </p>
          <button
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ 
              backgroundColor: primaryColor,
              borderRadius: designConfig.cssVariables.borderRadius
            }}
          >
            Termin buchen
          </button>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Unsere Leistungen</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Schneiden', 'Färben', 'Styling'].map((service) => (
              <div 
                key={service}
                className="p-6 bg-gray-50 rounded-xl text-center"
                style={{ borderRadius: designConfig.cssVariables.borderRadius }}
              >
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}20` }}
                />
                <h3 className="font-semibold mb-2">{service}</h3>
                <p className="text-sm text-gray-600">Professionelle Beratung und Umsetzung</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function AboutPagePreview({ 
  project, 
  primaryColor 
}: { 
  project: HomepageProjectClient
  primaryColor: string
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Über mich</h1>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div 
            className="aspect-square bg-gray-200 rounded-2xl"
            style={{ backgroundColor: `${primaryColor}10` }}
          />
          <div>
            <p className="text-gray-600 mb-4">
              Mit jahrelanger Erfahrung und Leidenschaft für das Handwerk 
              bin ich Ihr Ansprechpartner für alle Fragen rund ums Styling.
            </p>
            <p className="text-gray-600 mb-4">
              Mein Ziel ist es, jeden Kunden individuell zu beraten und 
              das perfekte Ergebnis zu erzielen.
            </p>
            <ul className="space-y-2">
              {['10+ Jahre Erfahrung', 'Zertifizierte Ausbildung', 'Regelmäßige Fortbildungen'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactPagePreview({ 
  project, 
  primaryColor 
}: { 
  project: HomepageProjectClient
  primaryColor: string
}) {
  const contactData = project.contactData as { 
    street?: string
    zipCode?: string
    city?: string
    phone?: string
    email?: string
  } | null

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Kontakt</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold mb-4">Kontaktinformationen</h2>
            <div className="space-y-4 text-gray-600">
              <p>{contactData?.street}</p>
              <p>{contactData?.zipCode} {contactData?.city}</p>
              <p>{contactData?.phone}</p>
              <p>{contactData?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="Name" 
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input 
              placeholder="E-Mail" 
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea 
              placeholder="Nachricht" 
              rows={4}
              className="w-full px-4 py-2 border rounded-lg resize-none"
            />
            <button
              className="w-full px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Nachricht senden
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function GenericPagePreview({ 
  page, 
  primaryColor 
}: { 
  page: HomepagePage
  primaryColor: string
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div 
          className="mt-8 h-48 rounded-xl"
          style={{ backgroundColor: `${primaryColor}10` }}
        />
      </div>
    </section>
  )
}

