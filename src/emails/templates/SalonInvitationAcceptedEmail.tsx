import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SalonInvitationAcceptedEmailProps {
  salonName: string
  stylistName: string
  ownerName: string
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

export function SalonInvitationAcceptedEmail({
  salonName,
  stylistName,
  ownerName,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: SalonInvitationAcceptedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{ownerName\}\}/g, ownerName)

  return (
    <EmailLayout
      preview={`${stylistName} hat Ihre Einladung angenommen!`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎉 Einladung angenommen</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>Hallo {ownerName},</Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={successBox}>
        <Text style={successEmoji}>✅</Text>
        <Text style={successText}>
          <strong>{stylistName}</strong> ist jetzt Teil Ihres Salons <strong>{salonName}</strong>!
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={nextStepsTitle}>Nächste Schritte:</Text>
      
      <Text style={nextStepItem}>
        📋 <strong>Stuhlmiete vereinbaren</strong> – Besprechen Sie die Konditionen
      </Text>
      <Text style={nextStepItem}>
        🔑 <strong>Arbeitsplatz zuweisen</strong> – Wählen Sie einen verfügbaren Stuhl
      </Text>
      <Text style={nextStepItem}>
        📅 <strong>Startdatum festlegen</strong> – Wann soll es losgehen?
      </Text>

      <div style={buttonContainer}>
        <EmailButton href="https://www.nicnoa.online/salon/stylists" primaryColor={primaryColor}>
          {content.buttonText || 'Zum Stylisten-Dashboard'}
        </EmailButton>
      </div>

      <Text style={note}>
        Sie können nun die Stuhlmiete für {stylistName} in Ihrem Dashboard konfigurieren.
      </Text>

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

const successBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const successEmoji: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 12px',
}

const successText: React.CSSProperties = {
  color: '#166534',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
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

const nextStepItem: React.CSSProperties = {
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

export default SalonInvitationAcceptedEmail










