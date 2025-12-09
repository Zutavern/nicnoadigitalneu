import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface EmailVerificationEmailProps {
  userName: string
  verifyUrl: string
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

export function EmailVerificationEmail({
  userName,
  verifyUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: EmailVerificationEmailProps) {
  const bodyText = content.body.replace(/\{\{name\}\}/g, userName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Section style={iconContainer}>
        <div style={iconCircle}>✉️</div>
      </Section>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <div style={buttonContainer}>
        <EmailButton href={verifyUrl} primaryColor={primaryColor}>
          {content.buttonText || 'E-Mail bestätigen'}
        </EmailButton>
      </div>

      <Text style={linkFallback}>
        Falls der Button nicht funktioniert, kopiere diesen Link:
        <br />
        <span style={urlText}>{verifyUrl}</span>
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const iconContainer: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const iconCircle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#dbeafe',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  lineHeight: '64px',
  textAlign: 'center',
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '34px',
  margin: '0 0 20px',
  textAlign: 'center',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0',
}

const linkFallback: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '16px 0 0',
}

const urlText: React.CSSProperties = {
  color: '#3b82f6',
  wordBreak: 'break-all',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '20px',
}

export default EmailVerificationEmail




