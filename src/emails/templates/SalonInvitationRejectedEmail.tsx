import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SalonInvitationRejectedEmailProps {
  salonName: string
  stylistEmail: string
  ownerName: string
  reason?: string
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

export function SalonInvitationRejectedEmail({
  salonName,
  stylistEmail,
  ownerName,
  reason,
  content,
  logoUrl,
  primaryColor = '#71717a',
  footerText,
}: SalonInvitationRejectedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{stylistEmail\}\}/g, stylistEmail)
    .replace(/\{\{ownerName\}\}/g, ownerName)

  return (
    <EmailLayout
      preview={`Einladung wurde abgelehnt`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📋 Einladung abgelehnt</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>Hallo {ownerName},</Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          Die Einladung an <strong>{stylistEmail}</strong> für <strong>{salonName}</strong> wurde abgelehnt.
        </Text>
      </Section>

      {reason && reason !== 'Kein Grund angegeben' && (
        <>
          <Hr style={divider} />
          <Text style={reasonLabel}>Angegebener Grund:</Text>
          <Text style={reasonText}>"{reason}"</Text>
        </>
      )}

      <Hr style={divider} />

      <Text style={tipTitle}>Tipps:</Text>
      
      <Text style={tipItem}>
        💬 <strong>Kontakt aufnehmen</strong> – Vielleicht gibt es offene Fragen
      </Text>
      <Text style={tipItem}>
        🔍 <strong>Andere Stylisten suchen</strong> – Es gibt viele qualifizierte Fachkräfte
      </Text>
      <Text style={tipItem}>
        ⏰ <strong>Später erneut einladen</strong> – Umstände können sich ändern
      </Text>

      <div style={buttonContainer}>
        <EmailButton href="https://nicnoa.de/salon/stylists" primaryColor="#3B82F6">
          {content.buttonText || 'Neue Einladung erstellen'}
        </EmailButton>
      </div>

      <Text style={note}>
        Sie können jederzeit weitere Stylisten zu Ihrem Salon einladen.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  color: '#52525b',
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

const infoBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
}

const infoText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const reasonLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const reasonText: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: '0',
  padding: '12px 16px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '3px solid #ef4444',
}

const tipTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const tipItem: React.CSSProperties = {
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

export default SalonInvitationRejectedEmail





