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
  footerText?: string
}

export function EmailLayout({
  children,
  preview = '',
  logoUrl,
  primaryColor = '#ec4899',
  footerText,
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
                <span style={textLogoAmp}>&amp;CO.</span>
                <div style={textLogoSub}>DIGITAL</div>
              </div>
            )}
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            {footerText && (
              <Text style={footerTextStyle}>{footerText}</Text>
            )}
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
              © {new Date().getFullYear()} NICNOA&CO. Alle Rechte vorbehalten.
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
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '3px',
  color: '#ffffff',
}

const textLogoAmp: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '18px',
  fontWeight: 400,
  letterSpacing: '2px',
  color: 'rgba(255, 255, 255, 0.85)',
  marginLeft: '2px',
}

const textLogoSub: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '6px',
  color: 'rgba(255, 255, 255, 0.75)',
  marginTop: '-2px',
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

const footerTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const footerLinks: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const footerLink: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'none',
}

const copyright: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

export default EmailLayout
