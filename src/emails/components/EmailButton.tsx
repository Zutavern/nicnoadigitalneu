import { Button } from '@react-email/components'
import * as React from 'react'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  primaryColor?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export function EmailButton({
  href,
  children,
  primaryColor = '#10b981',
  variant = 'primary',
}: EmailButtonProps) {
  const styles = getButtonStyles(variant, primaryColor)

  return (
    <Button href={href} style={styles}>
      {children}
    </Button>
  )
}

function getButtonStyles(
  variant: 'primary' | 'secondary' | 'outline',
  primaryColor: string
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
  }

  switch (variant) {
    case 'primary':
      return {
        ...base,
        backgroundColor: primaryColor,
        color: '#ffffff',
      }
    case 'secondary':
      return {
        ...base,
        backgroundColor: '#f4f4f5',
        color: '#18181b',
      }
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: primaryColor,
        border: `2px solid ${primaryColor}`,
      }
    default:
      return base
  }
}

export default EmailButton


