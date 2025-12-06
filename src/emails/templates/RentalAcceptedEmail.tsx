import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface RentalAcceptedEmailProps {
  stylistName: string
  salonName: string
  salonOwnerName: string
  chairName: string
  startDate: string
  monthlyRent: string
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

export function RentalAcceptedEmail({
  stylistName,
  salonName,
  salonOwnerName,
  chairName,
  startDate,
  monthlyRent,
  dashboardUrl = 'https://nicnoa.de/stylist/workspace',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: RentalAcceptedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)

  return (
    <EmailLayout
      preview={`Deine Bewerbung bei ${salonName} wurde angenommen!`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🎉 Glückwunsch!</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Deine Mietvereinbarung</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Ansprechpartner:</strong> {salonOwnerName}
        </Text>
        <Text style={detailItem}>
          <strong>Dein Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Startdatum:</strong> {startDate}
        </Text>
        <Text style={detailItem}>
          <strong>Monatliche Miete:</strong> {monthlyRent}
        </Text>
      </div>

      <Text style={infoTitle}>✨ Was kommt als nächstes?</Text>
      
      <Text style={infoItem}>
        1. <strong>Profil vervollständigen</strong> – Füge deine Services und Preise hinzu
      </Text>
      <Text style={infoItem}>
        2. <strong>Verfügbarkeit festlegen</strong> – Richte deinen Kalender ein
      </Text>
      <Text style={infoItem}>
        3. <strong>Buchungen aktivieren</strong> – Lass Kunden direkt bei dir buchen
      </Text>

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
  backgroundColor: '#ecfdf5',
  color: '#059669',
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

const detailsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
  border: '1px solid #a7f3d0',
}

const detailItem: React.CSSProperties = {
  color: '#065f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const infoTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const infoItem: React.CSSProperties = {
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

export default RentalAcceptedEmail


