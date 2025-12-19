'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, GripVertical, List, ListOrdered, ListChecks, Check } from 'lucide-react'
import type { NewsletterBlock, TextAlign, ListStyle } from '@/lib/newsletter-builder/types'
import { LIST_STYLE_CONFIGS } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface ListBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function ListBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: ListBlockProps) {
  const listItems = block.listItems || []
  const listStyle = block.listStyle || 'bullet'
  const align = block.align || 'left'

  const addItem = () => {
    onChange({ listItems: [...listItems, 'Neuer Punkt'] })
  }

  const updateItem = (index: number, value: string) => {
    const newItems = listItems.map((item, i) => i === index ? value : item)
    onChange({ listItems: newItems })
  }

  const removeItem = (index: number) => {
    onChange({ listItems: listItems.filter((_, i) => i !== index) })
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Listen-Stil</Label>
            <Select
              value={listStyle}
              onValueChange={(v) => onChange({ listStyle: v as ListStyle })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(LIST_STYLE_CONFIGS) as [ListStyle, { label: string }][]).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ausrichtung</Label>
            <Select
              value={align}
              onValueChange={(v) => onChange({ align: v as TextAlign })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Links</SelectItem>
                <SelectItem value="center">Zentriert</SelectItem>
                <SelectItem value="right">Rechts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Listenelemente</Label>
          {listItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder="Listenpunkt..."
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Punkt hinzufügen
          </Button>
        </div>
      </div>
    )
  }

  // Preview Mode
  const ListIcon = listStyle === 'bullet' ? List : listStyle === 'number' ? ListOrdered : ListChecks

  return (
    <div className={cn(align === 'center' && 'text-center', align === 'right' && 'text-right')}>
      {listItems.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <ListIcon className="h-4 w-4" />
          <span className="text-xs">Leere Liste</span>
        </div>
      ) : (
        <ul className={cn(
          'text-sm space-y-1',
          listStyle === 'bullet' && 'list-disc pl-5',
          listStyle === 'number' && 'list-decimal pl-5',
          listStyle === 'check' && 'list-none pl-0'
        )}>
          {listItems.slice(0, 5).map((item, index) => (
            <li key={index} className={cn(listStyle === 'check' && 'flex items-center gap-2')}>
              {listStyle === 'check' && (
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: primaryColor }} />
              )}
              <span className="truncate">{item}</span>
            </li>
          ))}
          {listItems.length > 5 && (
            <li className="text-muted-foreground text-xs">+{listItems.length - 5} weitere</li>
          )}
        </ul>
      )}
    </div>
  )
}



