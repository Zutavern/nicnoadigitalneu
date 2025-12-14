import { Button } from '@react-email/components'
import * as React from 'react'

interface EmailButtonProps {
  children: React.ReactNode
  href: string
  primaryColor?: string
}

export function EmailButton({
  children,
  href,
  primaryColor = '#ec4899',
}: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: primaryColor,
        borderRadius: '8px',
        color: '#ffffff',
        display: 'inline-block',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '24px',
        padding: '14px 32px',
        textDecoration: 'none',
        textAlign: 'center',
      }}
    >
      {children}
    </Button>
  )
}

export default EmailButton
