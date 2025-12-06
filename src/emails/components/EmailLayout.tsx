import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  preview: string
  logoUrl?: string
  primaryColor?: string
  footerText?: string
  children: React.ReactNode
}

export function EmailLayout({
  preview,
  logoUrl,
  primaryColor = '#10b981',
  footerText = '© 2025 NICNOA & CO. DIGITAL. Alle Rechte vorbehalten.',
  children,
}: EmailLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnoa.de'
  const defaultLogo = `${baseUrl}/logo.png`

  return (
    <Html>
      <Head>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
          `}
        </style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl || defaultLogo}
              alt="NICNOA"
              width={140}
              height={40}
              style={logo}
            />
          </Section>

          {/* Content Card */}
          <Section style={contentCard}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/dashboard/settings`} style={footerLink}>
                E-Mail-Einstellungen
              </Link>
              {' • '}
              <Link href={`${baseUrl}/impressum`} style={footerLink}>
                Impressum
              </Link>
              {' • '}
              <Link href={`${baseUrl}/datenschutz`} style={footerLink}>
                Datenschutz
              </Link>
            </Text>
            <Text style={footerAddress}>
              NICNOA & CO. DIGITAL GmbH
              <br />
              Musterstraße 123, 10115 Berlin
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  padding: '40px 20px',
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
}

const header: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px 0 30px',
}

const logo: React.CSSProperties = {
  margin: '0 auto',
}

const contentCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '40px 48px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
}

const footer: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 20px 20px',
}

const footerTextStyle: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const footerLinks: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const footerLink: React.CSSProperties = {
  color: '#71717a',
  textDecoration: 'underline',
}

const footerAddress: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0',
}

export default EmailLayout

