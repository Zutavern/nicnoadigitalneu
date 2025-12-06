import { Heading, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface OnboardingApprovedEmailProps {
  userName: string
  dashboardUrl: string
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

export function OnboardingApprovedEmail({
  userName,
  dashboardUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: OnboardingApprovedEmailProps) {
  const bodyText = content.body.replace(/\{\{name\}\}/g, userName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>✅ Freigabe erteilt</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={nextStepsTitle}>Deine nächsten Schritte:</Text>
      
      <Text style={stepItem}>
        <strong>1.</strong> Vervollständige dein Profil mit Fotos und Services
      </Text>
      <Text style={stepItem}>
        <strong>2.</strong> Richte deine Verfügbarkeiten ein
      </Text>
      <Text style={stepItem}>
        <strong>3.</strong> Beginne mit der Kundengewinnung
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Zum Dashboard'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '34px',
  margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const nextStepsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const stepItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 10px',
  paddingLeft: '4px',
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

export default OnboardingApprovedEmail

