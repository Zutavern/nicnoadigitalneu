'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sparkles,
  Loader2,
  Wand2,
  Minimize2,
  Maximize2,
  MessageSquare,
  Briefcase,
  Coffee,
  SpellCheck,
  Check,
  X,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'

interface AITextImproverProps {
  editor: Editor | null
}

type ImprovementType = 'improve' | 'shorter' | 'longer' | 'professional' | 'casual' | 'fix-grammar'

const IMPROVEMENT_OPTIONS: Array<{
  type: ImprovementType
  label: string
  icon: React.ReactNode
  description: string
}> = [
  { type: 'improve', label: 'Verbessern', icon: <Wand2 className="h-4 w-4" />, description: 'Klarer und ansprechender' },
  { type: 'shorter', label: 'Kürzer', icon: <Minimize2 className="h-4 w-4" />, description: 'Auf das Wesentliche' },
  { type: 'longer', label: 'Länger', icon: <Maximize2 className="h-4 w-4" />, description: 'Mit mehr Details' },
  { type: 'professional', label: 'Professioneller', icon: <Briefcase className="h-4 w-4" />, description: 'Formeller Ton' },
  { type: 'casual', label: 'Lockerer', icon: <Coffee className="h-4 w-4" />, description: 'Entspannter Ton' },
  { type: 'fix-grammar', label: 'Korrigieren', icon: <SpellCheck className="h-4 w-4" />, description: 'Grammatik & Rechtschreibung' },
]

export function AITextImprover({ editor }: AITextImproverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [isImproving, setIsImproving] = useState(false)
  const [improvedText, setImprovedText] = useState('')
  const [activeType, setActiveType] = useState<ImprovementType | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [showButton, setShowButton] = useState(false)

  // Überwache Text-Selektion
  const handleSelectionChange = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')

    if (text.trim().length > 10) {
      setSelectedText(text)
      
      // Berechne Position für den Button
      const domSelection = window.getSelection()
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        setButtonPosition({
          top: rect.top - 45,
          left: rect.left + rect.width / 2 - 50,
        })
        setShowButton(true)
      }
    } else {
      setShowButton(false)
      setSelectedText('')
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.on('selectionUpdate', handleSelectionChange)
    
    // Auch auf mouseup reagieren für bessere UX
    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10)
    }
    
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [editor, handleSelectionChange])

  // Verstecke Button wenn irgendwo geklickt wird (außer auf den Button selbst)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node) && !isOpen) {
        setShowButton(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isOpen])

  const improveText = async (type: ImprovementType) => {
    if (!selectedText.trim()) return

    setIsImproving(true)
    setActiveType(type)
    setImprovedText('')

    try {
      const res = await fetch('/api/admin/blog/generate/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, type }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Verbesserung')
      }

      setImprovedText(data.improvedText)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Verbesserung')
    } finally {
      setIsImproving(false)
    }
  }

  const applyImprovement = () => {
    if (!editor || !improvedText) return

    // Ersetze den ausgewählten Text mit dem verbesserten Text
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContent(improvedText).run()

    toast.success('Text ersetzt!')
    setIsOpen(false)
    setShowButton(false)
    setImprovedText('')
    setActiveType(null)
  }

  const resetImprovement = () => {
    setImprovedText('')
    setActiveType(null)
  }

  if (!editor) return null

  return (
    <>
      {/* Floating Button bei Selektion */}
      {showButton && !isOpen && (
        <div
          className="fixed z-50 animate-in fade-in slide-in-from-bottom-2"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
          }}
        >
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={buttonRef}
                size="sm"
                className="gap-1.5 shadow-lg bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <Sparkles className="h-3.5 w-3.5" />
                KI-Verbesserung
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="center" side="top">
              <div className="p-3 border-b">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Text verbessern
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedText.length} Zeichen ausgewählt
                </p>
              </div>

              {!improvedText ? (
                <div className="p-2 grid grid-cols-2 gap-1">
                  {IMPROVEMENT_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => improveText(option.type)}
                      disabled={isImproving}
                      className={`flex items-center gap-2 p-2 text-left rounded-lg transition-colors ${
                        isImproving && activeType === option.type
                          ? 'bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {isImproving && activeType === option.type ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <span className="text-primary">{option.icon}</span>
                      )}
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Vorschlag:</p>
                    <div className="p-2 bg-muted/50 rounded-lg text-sm max-h-[150px] overflow-y-auto">
                      {improvedText}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={resetImprovement}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Andere Option
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={applyImprovement}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Übernehmen
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  )
}
