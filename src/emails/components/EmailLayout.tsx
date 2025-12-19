import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  children: React.ReactNode
  preview?: string
  logoUrl?: string
  primaryColor?: string
  footerText?: string // Wird nicht mehr verwendet (doppelter Footer vermeiden), aber für Kompatibilität beibehalten
}

export function EmailLayout({
  children,
  preview = '',
  logoUrl,
  primaryColor = '#ec4899',
  footerText: _footerText, // Prefix mit _ um "unused variable" Warnung zu vermeiden
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={{ ...header, backgroundColor: primaryColor }}>
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt="Logo"
                style={{ maxHeight: '48px', width: 'auto' }}
              />
            ) : (
              <div style={textLogoContainer}>
                <span style={textLogoMain}>NICNOA</span>
                <span style={{ ...textLogoAmp, color: primaryColor }}>&amp;CO.online</span>
              </div>
            )}
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerLinks}>
              <a href="https://www.nicnoa.online/datenschutz" style={footerLink}>Datenschutz</a>
              {' | '}
              <a href="https://www.nicnoa.online/impressum" style={footerLink}>Impressum</a>
              {' | '}
              <a href="https://www.nicnoa.online/agb" style={footerLink}>AGB</a>
              {' | '}
              <a href="https://www.nicnoa.online/login" style={footerLink}>Login</a>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} NICNOA&CO.online. Alle Rechte vorbehalten.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '600px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
}

const header: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
}

const textLogoContainer: React.CSSProperties = {
  display: 'inline-block',
  textAlign: 'center',
}

const textLogoMain: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  color: '#ffffff',
}

const textLogoAmp: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  // color wird dynamisch vom primaryColor gesetzt
}

const content: React.CSSProperties = {
  padding: '32px 40px',
}

const footer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  padding: '24px 40px',
  textAlign: 'center',
}

const footerLinks: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const footerLink: React.CSSProperties = {
  color: '#374151',
  textDecoration: 'none',
}

const copyright: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

export default EmailLayout
