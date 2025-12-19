import { Heading, Text, Section, Hr, Link } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import { getSalutationText, type Salutation } from '../components/EmailComponents'

interface InvoiceReceiptEmailProps {
  userName: string
  salutation?: Salutation
  invoiceNumber: string
  amount: string
  invoiceUrl: string
  planName?: string
  paymentDate?: string
  paymentMethod?: string
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

export function InvoiceReceiptEmail({
  userName,
  salutation,
  invoiceNumber,
  amount,
  invoiceUrl,
  planName,
  paymentDate,
  paymentMethod,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: InvoiceReceiptEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{invoiceNumber\}\}/g, invoiceNumber)
    .replace(/\{\{amount\}\}/g, amount)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🧾 Zahlungsbestätigung</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        {getSalutationText(salutation, userName)},
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={receiptBox}>
        <Text style={receiptTitle}>Rechnung #{invoiceNumber}</Text>
        <Hr style={receiptDivider} />
        
        {planName && (
          <div style={receiptRow}>
            <Text style={receiptLabel}>Plan</Text>
            <Text style={receiptValue}>{planName}</Text>
          </div>
        )}
        
        {paymentDate && (
          <div style={receiptRow}>
            <Text style={receiptLabel}>Datum</Text>
            <Text style={receiptValue}>{paymentDate}</Text>
          </div>
        )}
        
        {paymentMethod && (
          <div style={receiptRow}>
            <Text style={receiptLabel}>Zahlungsart</Text>
            <Text style={receiptValue}>{paymentMethod}</Text>
          </div>
        )}
        
        <Hr style={receiptDivider} />
        
        <div style={receiptRow}>
          <Text style={receiptTotalLabel}>Gesamtbetrag</Text>
          <Text style={receiptTotalValue}>{amount}</Text>
        </div>
      </Section>

      <div style={buttonContainer}>
        <EmailButton href={invoiceUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Rechnung herunterladen'}
        </EmailButton>
      </div>

      <Text style={legalNote}>
        Diese E-Mail dient als Zahlungsnachweis. Die vollständige Rechnung 
        kannst du über den Button oben herunterladen.
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
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const receiptBox: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '12px',
  padding: '24px',
  margin: '20px 0',
}

const receiptTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center',
}

const receiptDivider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '16px 0',
}

const receiptRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
}

const receiptLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const receiptValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  margin: '0',
}

const receiptTotalLabel: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const receiptTotalValue: React.CSSProperties = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const legalNote: React.CSSProperties = {
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

export default InvoiceReceiptEmail











