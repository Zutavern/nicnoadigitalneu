import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface RentPaymentOverdueEmailProps {
  stylistName: string
  salonName: string
  chairName: string
  amount: string
  originalDueDate: string
  daysOverdue: number
  lateFee?: string
  totalAmount: string
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

export function RentPaymentOverdueEmail({
  stylistName,
  salonName,
  chairName,
  amount,
  originalDueDate,
  daysOverdue,
  lateFee,
  totalAmount,
  paymentUrl = 'https://nicnoa.de/stylist/invoices',
  content,
  logoUrl,
  primaryColor = '#dc2626',
  footerText,
}: RentPaymentOverdueEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{amount\}\}/g, amount)
    .replace(/\{\{daysOverdue\}\}/g, String(daysOverdue))

  return (
    <EmailLayout
      preview={`⚠️ Miete überfällig - ${totalAmount} ausstehend`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⚠️ Überfällige Zahlung</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={urgentBox}>
        <Text style={urgentIcon}>⚠️</Text>
        <Text style={urgentTitle}>{daysOverdue} {daysOverdue === 1 ? 'Tag' : 'Tage'} überfällig</Text>
        <Text style={urgentText}>
          Bitte begleiche den ausstehenden Betrag umgehend, um Einschränkungen zu vermeiden.
        </Text>
      </div>

      <div style={amountBox}>
        <div style={amountRow}>
          <Text style={amountLabel}>Ursprünglicher Betrag:</Text>
          <Text style={amountValue}>{amount}</Text>
        </div>
        {lateFee && (
          <div style={amountRow}>
            <Text style={amountLabel}>Verspätungsgebühr:</Text>
            <Text style={{...amountValue, color: '#dc2626'}}>{lateFee}</Text>
          </div>
        )}
        <Hr style={amountDivider} />
        <div style={amountRow}>
          <Text style={totalLabel}>Gesamtbetrag:</Text>
          <Text style={totalValue}>{totalAmount}</Text>
        </div>
      </div>

      <Text style={detailsTitle}>📋 Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Ursprüngliche Fälligkeit:</strong> {originalDueDate}
        </Text>
        <Text style={detailItem}>
          <strong>Tage überfällig:</strong> {daysOverdue}
        </Text>
      </div>

      <Text style={warningTitle}>⚠️ Wichtig</Text>
      <div style={warningBox}>
        <Text style={warningItem}>
          • Nach 7 Tagen: Buchungsfunktion wird eingeschränkt
        </Text>
        <Text style={warningItem}>
          • Nach 14 Tagen: Account wird vorübergehend gesperrt
        </Text>
        <Text style={warningItem}>
          • Nach 30 Tagen: Mietvertrag wird automatisch gekündigt
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={paymentUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Sofort bezahlen'}
        </EmailButton>
      </div>

      <Text style={supportText}>
        Bei Zahlungsschwierigkeiten kontaktiere bitte unseren Support. 
        Wir finden gemeinsam eine Lösung.
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

const urgentBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #fca5a5',
}

const urgentIcon: React.CSSProperties = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const urgentTitle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const urgentText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const amountBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const amountRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
}

const amountLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '15px',
  margin: 0,
}

const amountValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: 0,
}

const amountDivider: React.CSSProperties = {
  borderColor: '#d4d4d8',
  margin: '12px 0',
}

const totalLabel: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: 0,
}

const totalValue: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: '700',
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

const warningTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const warningItem: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 6px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const supportText: React.CSSProperties = {
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

export default RentPaymentOverdueEmail



