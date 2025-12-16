'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Star,
  MessageSquare,
  Sparkles,
  Send,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Review } from '@/lib/google-business/types'
import { AiReplySuggestion } from './ai-reply-suggestion'

interface ReviewCardProps {
  review: Review
  aiSuggestion?: string
  onReply?: (reviewId: string, text: string) => void
  className?: string
}

export function ReviewCard({ review, aiSuggestion, onReply, className }: ReviewCardProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showAiSuggestion, setShowAiSuggestion] = useState(false)

  const isCritical = review.rating <= 2
  const isNew = review.isNew
  const hasReply = !!review.reply

  const handleSubmitReply = () => {
    if (replyText.trim() && onReply) {
      onReply(review.id, replyText.trim())
      setReplyText('')
      setIsReplying(false)
    }
  }

  const handleUseAiSuggestion = (text: string) => {
    setReplyText(text)
    setShowAiSuggestion(false)
    setIsReplying(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg border transition-colors',
        isCritical && !hasReply && 'border-rose-300 bg-rose-50 dark:border-red-500/30 dark:bg-red-500/5',
        isNew && !isCritical && !hasReply && 'border-amber-300 bg-amber-50 dark:border-yellow-500/30 dark:bg-yellow-500/5',
        hasReply && 'border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.authorPhotoUrl ? (
            <img
              src={review.authorPhotoUrl}
              alt={review.author}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {review.author.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-medium">{review.author}</span>
            
            {/* Stars */}
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= review.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>

            {/* Badges */}
            {isNew && !hasReply && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-500 dark:border-transparent text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Neu
              </Badge>
            )}
            {isCritical && !hasReply && (
              <Badge variant="destructive" className="bg-rose-500 text-white text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Kritisch
              </Badge>
            )}
            {hasReply && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-green-500/20 dark:text-green-500 dark:border-transparent text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Beantwortet
              </Badge>
            )}

            {/* Date */}
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(review.date, { addSuffix: true, locale: de })}
            </span>
          </div>

          {/* Review Text */}
          <p className="text-sm text-muted-foreground">{review.text}</p>

          {/* Existing Reply */}
          {review.reply && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Deine Antwort • {formatDistanceToNow(review.reply.date, { addSuffix: true, locale: de })}
              </p>
              <p className="text-sm">{review.reply.text}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!hasReply && !isReplying && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsReplying(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Antworten
              </Button>
              {aiSuggestion && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-violet-600 border-violet-300 hover:bg-violet-50 dark:text-purple-500 dark:border-purple-500/30 dark:hover:bg-purple-500/10"
                  onClick={() => setShowAiSuggestion(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Vorschlag
                </Button>
              )}
            </div>
          )}

          {/* AI Suggestion */}
          <AnimatePresence>
            {showAiSuggestion && aiSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <AiReplySuggestion
                  suggestion={aiSuggestion}
                  onUse={handleUseAiSuggestion}
                  onDismiss={() => setShowAiSuggestion(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply Form */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                <Textarea
                  placeholder="Schreibe eine Antwort..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {replyText.length} Zeichen
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyText('')
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Abbrechen
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Senden
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

