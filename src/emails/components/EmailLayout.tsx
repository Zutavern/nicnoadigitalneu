import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  preview: string
  logoUrl?: string
  primaryColor?: string
  footerText?: string
  showSocialLinks?: boolean
  children: React.ReactNode
}

export function EmailLayout({
  preview,
  logoUrl,
  primaryColor = '#10b981',
  footerText = '© 2025 NICNOA&CO.online. Alle Rechte vorbehalten.',
  showSocialLinks = true,
  children,
}: EmailLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nicnoa.de'
  const defaultLogo = `${baseUrl}/logo-email.png`

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 16px !important;
              }
              .content-card {
                padding: 24px 20px !important;
              }
              .header-text {
                font-size: 20px !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        {/* Outer Container with subtle gradient background */}
        <Container style={outerContainer}>
          {/* Decorative top bar */}
          <Section style={topBar}>
            <div style={{ ...topBarGradient, background: `linear-gradient(90deg, ${primaryColor} 0%, #8b5cf6 50%, #ec4899 100%)` }} />
          </Section>

          {/* Inner Container */}
          <Container style={innerContainer} className="container">
            {/* Header */}
            <Section style={header}>
              <Img
                src={logoUrl || defaultLogo}
                alt="NICNOA&CO.online"
                width={180}
                height={48}
                style={logo}
              />
            </Section>

            {/* Main Content Card */}
            <Section style={contentCard} className="content-card">
              {children}
            </Section>

            {/* Footer */}
            <Section style={footer}>
              {/* Social Links */}
              {showSocialLinks && (
                <Row style={socialRow}>
                  <Column align="center">
                    <Link href="https://instagram.com/nicnoa.de" style={socialLink}>
                      <Img
                        src={`${baseUrl}/email-icons/instagram.png`}
                        alt="Instagram"
                        width={24}
                        height={24}
                        style={socialIcon}
                      />
                    </Link>
                    <Link href="https://linkedin.com/company/nicnoa" style={socialLink}>
                      <Img
                        src={`${baseUrl}/email-icons/linkedin.png`}
                        alt="LinkedIn"
                        width={24}
                        height={24}
                        style={socialIcon}
                      />
                    </Link>
                    <Link href="https://facebook.com/nicnoa" style={socialLink}>
                      <Img
                        src={`${baseUrl}/email-icons/facebook.png`}
                        alt="Facebook"
                        width={24}
                        height={24}
                        style={socialIcon}
                      />
                    </Link>
                  </Column>
                </Row>
              )}

              <Hr style={footerDivider} />

              {/* Company Info */}
              <Text style={companyName}>NICNOA&CO.online</Text>
              <Text style={tagline}>Die Plattform für moderne Friseure</Text>

              {/* Footer Links */}
              <Text style={footerLinksContainer}>
                <Link href={`${baseUrl}/dashboard/settings`} style={footerLink}>
                  E-Mail-Einstellungen
                </Link>
                <span style={footerLinkDivider}>•</span>
                <Link href={`${baseUrl}/hilfe`} style={footerLink}>
                  Hilfe & Support
                </Link>
                <span style={footerLinkDivider}>•</span>
                <Link href={`${baseUrl}/datenschutz`} style={footerLink}>
                  Datenschutz
                </Link>
                <span style={footerLinkDivider}>•</span>
                <Link href={`${baseUrl}/impressum`} style={footerLink}>
                  Impressum
                </Link>
              </Text>

              {/* Copyright */}
              <Text style={copyright}>{footerText}</Text>

              {/* Address */}
              <Text style={addressText}>
                NICNOA&CO.online GmbH • Musterstraße 123 • 10115 Berlin
              </Text>

              {/* Unsubscribe Note */}
              <Text style={unsubscribeNote}>
                Du erhältst diese E-Mail, weil du ein NICNOA-Konto hast.{' '}
                <Link href={`${baseUrl}/dashboard/settings/notifications`} style={unsubscribeLink}>
                  E-Mail-Benachrichtigungen verwalten
                </Link>
              </Text>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  )
}

// ============================================
// Styles
// ============================================

const main: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  margin: 0,
  padding: 0,
}

const outerContainer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  width: '100%',
  padding: '0',
}

const topBar: React.CSSProperties = {
  width: '100%',
  height: '4px',
  padding: 0,
  margin: 0,
}

const topBarGradient: React.CSSProperties = {
  height: '4px',
  width: '100%',
}

const innerContainer: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 24px',
}

const header: React.CSSProperties = {
  textAlign: 'center',
  padding: '0 0 32px',
}

const logo: React.CSSProperties = {
  margin: '0 auto',
}

const contentCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '40px 48px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
}

const footer: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px 20px',
}

const socialRow: React.CSSProperties = {
  marginBottom: '24px',
}

const socialLink: React.CSSProperties = {
  display: 'inline-block',
  marginRight: '16px',
}

const socialIcon: React.CSSProperties = {
  opacity: 0.7,
}

const footerDivider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  borderTop: '1px solid #e2e8f0',
  margin: '0 0 24px',
}

const companyName: React.CSSProperties = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const tagline: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '400',
  margin: '0 0 20px',
}

const footerLinksContainer: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const footerLink: React.CSSProperties = {
  color: '#64748b',
  textDecoration: 'none',
}

const footerLinkDivider: React.CSSProperties = {
  color: '#cbd5e1',
  padding: '0 8px',
}

const copyright: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const addressText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '0 0 16px',
}

const unsubscribeNote: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '0',
}

const unsubscribeLink: React.CSSProperties = {
  color: '#64748b',
  textDecoration: 'underline',
}

export default EmailLayout
