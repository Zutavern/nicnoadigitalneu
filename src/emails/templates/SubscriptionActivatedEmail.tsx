import { Heading, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SubscriptionActivatedEmailProps {
  userName: string
  planName: string
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

export function SubscriptionActivatedEmail({
  userName,
  planName,
  dashboardUrl = 'https://nicnoa.de/dashboard',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: SubscriptionActivatedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{planName\}\}/g, planName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎊 Abo aktiviert</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <div style={planCard}>
        <Text style={planLabel}>Dein Plan</Text>
        <Text style={planNameStyle}>{planName}</Text>
        <Text style={planStatus}>✓ Aktiv</Text>
      </div>

      <Hr style={divider} />

      <Text style={benefitsTitle}>Deine Vorteile:</Text>
      
      <Text style={benefitItem}>✨ Unbegrenzte Terminbuchungen</Text>
      <Text style={benefitItem}>📊 Detaillierte Analytics</Text>
      <Text style={benefitItem}>💬 Kundenmanagement</Text>
      <Text style={benefitItem}>🎯 Prioritäts-Support</Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt loslegen'}
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

const planCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const planLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 4px',
}

const planNameStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const planStatus: React.CSSProperties = {
  color: '#a7f3d0',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const benefitsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const benefitItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 10px',
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

export default SubscriptionActivatedEmail





