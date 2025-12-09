import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface ReferralInvitationEmailProps {
  referrerName: string
  referralUrl: string
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

export function ReferralInvitationEmail({
  referrerName,
  referralUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: ReferralInvitationEmailProps) {
  const bodyText = content.body.replace(/\{\{referrerName\}\}/g, referrerName)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎁 Einladung</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={inviteBox}>
        <Text style={inviteEmoji}>👋</Text>
        <Text style={inviteText}>
          <strong>{referrerName}</strong> lädt dich ein, Teil der NICNOA Community zu werden!
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={benefitsTitle}>Warum NICNOA?</Text>
      
      <Text style={benefitItem}>
        ✨ <strong>Professionelles Dashboard</strong> – Alle Tools an einem Ort
      </Text>
      <Text style={benefitItem}>
        📅 <strong>Smart Booking</strong> – Termine einfach verwalten
      </Text>
      <Text style={benefitItem}>
        💰 <strong>Mehr Umsatz</strong> – Durch bessere Kundenbeziehungen
      </Text>
      <Text style={benefitItem}>
        🎁 <strong>Bonus</strong> – Exklusive Vorteile für eingeladene Mitglieder
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={referralUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Kostenlos registrieren'}
        </EmailButton>
      </div>

      <Text style={note}>
        Diese Einladung wurde von {referrerName} gesendet. 
        Falls du diese E-Mail nicht erwartet hast, kannst du sie ignorieren.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fce7f3',
  color: '#be185d',
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

const inviteBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const inviteEmoji: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 12px',
}

const inviteText: React.CSSProperties = {
  color: '#831843',
  fontSize: '16px',
  lineHeight: '24px',
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
  margin: '0 0 12px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
}

const note: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default ReferralInvitationEmail




