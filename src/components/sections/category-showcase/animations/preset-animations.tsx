'use client'

import { CalendarAnimation } from './calendar-animation'
import { ChatAnimation } from './chat-animation'
import { ChartAnimation } from './chart-animation'
import { ShieldAnimation } from './shield-animation'
import { WorkflowAnimation } from './workflow-animation'

export type PresetAnimationType = 'calendar' | 'chat' | 'chart' | 'shield' | 'workflow'

interface PresetAnimationProps {
  preset: PresetAnimationType | string
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

// Map von Preset-Namen zu Animationskomponenten
const presetMap: Record<PresetAnimationType, React.ComponentType<{
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}>> = {
  calendar: CalendarAnimation,
  chat: ChatAnimation,
  chart: ChartAnimation,
  shield: ShieldAnimation,
  workflow: WorkflowAnimation,
}

// Map von Kategorie-Keys zu Standard-Presets
export const categoryToPresetMap: Record<string, PresetAnimationType> = {
  core: 'calendar',
  communication: 'chat',
  analytics: 'chart',
  security: 'shield',
  automation: 'workflow',
}

export function PresetAnimation({
  preset,
  speed = 1,
  primaryColor,
  secondaryColor,
  accentColor,
}: PresetAnimationProps) {
  const AnimationComponent = presetMap[preset as PresetAnimationType]
  
  if (!AnimationComponent) {
    // Fallback zu Calendar wenn unbekanntes Preset
    const FallbackComponent = presetMap.calendar
    return (
      <FallbackComponent
        speed={speed}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        accentColor={accentColor}
      />
    )
  }
  
  return (
    <AnimationComponent
      speed={speed}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      accentColor={accentColor}
    />
  )
}

// Liste aller verfügbaren Presets für Admin-Interface
export const availablePresets: { value: PresetAnimationType; label: string; description: string }[] = [
  { 
    value: 'calendar', 
    label: 'Kalender', 
    description: 'Wochenkalender mit animierten Buchungs-Slots' 
  },
  { 
    value: 'chat', 
    label: 'Chat', 
    description: 'Smartphone mit Chat-Konversation' 
  },
  { 
    value: 'chart', 
    label: 'Dashboard', 
    description: 'Analytics-Dashboard mit Diagrammen und Statistiken' 
  },
  { 
    value: 'shield', 
    label: 'Sicherheit', 
    description: 'Pulsierendes Schild mit Sicherheits-Features' 
  },
  { 
    value: 'workflow', 
    label: 'Workflow', 
    description: 'Automatisierungs-Flow mit animierten Schritten' 
  },
]






