/**
 * Stripe Appearance Configuration
 * 
 * Vollständig angepasst an das NICNOA Designsystem
 * Unterstützt Light Mode und Dark Mode
 */

import type { Appearance } from '@stripe/stripe-js'

// NICNOA Designsystem Farben
const colors = {
  // Light Mode
  light: {
    // Hauptfarben
    primary: '#8B5CF6', // violet-500 - NICNOA Hauptfarbe
    primaryHover: '#7C3AED', // violet-600
    
    // Hintergründe
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB', // gray-50
    componentBackground: '#FFFFFF',
    
    // Text
    text: '#111827', // gray-900
    textSecondary: '#6B7280', // gray-500
    textMuted: '#9CA3AF', // gray-400
    
    // Akzente
    success: '#10B981', // emerald-500
    danger: '#EF4444', // red-500
    warning: '#F59E0B', // amber-500
    
    // Borders
    border: '#E5E7EB', // gray-200
    borderFocus: '#8B5CF6', // violet-500
    
    // Placeholders
    placeholder: '#9CA3AF', // gray-400
    
    // Icons
    icon: '#6B7280', // gray-500
  },
  
  // Dark Mode
  dark: {
    // Hauptfarben
    primary: '#A78BFA', // violet-400
    primaryHover: '#8B5CF6', // violet-500
    
    // Hintergründe
    background: '#0F0F0F', // zinc-950 äquivalent
    backgroundSecondary: '#1A1A1A', // zinc-900 äquivalent
    componentBackground: '#1F1F1F', // zinc-800 äquivalent
    
    // Text
    text: '#FAFAFA', // zinc-50
    textSecondary: '#A1A1AA', // zinc-400
    textMuted: '#71717A', // zinc-500
    
    // Akzente
    success: '#34D399', // emerald-400
    danger: '#F87171', // red-400
    warning: '#FBBF24', // amber-400
    
    // Borders
    border: '#27272A', // zinc-800
    borderFocus: '#A78BFA', // violet-400
    
    // Placeholders
    placeholder: '#71717A', // zinc-500
    
    // Icons
    icon: '#A1A1AA', // zinc-400
  }
}

// Font-Konfiguration (passend zu Tailwind)
const fonts = {
  family: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sizeBase: '16px',
  sizeSmall: '14px',
  weightNormal: '400',
  weightMedium: '500',
  weightBold: '600',
}

// Spacing (basierend auf Tailwind 4px Einheit)
const spacing = {
  unit: '4px',
  borderRadius: '8px', // rounded-lg
  borderRadiusSmall: '6px', // rounded-md
}

/**
 * Light Mode Appearance
 */
export const lightAppearance: Appearance = {
  theme: 'stripe',
  
  variables: {
    // Farben
    colorPrimary: colors.light.primary,
    colorBackground: colors.light.background,
    colorText: colors.light.text,
    colorTextSecondary: colors.light.textSecondary,
    colorTextPlaceholder: colors.light.placeholder,
    colorDanger: colors.light.danger,
    colorSuccess: colors.light.success,
    colorWarning: colors.light.warning,
    colorIcon: colors.light.icon,
    colorIconHover: colors.light.primary,
    colorIconCardError: colors.light.danger,
    colorIconCardCvc: colors.light.icon,
    colorIconCardCvcError: colors.light.danger,
    
    // Komponenten
    colorInputBackground: colors.light.componentBackground,
    colorInputText: colors.light.text,
    colorInputPlaceholder: colors.light.placeholder,
    
    // Typography
    fontFamily: fonts.family,
    fontSizeBase: fonts.sizeBase,
    fontSizeSm: fonts.sizeSmall,
    fontWeightNormal: fonts.weightNormal,
    fontWeightMedium: fonts.weightMedium,
    fontWeightBold: fonts.weightBold,
    
    // Spacing
    spacingUnit: spacing.unit,
    borderRadius: spacing.borderRadius,
    
    // Fokus-Ring
    focusBoxShadow: `0 0 0 3px ${colors.light.primary}33`,
    focusOutline: 'none',
  },
  
  rules: {
    '.Input': {
      border: `1px solid ${colors.light.border}`,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.Input:hover': {
      borderColor: colors.light.textMuted,
    },
    '.Input:focus': {
      borderColor: colors.light.primary,
      boxShadow: `0 0 0 3px ${colors.light.primary}20`,
    },
    '.Input--invalid': {
      borderColor: colors.light.danger,
      boxShadow: `0 0 0 3px ${colors.light.danger}20`,
    },
    '.Label': {
      fontWeight: fonts.weightMedium,
      color: colors.light.text,
      marginBottom: '6px',
    },
    '.Tab': {
      border: `1px solid ${colors.light.border}`,
      borderRadius: spacing.borderRadiusSmall,
      backgroundColor: colors.light.componentBackground,
      transition: 'all 0.15s ease',
    },
    '.Tab:hover': {
      backgroundColor: colors.light.backgroundSecondary,
      borderColor: colors.light.textMuted,
    },
    '.Tab--selected': {
      backgroundColor: colors.light.primary,
      borderColor: colors.light.primary,
      color: '#FFFFFF',
    },
    '.Tab--selected:hover': {
      backgroundColor: colors.light.primaryHover,
      borderColor: colors.light.primaryHover,
    },
    '.TabIcon--selected': {
      fill: '#FFFFFF',
    },
    '.TabLabel--selected': {
      color: '#FFFFFF',
    },
    '.Block': {
      backgroundColor: colors.light.backgroundSecondary,
      borderRadius: spacing.borderRadius,
      padding: '12px',
    },
    '.CheckboxInput': {
      borderColor: colors.light.border,
    },
    '.CheckboxInput--checked': {
      backgroundColor: colors.light.primary,
      borderColor: colors.light.primary,
    },
    '.PickerItem': {
      border: `1px solid ${colors.light.border}`,
      borderRadius: spacing.borderRadiusSmall,
      transition: 'all 0.15s ease',
    },
    '.PickerItem:hover': {
      borderColor: colors.light.primary,
    },
    '.PickerItem--selected': {
      borderColor: colors.light.primary,
      backgroundColor: `${colors.light.primary}08`,
    },
    '.Error': {
      color: colors.light.danger,
      fontSize: fonts.sizeSmall,
    },
  },
}

