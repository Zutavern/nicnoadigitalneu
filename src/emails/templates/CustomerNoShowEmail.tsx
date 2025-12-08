import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface CustomerNoShowEmailProps {
  stylistName: string
  customerName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  estimatedLoss: string
  noShowCount?: number
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

export function CustomerNoShowEmail({
  stylistName,
  customerName,
  serviceName,
  bookingDate,
  bookingTime,
  estimatedLoss,
  noShowCount = 1,
  dashboardUrl = 'https://nicnoa.de/stylist/bookings',
  content,
  logoUrl,
  primaryColor = '#dc2626',
  footerText,
}: CustomerNoShowEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{customerName\}\}/g, customerName)

  return (
    <EmailLayout
      preview={`Kunde ${customerName} ist nicht erschienen`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>❌ Nicht erschienen</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Termin-Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Kunde:</strong> {customerName}
        </Text>
        <Text style={detailItem}>
          <strong>Service:</strong> {serviceName}
        </Text>
        <Text style={detailItem}>
          <strong>Datum:</strong> {bookingDate}
        </Text>
        <Text style={detailItem}>
          <strong>Uhrzeit:</strong> {bookingTime}
        </Text>
        <Text style={detailItem}>
          <strong>Geschätzter Umsatzverlust:</strong> <span style={{color: '#dc2626'}}>{estimatedLoss}</span>
        </Text>
      </div>

      {noShowCount > 1 && (
        <div style={warningBox}>
          <Text style={warningText}>
            ⚠️ Dies ist der <strong>{noShowCount}. No-Show</strong> dieses Kunden. 
            Du kannst Maßnahmen ergreifen, um zukünftige No-Shows zu vermeiden.
          </Text>
        </div>
      )}

      <Text style={optionsTitle}>📌 Deine Optionen</Text>
      
      <Text style={optionItem}>
        📧 <strong>Kunde kontaktieren</strong> – Nachfragen, ob alles in Ordnung ist
      </Text>
      <Text style={optionItem}>
        💳 <strong>Anzahlung einführen</strong> – Reduziert No-Shows um bis zu 70%
      </Text>
      <Text style={optionItem}>
        🚫 <strong>Kunde sperren</strong> – Bei wiederholten No-Shows
      </Text>
      <Text style={optionItem}>
        📅 <strong>Warteliste nutzen</strong> – Freigewordene Slots automatisch füllen
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Buchungen verwalten'}
        </EmailButton>
      </div>

      <Text style={tipText}>
        💡 <strong>Tipp:</strong> Aktiviere automatische SMS-Erinnerungen 24 Stunden 
        vor dem Termin, um die No-Show-Rate zu senken.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
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

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const warningText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const optionsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const optionItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 10px',
  paddingLeft: '4px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const tipText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
  padding: '16px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default CustomerNoShowEmail



