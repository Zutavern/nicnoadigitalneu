import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface PaymentFailedEmailProps {
  userName: string
  amount: string
  retryUrl: string
  failureReason?: string
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

export function PaymentFailedEmail({
  userName,
  amount,
  retryUrl,
  failureReason,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: PaymentFailedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{amount\}\}/g, amount)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>❌ Zahlung fehlgeschlagen</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={errorBox}>
        <Text style={errorTitle}>Fehlgeschlagene Zahlung</Text>
        <Text style={errorAmount}>{amount}</Text>
        {failureReason && (
          <Text style={errorReason}>Grund: {failureReason}</Text>
        )}
      </Section>

      <Text style={paragraph}>
        Bitte überprüfe deine Zahlungsinformationen und versuche es erneut, 
        um eine Unterbrechung deines Dienstes zu vermeiden.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={retryUrl} primaryColor="#ef4444">
          {content.buttonText || 'Zahlung aktualisieren'}
        </EmailButton>
      </div>

      <Text style={helpText}>
        Häufige Gründe für fehlgeschlagene Zahlungen:
      </Text>
      <Text style={helpItem}>• Abgelaufene Kreditkarte</Text>
      <Text style={helpItem}>• Unzureichendes Guthaben</Text>
      <Text style={helpItem}>• Geänderte Bankdaten</Text>

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

const errorBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const errorTitle: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const errorAmount: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
}

const errorReason: React.CSSProperties = {
  color: '#7f1d1d',
  fontSize: '13px',
  marginTop: '8px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
}

const helpText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '20px 0 8px',
}

const helpItem: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 4px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '20px',
}

export default PaymentFailedEmail

