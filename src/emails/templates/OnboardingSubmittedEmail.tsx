import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface OnboardingSubmittedEmailProps {
  stylistName: string
  reviewUrl: string
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

export function OnboardingSubmittedEmail({
  stylistName,
  reviewUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: OnboardingSubmittedEmailProps) {
  const bodyText = content.body.replace(/\{\{stylistName\}\}/g, stylistName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📋 Admin-Aktion erforderlich</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={detailsBox}>
        <Text style={detailsTitle}>Antragsteller</Text>
        <Text style={detailsValue}>{stylistName}</Text>
        <Text style={detailsLabel}>Status: Wartet auf Prüfung</Text>
      </Section>

      <div style={buttonContainer}>
        <EmailButton href={reviewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Antrag prüfen'}
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

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '10px',
  padding: '20px',
  margin: '24px 0',
}

const detailsTitle: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const detailsValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const detailsLabel: React.CSSProperties = {
  color: '#f59e0b',
  fontSize: '13px',
  fontWeight: '500',
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

export default OnboardingSubmittedEmail








