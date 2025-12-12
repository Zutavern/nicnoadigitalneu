import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface PaymentReceivedEmailProps {
  salonOwnerName: string
  stylistName: string
  chairName: string
  amount: string
  paymentDate: string
  paymentMethod: string
  periodDescription: string
  invoiceNumber?: string
  invoiceUrl?: string
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

export function PaymentReceivedEmail({
  salonOwnerName,
  stylistName,
  chairName,
  amount,
  paymentDate,
  paymentMethod,
  periodDescription,
  invoiceNumber,
  invoiceUrl,
  dashboardUrl = 'https://nicnoa.de/salon/invoices',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: PaymentReceivedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{amount\}\}/g, amount)

  return (
    <EmailLayout
      preview={`Zahlung von ${amount} erhalten`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💰 Zahlung eingegangen</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{salonOwnerName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={amountBox}>
        <Text style={amountLabel}>Betrag erhalten</Text>
        <Text style={amountValue}>{amount}</Text>
      </div>

      <Text style={detailsTitle}>📋 Zahlungsdetails</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Von:</strong> {stylistName}
        </Text>
        <Text style={detailItem}>
          <strong>Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Zeitraum:</strong> {periodDescription}
        </Text>
        <Text style={detailItem}>
          <strong>Zahlungsdatum:</strong> {paymentDate}
        </Text>
        <Text style={detailItem}>
          <strong>Zahlungsart:</strong> {paymentMethod}
        </Text>
        {invoiceNumber && (
          <Text style={detailItem}>
            <strong>Rechnungsnr.:</strong> {invoiceNumber}
          </Text>
        )}
      </div>

      <div style={buttonContainer}>
        <EmailButton href={invoiceUrl || dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Zahlungen verwalten'}
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

const amountBox: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #a7f3d0',
}

const amountLabel: React.CSSProperties = {
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const amountValue: React.CSSProperties = {
  color: '#059669',
  fontSize: '36px',
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

export default PaymentReceivedEmail








