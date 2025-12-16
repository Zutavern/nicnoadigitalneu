'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PRICELIST_TEMPLATES, type PriceListTemplate } from '@/lib/pricelist/templates'
import { FileText, Sparkles, Check } from 'lucide-react'

interface TemplateSelectorProps {
  onSelectTemplate: (template: PriceListTemplate) => void
  trigger?: React.ReactNode
}

const CATEGORY_LABELS: Record<PriceListTemplate['category'], string> = {
  minimal: 'Minimalistisch',
  elegant: 'Elegant',
  modern: 'Modern',
  classic: 'Klassisch',
  bold: 'Auffällig',
}

const CATEGORY_COLORS: Record<PriceListTemplate['category'], string> = {
  minimal: 'bg-gray-100 text-gray-800',
  elegant: 'bg-amber-100 text-amber-800',
  modern: 'bg-blue-100 text-blue-800',
  classic: 'bg-stone-100 text-stone-800',
  bold: 'bg-red-100 text-red-800',
}

export function TemplateSelector({ onSelectTemplate, trigger }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleSelect = () => {
    const template = PRICELIST_TEMPLATES.find(t => t.id === selectedId)
    if (template) {
      onSelectTemplate(template)
      setOpen(false)
      setSelectedId(null)
    }
  }

  const handleTemplateClick = (template: PriceListTemplate) => {
    if (selectedId === template.id) {
      // Doppelklick = direkt auswählen
      onSelectTemplate(template)
      setOpen(false)
      setSelectedId(null)
    } else {
      setSelectedId(template.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Mit Vorlage starten
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vorlage auswählen
          </DialogTitle>
          <DialogDescription>
            Starte mit einer professionellen Vorlage und passe sie nach deinen Wünschen an
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            <AnimatePresence mode="popLayout">
              {PRICELIST_TEMPLATES.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handleTemplateClick(template)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                      'bg-card hover:bg-accent/5',
                      selectedId === template.id
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    {/* Thumbnail & Badge */}
                    <div className="relative mb-3">
                      <div className={cn(
                        'w-full aspect-[3/4] rounded-lg flex items-center justify-center text-5xl',
                        'bg-gradient-to-br from-muted/50 to-muted transition-colors',
                        hoveredId === template.id && 'from-primary/10 to-primary/5'
                      )}>
                        {template.thumbnail}
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedId === template.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={cn('text-xs', CATEGORY_COLORS[template.category])}
                        >
                          {CATEGORY_LABELS[template.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{template.blocks.length} Blöcke</span>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedId 
              ? `"${PRICELIST_TEMPLATES.find(t => t.id === selectedId)?.name}" ausgewählt`
              : 'Klicke auf eine Vorlage zum Auswählen'
            }
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSelect}
              disabled={!selectedId}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Vorlage verwenden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

