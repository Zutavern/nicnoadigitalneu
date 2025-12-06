import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface StylistLeftSalonEmailProps {
  salonName: string
  stylistName: string
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

export function StylistLeftSalonEmail({
  salonName,
  stylistName,
  content,
  logoUrl,
  primaryColor = '#71717a',
  footerText,
}: StylistLeftSalonEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{stylistName\}\}/g, stylistName)

  return (
    <EmailLayout
      preview={`Ihre Verbindung mit ${salonName} wurde beendet`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📋 Verbindung beendet</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>Hallo {stylistName},</Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          Ihre Zugehörigkeit zum Salon <strong>{salonName}</strong> wurde beendet.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={whatNowTitle}>Was bedeutet das?</Text>
      
      <Text style={whatNowItem}>
        ❌ <strong>Zugang beendet</strong> – Sie sehen den Salon nicht mehr in Ihrem Dashboard
      </Text>
      <Text style={whatNowItem}>
        📋 <strong>Aktive Mieten</strong> – Wurden automatisch beendet
      </Text>
      <Text style={whatNowItem}>
        📊 <strong>Historische Daten</strong> – Bleiben in Ihrem Profil erhalten
      </Text>

      <Hr style={divider} />

      <Text style={nextStepsTitle}>Nächste Schritte:</Text>
      
      <Text style={nextStepItem}>
        🔍 <strong>Neuen Salon finden</strong> – Warten Sie auf eine neue Einladung
      </Text>
      <Text style={nextStepItem}>
        📞 <strong>Fragen?</strong> – Kontaktieren Sie uns bei Unklarheiten
      </Text>

      <div style={buttonContainer}>
        <EmailButton href="https://nicnoa.de/stylist" primaryColor="#3B82F6">
          {content.buttonText || 'Zum Dashboard'}
        </EmailButton>
      </div>

      <Text style={note}>
        Falls Sie Fragen haben oder die Trennung ein Versehen war, 
        kontaktieren Sie bitte den Salonbesitzer oder unseren Support.
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
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
  borderLeft: '4px solid #ef4444',
}

const infoText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const whatNowTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const whatNowItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
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

export default StylistLeftSalonEmail


