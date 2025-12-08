import { Button } from '@react-email/components'
import * as React from 'react'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  primaryColor?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function EmailButton({
  href,
  children,
  primaryColor = '#10b981',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: EmailButtonProps) {
  const styles = getButtonStyles(variant, primaryColor, size, fullWidth)

  return (
    <Button href={href} style={styles}>
      {children}
    </Button>
  )
}

function getButtonStyles(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  primaryColor: string,
  size: 'sm' | 'md' | 'lg',
  fullWidth: boolean
): React.CSSProperties {
  const sizeStyles = {
    sm: { padding: '10px 20px', fontSize: '13px', borderRadius: '8px' },
    md: { padding: '14px 28px', fontSize: '15px', borderRadius: '10px' },
    lg: { padding: '18px 36px', fontSize: '16px', borderRadius: '12px' },
  }

  const base: React.CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    ...sizeStyles[size],
  }

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: primaryColor,
        color: '#ffffff',
        boxShadow: `0 4px 14px 0 ${primaryColor}40`,
      }
    case 'secondary':
      return {
        ...base,
        backgroundColor: '#f1f5f9',
        color: '#334155',
      }
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: primaryColor,
        border: `2px solid ${primaryColor}`,
      }
    case 'ghost':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: primaryColor,
        padding: base.padding,
      }
    default:
      return base
  }
}

export default EmailButton
