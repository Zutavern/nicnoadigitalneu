import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface ReferralSuccessEmailProps {
  userName: string
  referredName: string
  rewardDescription: string
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

export function ReferralSuccessEmail({
  userName,
  referredName,
  rewardDescription,
  dashboardUrl = 'https://nicnoa.de/dashboard',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: ReferralSuccessEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{referredName\}\}/g, referredName)
    .replace(/\{\{rewardDescription\}\}/g, rewardDescription)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎉 Belohnung verdient!</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={rewardBox}>
        <Text style={rewardEmoji}>🎁</Text>
        <Text style={rewardTitle}>Deine Belohnung</Text>
        <Text style={rewardValue}>{rewardDescription}</Text>
        <Text style={rewardNote}>
          <strong>{referredName}</strong> hat sich dank dir registriert!
        </Text>
      </Section>

      <Text style={paragraph}>
        Die Belohnung wird automatisch auf dein Konto gutgeschrieben. 
        Lade weiterhin Freunde ein und verdiene mehr!
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Mehr Freunde einladen'}
        </EmailButton>
      </div>

      <Section style={statsBox}>
        <Text style={statsTitle}>Deine Statistiken</Text>
        <Text style={statsText}>
          Teile deinen persönlichen Link mit noch mehr Kollegen und 
          verdiene für jede erfolgreiche Empfehlung.
        </Text>
      </Section>

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

const rewardBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center',
  margin: '24px 0',
}

const rewardEmoji: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const rewardTitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const rewardValue: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const rewardNote: React.CSSProperties = {
  color: '#a7f3d0',
  fontSize: '14px',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const statsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center',
}

const statsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const statsText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default ReferralSuccessEmail



