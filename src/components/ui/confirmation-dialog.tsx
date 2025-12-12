"use client"

import * as React from "react"
import { AlertTriangle, Ban, Trash2, RefreshCcw, Shield, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ConfirmationAction = "delete" | "block" | "unblock" | "restore" | "custom"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: ConfirmationAction
  title: string
  description: string
  confirmText: string // Text der eingegeben werden muss (z.B. "LÖSCHEN")
  onConfirm: (reason?: string) => void | Promise<void>
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  itemCount?: number // Anzahl der betroffenen Items
  itemType?: string // z.B. "Benutzer", "Salon"
  variant?: "destructive" | "warning" | "default"
  isLoading?: boolean
}

const actionConfig: Record<ConfirmationAction, { icon: React.ElementType; defaultVariant: "destructive" | "warning" | "default" }> = {
  delete: { icon: Trash2, defaultVariant: "destructive" },
  block: { icon: Ban, defaultVariant: "warning" },
  unblock: { icon: Shield, defaultVariant: "default" },
  restore: { icon: RefreshCcw, defaultVariant: "default" },
  custom: { icon: AlertTriangle, defaultVariant: "warning" },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  action,
  title,
  description,
  confirmText,
  onConfirm,
  requireReason = false,
  reasonLabel = "Grund (optional)",
  reasonPlaceholder = "Bitte geben Sie einen Grund an...",
  itemCount = 1,
  itemType = "Element",
  variant,
  isLoading = false,
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const config = actionConfig[action]
  const Icon = config.icon
  const finalVariant = variant ?? config.defaultVariant

  const isConfirmEnabled = inputValue.toLowerCase() === confirmText.toLowerCase() && 
    (!requireReason || reason.trim().length > 0)

  const handleConfirm = async () => {
    if (!isConfirmEnabled) {
      setError(`Bitte geben Sie "${confirmText}" ein, um fortzufahren.`)
      return
    }

    try {
      await onConfirm(reason || undefined)
      // Reset auf schließen
      setInputValue("")
      setReason("")
      setError(null)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setInputValue("")
      setReason("")
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                finalVariant === "destructive" && "bg-red-100 dark:bg-red-900/30",
                finalVariant === "warning" && "bg-amber-100 dark:bg-amber-900/30",
                finalVariant === "default" && "bg-blue-100 dark:bg-blue-900/30"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  finalVariant === "destructive" && "text-red-600 dark:text-red-400",
                  finalVariant === "warning" && "text-amber-600 dark:text-amber-400",
                  finalVariant === "default" && "text-blue-600 dark:text-blue-400"
                )}
              />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">
                {title}
                {itemCount > 1 && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({itemCount} {itemType})
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warnung Box */}
          <div
            className={cn(
              "rounded-lg border p-4 text-sm",
              finalVariant === "destructive" && "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
              finalVariant === "warning" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
              finalVariant === "default" && "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
            )}
          >
            {action === "delete" && (
              <>
                <strong>Hinweis:</strong> Diese Aktion verschiebt {itemCount > 1 ? "die ausgewählten Einträge" : "den Eintrag"} in den Papierkorb. 
                Nach 30 Tagen wird {itemCount > 1 ? "werden sie" : "er"} automatisch endgültig gelöscht. 
                Bis dahin kann {itemCount > 1 ? "können sie" : "er"} wiederhergestellt werden.
              </>
            )}
            {action === "block" && (
              <>
                <strong>Hinweis:</strong> Gesperrte {itemCount > 1 ? "Nutzer können" : "Nutzer kann"} sich nicht mehr einloggen und haben keinen Zugriff auf die Plattform.
                Die Sperrung kann jederzeit aufgehoben werden.
              </>
            )}
            {action === "unblock" && (
              <>
                <strong>Hinweis:</strong> Nach der Entsperrung {itemCount > 1 ? "können die Nutzer" : "kann der Nutzer"} sich wieder normal einloggen und die Plattform nutzen.
              </>
            )}
            {action === "restore" && (
              <>
                <strong>Hinweis:</strong> {itemCount > 1 ? "Die ausgewählten Einträge werden" : "Der Eintrag wird"} wiederhergestellt und sind wieder vollständig verfügbar.
              </>
            )}
          </div>

          {/* Grund eingeben (bei Block/Delete) */}
          {(action === "block" || requireReason) && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                {action === "block" ? "Sperrgrund" : reasonLabel}
                {requireReason && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={action === "block" ? "Grund für die Sperrung angeben..." : reasonPlaceholder}
                className="min-h-[80px]"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Bestätigungseingabe */}
          <div className="space-y-2">
            <Label htmlFor="confirm-input">
              Geben Sie <span className="font-mono font-bold text-foreground">{confirmText}</span> ein, um fortzufahren
            </Label>
            <Input
              id="confirm-input"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(null)
              }}
              placeholder={confirmText}
              className={cn(
                "font-mono",
                error && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={isLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            variant={finalVariant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            className={cn(
              finalVariant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird ausgeführt...
              </>
            ) : (
              <>
                <Icon className="mr-2 h-4 w-4" />
                {action === "delete" && "Löschen"}
                {action === "block" && "Sperren"}
                {action === "unblock" && "Entsperren"}
                {action === "restore" && "Wiederherstellen"}
                {action === "custom" && "Bestätigen"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export a simpler hook for common use cases
export function useConfirmation() {
  const [state, setState] = React.useState<{
    open: boolean
    action: ConfirmationAction
    title: string
    description: string
    confirmText: string
    onConfirm: (reason?: string) => void | Promise<void>
    requireReason?: boolean
    itemCount?: number
    itemType?: string
    variant?: "destructive" | "warning" | "default"
  } | null>(null)

  const confirm = React.useCallback((options: Omit<typeof state, "open">) => {
    return new Promise<{ confirmed: boolean; reason?: string }>((resolve) => {
      setState({
        ...options!,
        open: true,
        onConfirm: async (reason) => {
          await options!.onConfirm(reason)
          resolve({ confirmed: true, reason })
        },
      })
    })
  }, [])

  const close = React.useCallback(() => {
    setState(null)
  }, [])

  return {
    confirm,
    close,
    dialogProps: state ? { ...state, open: true, onOpenChange: (open: boolean) => !open && close() } : null,
  }
}







