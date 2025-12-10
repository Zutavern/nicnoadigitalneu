import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SubscriptionRenewedEmailProps {
  userName: string
  planName: string
  nextBillingDate: string
  amount?: string
  dashboardUrl?: string
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

export function SubscriptionRenewedEmail({
  userName,
  planName,
  nextBillingDate,
  amount,
  dashboardUrl = 'https://nicnoa.de/dashboard/settings/billing',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: SubscriptionRenewedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{planName\}\}/g, planName)
    .replace(/\{\{nextBillingDate\}\}/g, nextBillingDate)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🔄 Abo verlängert</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={detailsBox}>
        <div style={detailRow}>
          <Text style={detailLabel}>Plan</Text>
          <Text style={detailValue}>{planName}</Text>
        </div>
        {amount && (
          <div style={detailRow}>
            <Text style={detailLabel}>Betrag</Text>
            <Text style={detailValue}>{amount}</Text>
          </div>
        )}
        <div style={detailRow}>
          <Text style={detailLabel}>Nächste Abrechnung</Text>
          <Text style={detailValue}>{nextBillingDate}</Text>
        </div>
      </Section>

      <Text style={paragraph}>
        Vielen Dank, dass du NICNOA nutzt! Dein Abo läuft automatisch weiter.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Abo verwalten'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
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

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
}

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
}

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default SubscriptionRenewedEmail





