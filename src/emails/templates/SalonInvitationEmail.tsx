import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SalonInvitationEmailProps {
  salonName: string
  inviterName: string
  invitationUrl: string
  recipientName: string
  message?: string | null
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

export function SalonInvitationEmail({
  salonName,
  inviterName,
  invitationUrl,
  recipientName,
  message,
  content,
  logoUrl,
  primaryColor = '#3B82F6',
  footerText,
}: SalonInvitationEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{inviterName\}\}/g, inviterName)
    .replace(/\{\{recipientName\}\}/g, recipientName)

  return (
    <EmailLayout
      preview={`${salonName} lädt Sie als Stuhlmieter ein`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💼 Einladung</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>Hallo {recipientName},</Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={inviteBox}>
        <Text style={inviteEmoji}>🏢</Text>
        <Text style={inviteText}>
          <strong>{inviterName}</strong> von <strong>{salonName}</strong> lädt Sie ein, 
          dem Salon als Stuhlmieter beizutreten!
        </Text>
      </Section>

      {message && (
        <>
          <Hr style={divider} />
          <Text style={messageLabel}>Persönliche Nachricht:</Text>
          <Text style={messageText}>"{message}"</Text>
        </>
      )}

      <Hr style={divider} />

      <Text style={benefitsTitle}>Was Sie erwartet:</Text>
      
      <Text style={benefitItem}>
        ✨ <strong>Ihr eigener Arbeitsplatz</strong> – Professionell ausgestattet
      </Text>
      <Text style={benefitItem}>
        📅 <strong>Flexible Buchung</strong> – Termine über die NICNOA Plattform
      </Text>
      <Text style={benefitItem}>
        💰 <strong>Transparente Kosten</strong> – Faire Mietkonditionen
      </Text>
      <Text style={benefitItem}>
        🤝 <strong>Zusammenarbeit</strong> – Teil eines professionellen Teams
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={invitationUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Einladung annehmen'}
        </EmailButton>
      </div>

      <Text style={note}>
        Diese Einladung ist 7 Tage gültig. Klicken Sie auf den Button, 
        um die Einladung anzunehmen oder abzulehnen.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
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
  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
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
  color: '#1e40af',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const messageLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const messageText: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: '0',
  padding: '12px 16px',
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  borderLeft: '3px solid #3B82F6',
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

export default SalonInvitationEmail







