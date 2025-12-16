'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Check, Pencil, X } from 'lucide-react'

interface AiReplySuggestionProps {
  suggestion: string
  onUse: (text: string) => void
  onDismiss: () => void
}

export function AiReplySuggestion({ suggestion, onUse, onDismiss }: AiReplySuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 dark:from-purple-500/10 dark:to-pink-500/10 dark:border-purple-500/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            AI-Antwortvorschlag
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestion Text */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {suggestion}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white"
          onClick={() => onUse(suggestion)}
        >
          <Check className="h-4 w-4 mr-2" />
          Übernehmen & Bearbeiten
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-purple-500/30 dark:text-purple-500 dark:hover:bg-purple-500/10"
          onClick={() => onUse(suggestion)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Direkt senden
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/70 mt-3">
        Überprüfe den Vorschlag vor dem Senden. AI-Antworten sollten immer personalisiert werden.
      </p>
    </motion.div>
  )
}

