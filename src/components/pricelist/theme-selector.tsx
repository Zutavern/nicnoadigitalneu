'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { THEME_OPTIONS, THEMES } from '@/lib/pricelist/themes'
import { FONT_OPTIONS_GROUPED, FONTS } from '@/lib/pricelist/fonts'
import { Check } from 'lucide-react'

interface ThemeSelectorProps {
  selectedTheme: string
  selectedFont: string
  onThemeChange: (theme: string) => void
  onFontChange: (font: string) => void
}

export function ThemeSelector({
  selectedTheme,
  selectedFont,
  onThemeChange,
  onFontChange,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Theme Auswahl */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Design-Theme</Label>
        <div className="grid grid-cols-2 gap-3">
          {THEME_OPTIONS.map((theme) => (
            <Card
              key={theme.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedTheme === theme.value && 'ring-2 ring-primary'
              )}
              onClick={() => onThemeChange(theme.value)}
            >
              <CardContent className="p-3">
                {/* Preview */}
                <div
                  className="h-16 rounded-md mb-2 relative overflow-hidden"
                  style={{ background: theme.preview }}
                >
                  {/* Sample content */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-2">
                    <div
                      className="text-xs font-semibold"
                      style={{
                        fontFamily: THEMES[theme.value].headerFont,
                        color: THEMES[theme.value].primaryColor,
                        letterSpacing: THEMES[theme.value].letterSpacing,
                        textTransform: THEMES[theme.value].headerTransform,
                      }}
                    >
                      DAMEN
                    </div>
                    <div
                      className="text-[10px] mt-1"
                      style={{
                        fontFamily: THEMES[theme.value].bodyFont,
                        color: THEMES[theme.value].textColor,
                      }}
                    >
                      Schneiden........45 €
                    </div>
                  </div>
                  {selectedTheme === theme.value && (
                    <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium">{theme.label}</div>
                <div className="text-xs text-muted-foreground">{theme.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Font Auswahl */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Schriftart</Label>
        <Select value={selectedFont} onValueChange={onFontChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Serifenschriften
            </div>
            {FONT_OPTIONS_GROUPED.serif.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm"
                    style={{ fontFamily: FONTS[font.value].family }}
                  >
                    {font.preview}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({font.label})
                  </span>
                </div>
              </SelectItem>
            ))}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
              Sans-Serif
            </div>
            {FONT_OPTIONS_GROUPED['sans-serif'].map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm"
                    style={{ fontFamily: FONTS[font.value].family }}
                  >
                    {font.preview}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({font.label})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}


