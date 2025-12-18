import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface NewRentalRequestEmailProps {
  salonOwnerName: string
  stylistName: string
  stylistEmail: string
  chairName: string
  salonName: string
  requestedStartDate?: string
  message?: string
  reviewUrl?: string
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

export function NewRentalRequestEmail({
  salonOwnerName,
  stylistName,
  stylistEmail,
  chairName,
  salonName,
  requestedStartDate,
  message,
  reviewUrl = 'https://nicnoa.de/salon/chairs',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: NewRentalRequestEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{chairName\}\}/g, chairName)
    .replace(/\{\{salonName\}\}/g, salonName)

  return (
    <EmailLayout
      preview={`Neue Mietanfrage von ${stylistName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💺 Neue Anfrage</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{salonOwnerName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Anfrage-Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Stuhlmieter:</strong> {stylistName}
        </Text>
        <Text style={detailItem}>
          <strong>E-Mail:</strong> {stylistEmail}
        </Text>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Gewünschter Platz:</strong> {chairName}
        </Text>
        {requestedStartDate && (
          <Text style={detailItem}>
            <strong>Gewünschter Start:</strong> {requestedStartDate}
          </Text>
        )}
      </div>

      {message && (
        <>
          <Text style={detailsTitle}>💬 Nachricht</Text>
          <div style={messageBox}>
            <Text style={messageText}>"{message}"</Text>
          </div>
        </>
      )}

      <div style={buttonContainer}>
        <EmailButton href={reviewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Anfrage prüfen'}
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

const messageBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const messageText: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: 0,
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

export default NewRentalRequestEmail











