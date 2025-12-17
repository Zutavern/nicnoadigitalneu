import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface OnboardingRejectedEmailProps {
  userName: string
  reason: string
  retryUrl?: string
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

export function OnboardingRejectedEmail({
  userName,
  reason,
  retryUrl = 'https://nicnoa.online/onboarding/stylist',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: OnboardingRejectedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{reason\}\}/g, reason)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⚠️ Überarbeitung erforderlich</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={reasonBox}>
        <Text style={reasonTitle}>Begründung</Text>
        <Text style={reasonText}>{reason}</Text>
      </Section>

      <Text style={paragraph}>
        Du kannst deinen Antrag jederzeit überarbeiten und erneut einreichen. 
        Bei Fragen stehen wir dir gerne zur Verfügung.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={retryUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Antrag überarbeiten'}
        </EmailButton>
      </div>

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

const reasonBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '0 10px 10px 0',
  padding: '16px 20px',
  margin: '20px 0',
}

const reasonTitle: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const reasonText: React.CSSProperties = {
  color: '#7f1d1d',
  fontSize: '15px',
  lineHeight: '24px',
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

export default OnboardingRejectedEmail











