import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import { getSalutationText, type Salutation } from '../components/EmailComponents'

interface RentPaymentDueEmailProps {
  stylistName: string
  salutation?: Salutation
  salonName: string
  chairName: string
  amount: string
  dueDate: string
  periodDescription: string
  daysUntilDue: number
  paymentUrl?: string
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

export function RentPaymentDueEmail({
  stylistName,
  salutation,
  salonName,
  chairName,
  amount,
  dueDate,
  periodDescription,
  daysUntilDue,
  paymentUrl = 'https://nicnoa.online/stylist/invoices',
  content,
  logoUrl,
  primaryColor = '#f59e0b',
  footerText,
}: RentPaymentDueEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{amount\}\}/g, amount)
    .replace(/\{\{dueDate\}\}/g, dueDate)

  return (
    <EmailLayout
      preview={`Miete von ${amount} fällig am ${dueDate}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💳 Zahlungserinnerung</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        {getSalutationText(salutation, stylistName)},
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={amountBox}>
        <Text style={amountLabel}>Fälliger Betrag</Text>
        <Text style={amountValue}>{amount}</Text>
        <Text style={dueDateText}>Fällig am {dueDate}</Text>
      </div>

      <div style={countdownBox}>
        <Text style={countdownText}>
          ⏰ Noch <strong>{daysUntilDue} {daysUntilDue === 1 ? 'Tag' : 'Tage'}</strong> bis zur Fälligkeit
        </Text>
      </div>

      <Text style={detailsTitle}>📋 Zahlungsdetails</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Zeitraum:</strong> {periodDescription}
        </Text>
        <Text style={detailItem}>
          <strong>Betrag:</strong> {amount}
        </Text>
        <Text style={detailItem}>
          <strong>Fälligkeitsdatum:</strong> {dueDate}
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={paymentUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt bezahlen'}
        </EmailButton>
      </div>

      <Text style={noteText}>
        💡 Bei automatischer Zahlung wird der Betrag am Fälligkeitsdatum abgebucht. 
        Stelle sicher, dass dein Konto gedeckt ist.
      </Text>

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

const amountBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 16px',
  textAlign: 'center',
  border: '2px solid #fcd34d',
}

const amountLabel: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const amountValue: React.CSSProperties = {
  color: '#d97706',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const dueDateText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  margin: 0,
}

const countdownBox: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '12px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const countdownText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '15px',
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

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const noteText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0 0 16px',
  padding: '0 20px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default RentPaymentDueEmail











