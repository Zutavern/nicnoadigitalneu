"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Ban, CheckCircle2, RefreshCcw, Trash2, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ConfirmationDialog, ConfirmationAction } from "./confirmation-dialog"

export interface BulkAction {
  id: string
  label: string
  icon: React.ElementType
  variant?: "default" | "destructive" | "warning"
  action: ConfirmationAction
  confirmText: string
  title: string
  description: string
  requireReason?: boolean
  onExecute: (ids: string[], reason?: string) => Promise<void>
}

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
  actions: BulkAction[]
  idAccessor: (row: TData) => string
  itemType?: string // z.B. "Benutzer", "Salon"
}

// Vordefinierte Standard-Aktionen
export const createDeleteAction = (
  onExecute: (ids: string[], reason?: string) => Promise<void>,
  itemType: string = "Einträge"
): BulkAction => ({
  id: "delete",
  label: "Löschen",
  icon: Trash2,
  variant: "destructive",
  action: "delete",
  confirmText: "LÖSCHEN",
  title: `${itemType} löschen`,
  description: `Möchten Sie die ausgewählten ${itemType.toLowerCase()} wirklich löschen? Sie werden für 30 Tage in den Papierkorb verschoben.`,
  onExecute,
})

export const createBlockAction = (
  onExecute: (ids: string[], reason?: string) => Promise<void>,
  itemType: string = "Benutzer"
): BulkAction => ({
  id: "block",
  label: "Sperren",
  icon: Ban,
  variant: "warning",
  action: "block",
  confirmText: "SPERREN",
  title: `${itemType} sperren`,
  description: `Möchten Sie die ausgewählten ${itemType.toLowerCase()} wirklich sperren? Sie können sich nicht mehr einloggen.`,
  requireReason: true,
  onExecute,
})

export const createUnblockAction = (
  onExecute: (ids: string[], reason?: string) => Promise<void>,
  itemType: string = "Benutzer"
): BulkAction => ({
  id: "unblock",
  label: "Entsperren",
  icon: Shield,
  variant: "default",
  action: "unblock",
  confirmText: "ENTSPERREN",
  title: `${itemType} entsperren`,
  description: `Möchten Sie die ausgewählten ${itemType.toLowerCase()} entsperren? Sie können sich wieder einloggen.`,
  onExecute,
})

export const createRestoreAction = (
  onExecute: (ids: string[], reason?: string) => Promise<void>,
  itemType: string = "Einträge"
): BulkAction => ({
  id: "restore",
  label: "Wiederherstellen",
  icon: RefreshCcw,
  variant: "default",
  action: "restore",
  confirmText: "WIEDERHERSTELLEN",
  title: `${itemType} wiederherstellen`,
  description: `Möchten Sie die ausgewählten ${itemType.toLowerCase()} wiederherstellen?`,
  onExecute,
})

export function DataTableBulkActions<TData>({
  table,
  actions,
  idAccessor,
  itemType = "Einträge",
}: DataTableBulkActionsProps<TData>) {
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean
    action: BulkAction | null
    ids: string[]
  }>({
    open: false,
    action: null,
    ids: [],
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  const selectedIds = selectedRows.map((row) => idAccessor(row.original))

  const handleActionClick = (action: BulkAction) => {
    setConfirmDialog({
      open: true,
      action,
      ids: selectedIds,
    })
  }

  const handleConfirm = async (reason?: string) => {
    if (!confirmDialog.action) return

    setIsLoading(true)
    try {
      await confirmDialog.action.onExecute(confirmDialog.ids, reason)
      // Nach erfolgreicher Aktion: Selection zurücksetzen
      table.resetRowSelection()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    if (!isLoading) {
      setConfirmDialog({ open: false, action: null, ids: [] })
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xl px-4 py-3">
          {/* Selected Count */}
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {selectedCount === 1 ? `${itemType.replace(/e$/, '')} ausgewählt` : `${itemType} ausgewählt`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant === "destructive" ? "destructive" : action.variant === "warning" ? "outline" : "outline"}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    "h-8",
                    action.variant === "warning" && "border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              )
            })}
          </div>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="h-8 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.action && (
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => !open && handleCloseDialog()}
          action={confirmDialog.action.action}
          title={confirmDialog.action.title}
          description={confirmDialog.action.description}
          confirmText={confirmDialog.action.confirmText}
          onConfirm={handleConfirm}
          requireReason={confirmDialog.action.requireReason}
          itemCount={confirmDialog.ids.length}
          itemType={itemType}
          variant={confirmDialog.action.variant}
          isLoading={isLoading}
        />
      )}
    </>
  )
}






