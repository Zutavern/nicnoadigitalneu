'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Settings2, Eye, EyeOff, RotateCcw } from 'lucide-react'

// ============== TYPES ==============

export interface WidgetConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ElementType
}

// ============== HOOK ==============

export function useWidgetConfig(storageKey: string, defaultConfig: WidgetConfig[]) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge saved config with defaults to handle new widgets
        const merged = defaultConfig.map(defaultWidget => {
          const savedWidget = parsed.find((w: { id: string; enabled: boolean }) => w.id === defaultWidget.id)
          return savedWidget ? { ...defaultWidget, enabled: savedWidget.enabled } : defaultWidget
        })
        setWidgets(merged)
      } catch {
        setWidgets(defaultConfig)
      }
    }
    setIsLoaded(true)
  }, [storageKey, defaultConfig])

  const saveWidgets = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(storageKey, JSON.stringify(newWidgets.map(w => ({ id: w.id, enabled: w.enabled }))))
  }, [storageKey])

  const toggleWidget = useCallback((id: string) => {
    const newWidgets = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    saveWidgets(newWidgets)
  }, [widgets, saveWidgets])

  const resetWidgets = useCallback(() => {
    saveWidgets(defaultConfig)
  }, [saveWidgets, defaultConfig])

  const isEnabled = useCallback((id: string) => {
    return widgets.find(w => w.id === id)?.enabled ?? true
  }, [widgets])

  return { widgets, toggleWidget, resetWidgets, isEnabled, isLoaded }
}

// ============== SETTINGS PANEL COMPONENT ==============

interface WidgetSettingsPanelProps {
  widgets: WidgetConfig[]
  onToggle: (id: string) => void
  onReset: () => void
  title?: string
  description?: string
}

export function WidgetSettingsPanel({ 
  widgets, 
  onToggle, 
  onReset,
  title = 'Dashboard Widgets',
  description = 'Wähle aus, welche Widgets auf deinem Dashboard angezeigt werden sollen.'
}: WidgetSettingsPanelProps) {
  const enabledCount = widgets.filter(w => w.enabled).length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings2 className="h-4 w-4" />
          {enabledCount < widgets.length && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {enabledCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {title}
          </SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {enabledCount} von {widgets.length} Widgets aktiv
            </p>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            {widgets.map((widget) => {
              const Icon = widget.icon
              return (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    widget.enabled 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                      widget.enabled 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label 
                        htmlFor={widget.id} 
                        className={`font-medium cursor-pointer ${!widget.enabled && 'text-muted-foreground'}`}
                      >
                        {widget.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {widget.enabled ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      id={widget.id}
                      checked={widget.enabled}
                      onCheckedChange={() => onToggle(widget.id)}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
        
        <SheetFooter>
          <p className="text-xs text-muted-foreground">
            Deine Einstellungen werden automatisch gespeichert.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

