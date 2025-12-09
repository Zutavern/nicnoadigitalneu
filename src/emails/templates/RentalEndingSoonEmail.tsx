import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface RentalEndingSoonEmailProps {
  userName: string
  salonName: string
  chairName: string
  endDate: string
  daysRemaining: number
  renewUrl?: string
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

export function RentalEndingSoonEmail({
  userName,
  salonName,
  chairName,
  endDate,
  daysRemaining,
  renewUrl = 'https://nicnoa.de/stylist/workspace',
  content,
  logoUrl,
  primaryColor = '#f59e0b',
  footerText,
}: RentalEndingSoonEmailProps) {
  const bodyText = content.body
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{endDate\}\}/g, endDate)
    .replace(/\{\{daysRemaining\}\}/g, String(daysRemaining))

  return (
    <EmailLayout
      preview={`Dein Mietvertrag endet in ${daysRemaining} Tagen`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⏰ Erinnerung</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={warningBox}>
        <Text style={warningText}>
          ⚠️ Noch <strong>{daysRemaining} Tage</strong> bis zum Vertragsende
        </Text>
      </div>

      <Text style={detailsTitle}>📋 Vertragsdetails</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Dein Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Vertragsende:</strong> {endDate}
        </Text>
      </div>

      <Text style={optionsTitle}>📌 Deine Optionen</Text>
      
      <Text style={optionItem}>
        ✅ <strong>Vertrag verlängern</strong> – Behalte deinen Platz und alle Kunden
      </Text>
      <Text style={optionItem}>
        🔄 <strong>Neuen Salon finden</strong> – Entdecke andere verfügbare Plätze
      </Text>
      <Text style={optionItem}>
        ❌ <strong>Kündigen</strong> – Beende deine Miete planmäßig
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={renewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Vertrag verlängern'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  color: '#d97706',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '28px 0',
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const warningText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '16px',
  margin: 0,
}

const detailsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const detailItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const optionsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const optionItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
  paddingLeft: '4px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default RentalEndingSoonEmail




