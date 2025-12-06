import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SalonInvitationUnregisteredEmailProps {
  salonName: string
  inviterName: string
  invitationUrl: string
  registrationUrl: string
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

export function SalonInvitationUnregisteredEmail({
  salonName,
  inviterName,
  invitationUrl,
  registrationUrl,
  message,
  content,
  logoUrl,
  primaryColor = '#3B82F6',
  footerText,
}: SalonInvitationUnregisteredEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{inviterName\}\}/g, inviterName)

  return (
    <EmailLayout
      preview={`${salonName} lädt Sie zu NICNOA ein`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎉 Einladung zu NICNOA</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={inviteBox}>
        <Text style={inviteEmoji}>💇‍♀️</Text>
        <Text style={inviteText}>
          <strong>{inviterName}</strong> von <strong>{salonName}</strong> möchte Sie 
          als Stuhlmieter in seinem Salon willkommen heißen!
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

      <Text style={stepsTitle}>So geht's weiter:</Text>
      
      <Section style={stepBox}>
        <Text style={stepNumber}>1</Text>
        <Text style={stepText}>
          <strong>Registrieren Sie sich kostenlos</strong> auf der NICNOA Plattform
        </Text>
      </Section>
      
      <Section style={stepBox}>
        <Text style={stepNumber}>2</Text>
        <Text style={stepText}>
          <strong>Schließen Sie das Onboarding ab</strong> – Wir prüfen Ihre Qualifikation
        </Text>
      </Section>
      
      <Section style={stepBox}>
        <Text style={stepNumber}>3</Text>
        <Text style={stepText}>
          <strong>Nehmen Sie die Einladung an</strong> – Starten Sie als Stuhlmieter
        </Text>
      </Section>

      <div style={buttonContainer}>
        <EmailButton href={registrationUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt kostenlos registrieren'}
        </EmailButton>
      </div>

      <Hr style={divider} />

      <Text style={benefitsTitle}>Warum NICNOA?</Text>
      
      <Text style={benefitItem}>
        ✨ <strong>Professionelle Plattform</strong> – Für Friseure und Salons
      </Text>
      <Text style={benefitItem}>
        📅 <strong>Einfache Buchungen</strong> – Termine digital verwalten
      </Text>
      <Text style={benefitItem}>
        💰 <strong>Mehr Umsatz</strong> – Durch bessere Sichtbarkeit
      </Text>
      <Text style={benefitItem}>
        🤝 <strong>Netzwerk</strong> – Verbinden Sie sich mit Salons
      </Text>

      <Text style={note}>
        Diese Einladung ist 7 Tage gültig. Nach der Registrierung können Sie 
        die Einladung in Ihrem Dashboard annehmen.
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

const stepsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const stepBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '12px',
}

const stepNumber: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: '#3B82F6',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '28px',
  textAlign: 'center',
  margin: '0',
}

const stepText: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '2px 0 0',
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

export default SalonInvitationUnregisteredEmail


