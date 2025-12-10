import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SubscriptionExpiringEmailProps {
  userName: string
  expirationDate: string
  daysLeft?: number
  renewUrl?: string
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

export function SubscriptionExpiringEmail({
  userName,
  expirationDate,
  daysLeft = 7,
  renewUrl = 'https://nicnoa.de/dashboard/settings/billing',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: SubscriptionExpiringEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{expirationDate\}\}/g, expirationDate)
    .replace(/\{\{daysLeft\}\}/g, String(daysLeft))

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⏰ Erinnerung</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={warningBox}>
        <Text style={warningIcon}>⚠️</Text>
        <Text style={warningTitle}>Noch {daysLeft} Tage</Text>
        <Text style={warningText}>
          Dein Abo läuft am {expirationDate} aus
        </Text>
      </Section>

      <Text style={paragraph}>
        Damit du weiterhin alle Funktionen nutzen kannst, verlängere jetzt dein Abonnement.
      </Text>

      <Text style={benefitsTitle}>Was du verlieren würdest:</Text>
      <Text style={benefitItem}>❌ Zugang zu deinem Dashboard</Text>
      <Text style={benefitItem}>❌ Terminbuchungen & Kalender</Text>
      <Text style={benefitItem}>❌ Kundenverwaltung</Text>

      <div style={buttonContainer}>
        <EmailButton href={renewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt verlängern'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
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

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const warningIcon: React.CSSProperties = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const warningTitle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const warningText: React.CSSProperties = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0',
}

const benefitsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '20px 0 12px',
}

const benefitItem: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default SubscriptionExpiringEmail







