import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SubscriptionExpiredEmailProps {
  userName: string
  reactivateUrl?: string
  content: {
    headline: string
    body: string
    buttonText?: string
    footer?: string
  }
  logoUrl?: string
  primaryColor?: string
  footerText?: string
}

export function SubscriptionExpiredEmail({
  userName,
  reactivateUrl = 'https://nicnoa.de/dashboard/settings/billing',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: SubscriptionExpiredEmailProps) {
  const bodyText = content.body.replace(/\{\{name\}\}/g, userName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🔒 Abo abgelaufen</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>Was bedeutet das?</Text>
        <Text style={infoItem}>• Du hast keinen Zugriff mehr auf dein Dashboard</Text>
        <Text style={infoItem}>• Deine Daten werden für 30 Tage gespeichert</Text>
        <Text style={infoItem}>• Danach werden sie endgültig gelöscht</Text>
      </Section>

      <Text style={paragraph}>
        Wir würden uns freuen, dich wieder an Bord zu haben! Reaktiviere 
        jetzt dein Abo und mach da weiter, wo du aufgehört hast.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={reactivateUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Abo reaktivieren'}
        </EmailButton>
      </div>

      <Text style={helpText}>
        Bei Fragen oder Problemen mit der Zahlung kontaktiere uns unter{' '}
        <a href="mailto:support@nicnoa.de" style={link}>support@nicnoa.de</a>
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const infoBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
}

const infoTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const infoItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 4px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
}

const helpText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center',
}

const link: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default SubscriptionExpiredEmail

