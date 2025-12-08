'use client'

import { Table } from '@tanstack/react-table'
import { X, Search, RefreshCw, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

// Helper function to get nested values from an object
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

// CSV Export configuration
interface ExportColumn {
  key: string           // Pfad zum Wert (z.B. 'owner.email')
  header: string        // Spaltenüberschrift im CSV
  transform?: (value: unknown) => string  // Optional: Wert transformieren
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  filterableColumns?: {
    id: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  }[]
  isLoading?: boolean
  onRefresh?: () => void
  toolbarActions?: React.ReactNode
  exportConfig?: {
    filename: string
    columns: ExportColumn[]
  }
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Suchen...',
  filterableColumns = [],
  isLoading = false,
  onRefresh,
  toolbarActions,
  exportConfig,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // CSV Export Funktion
  const handleExport = () => {
    if (!exportConfig) return

    const { filename, columns } = exportConfig
    
    // Gefilterte Daten aus der Tabelle holen
    const data = table.getFilteredRowModel().rows.map(row => row.original)
    
    // Header-Zeile erstellen
    const headers = columns.map(col => `"${col.header}"`).join(';')
    
    // Daten-Zeilen erstellen
    const rows = data.map(row => {
      return columns.map(col => {
        const value = getNestedValue(row, col.key)
        // Optional: Transformation anwenden
        const displayValue = col.transform ? col.transform(value) : value
        // CSV-Escape: Anführungszeichen verdoppeln, Wert in Anführungszeichen setzen
        const escaped = String(displayValue ?? '').replace(/"/g, '""')
        return `"${escaped}"`
      }).join(';')
    })
    
    // CSV zusammenbauen (mit BOM für Excel-Kompatibilität)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    
    // Download triggern
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-9 w-[150px] lg:w-[250px] pl-8"
            />
          </div>
        )}
        {filterableColumns.map((column) =>
          table.getColumn(column.id) ? (
            <DataTableFacetedFilter
              key={column.id}
              column={table.getColumn(column.id)}
              title={column.title}
              options={column.options}
            />
          ) : null
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Zurücksetzen
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        )}
        {exportConfig && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
        <DataTableViewOptions table={table} />
        {toolbarActions}
      </div>
    </div>
  )
}