/**
 * Dark Mode Appearance
 */
export const darkAppearance: Appearance = {
  theme: 'night',
  
  variables: {
    // Farben
    colorPrimary: colors.dark.primary,
    colorBackground: colors.dark.background,
    colorText: colors.dark.text,
    colorTextSecondary: colors.dark.textSecondary,
    colorTextPlaceholder: colors.dark.placeholder,
    colorDanger: colors.dark.danger,
    colorSuccess: colors.dark.success,
    colorWarning: colors.dark.warning,
    colorIcon: colors.dark.icon,
    colorIconHover: colors.dark.primary,
    colorIconCardError: colors.dark.danger,
    colorIconCardCvc: colors.dark.icon,
    colorIconCardCvcError: colors.dark.danger,
    
    // Komponenten
    colorInputBackground: colors.dark.componentBackground,
    colorInputText: colors.dark.text,
    colorInputPlaceholder: colors.dark.placeholder,
    
    // Typography
    fontFamily: fonts.family,
    fontSizeBase: fonts.sizeBase,
    fontSizeSm: fonts.sizeSmall,
    fontWeightNormal: fonts.weightNormal,
    fontWeightMedium: fonts.weightMedium,
    fontWeightBold: fonts.weightBold,
    
    // Spacing
    spacingUnit: spacing.unit,
    borderRadius: spacing.borderRadius,
    
    // Fokus-Ring
    focusBoxShadow: `0 0 0 3px ${colors.dark.primary}40`,
    focusOutline: 'none',
  },
  
  rules: {
    '.Input': {
      border: `1px solid ${colors.dark.border}`,
      backgroundColor: colors.dark.componentBackground,
      boxShadow: 'none',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.Input:hover': {
      borderColor: colors.dark.textMuted,
    },
    '.Input:focus': {
      borderColor: colors.dark.primary,
      boxShadow: `0 0 0 3px ${colors.dark.primary}30`,
    },
    '.Input--invalid': {
      borderColor: colors.dark.danger,
      boxShadow: `0 0 0 3px ${colors.dark.danger}30`,
    },
    '.Label': {
      fontWeight: fonts.weightMedium,
      color: colors.dark.text,
      marginBottom: '6px',
    },
    '.Tab': {
      border: `1px solid ${colors.dark.border}`,
      borderRadius: spacing.borderRadiusSmall,
      backgroundColor: colors.dark.componentBackground,
      transition: 'all 0.15s ease',
    },
    '.Tab:hover': {
      backgroundColor: colors.dark.backgroundSecondary,
      borderColor: colors.dark.textMuted,
    },
    '.Tab--selected': {
      backgroundColor: colors.dark.primary,
      borderColor: colors.dark.primary,
      color: '#FFFFFF',
    },
    '.Tab--selected:hover': {
      backgroundColor: colors.dark.primaryHover,
      borderColor: colors.dark.primaryHover,
    },
    '.TabIcon--selected': {
      fill: '#FFFFFF',
    },
    '.TabLabel--selected': {
      color: '#FFFFFF',
    },
    '.Block': {
      backgroundColor: colors.dark.backgroundSecondary,
      borderRadius: spacing.borderRadius,
      padding: '12px',
    },
    '.CheckboxInput': {
      borderColor: colors.dark.border,
      backgroundColor: colors.dark.componentBackground,
    },
    '.CheckboxInput--checked': {
      backgroundColor: colors.dark.primary,
      borderColor: colors.dark.primary,
    },
    '.PickerItem': {
      border: `1px solid ${colors.dark.border}`,
      borderRadius: spacing.borderRadiusSmall,
      backgroundColor: colors.dark.componentBackground,
      transition: 'all 0.15s ease',
    },
    '.PickerItem:hover': {
      borderColor: colors.dark.primary,
    },
    '.PickerItem--selected': {
      borderColor: colors.dark.primary,
      backgroundColor: `${colors.dark.primary}15`,
    },
    '.Error': {
      color: colors.dark.danger,
      fontSize: fonts.sizeSmall,
    },
    // Payment Element spezifisch
    '.p-GridCell': {
      backgroundColor: colors.dark.componentBackground,
    },
    '.p-Input': {
      backgroundColor: colors.dark.componentBackground,
    },
  },
}

/**
 * Gibt die passende Appearance basierend auf dem Theme zurück
 */
export function getStripeAppearance(isDarkMode: boolean): Appearance {
  return isDarkMode ? darkAppearance : lightAppearance
}

/**
 * NICNOA Farben exportieren für Konsistenz
 */
export const stripeColors = colors



