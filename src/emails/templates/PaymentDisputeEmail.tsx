import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface PaymentDisputeEmailProps {
  adminName: string
  disputeId: string
  disputeDate: string
  customerName: string
  customerEmail: string
  amount: string
  currency?: string
  reason: string
  reasonDescription: string
  paymentDate: string
  subscriptionPlan?: string
  responseDeadline: string
  daysRemaining: number
  stripeDisputeUrl?: string
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

export function PaymentDisputeEmail({
  adminName,
  disputeId,
  disputeDate,
  customerName,
  customerEmail,
  amount,
  currency = 'EUR',
  reason,
  reasonDescription,
  paymentDate,
  subscriptionPlan,
  responseDeadline,
  daysRemaining,
  stripeDisputeUrl = 'https://dashboard.stripe.com/disputes',
  dashboardUrl = 'https://nicnoa.de/admin/revenue',
  content,
  logoUrl,
  primaryColor = '#dc2626',
  footerText,
}: PaymentDisputeEmailProps) {
  const bodyText = content.body
    .replace(/\{\{adminName\}\}/g, adminName)
    .replace(/\{\{customerName\}\}/g, customerName)
    .replace(/\{\{amount\}\}/g, amount)

  const urgencyLevel = daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'warning' : 'normal'

  return (
    <EmailLayout
      preview={`🚨 Zahlungsstreit: ${amount} ${currency} von ${customerName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🚨 Zahlungsstreit</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Alert Box */}
      <div style={alertBox}>
        <Text style={alertIcon}>⚠️</Text>
        <Text style={alertTitle}>Dispute eingegangen</Text>
        <Text style={alertAmount}>{amount} {currency}</Text>
        <Text style={alertSubtitle}>ID: {disputeId}</Text>
      </div>

      {/* Urgency Warning */}
      <div style={urgencyLevel === 'critical' ? urgencyBoxCritical : urgencyLevel === 'warning' ? urgencyBoxWarning : urgencyBoxNormal}>
        <Text style={urgencyTitle}>
          {urgencyLevel === 'critical' ? '🔴 DRINGEND' : urgencyLevel === 'warning' ? '🟠 Bald fällig' : '🟢 Zeit vorhanden'}
        </Text>
        <Text style={urgencyText}>
          Antwort erforderlich bis: <strong>{responseDeadline}</strong>
        </Text>
        <Text style={urgencyDays}>
          Noch {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} verbleibend
        </Text>
      </div>

      {/* Dispute Details */}
      <Text style={sectionTitle}>📋 Dispute-Details</Text>
      
      <div style={detailsBox}>
        <div style={detailRow}>
          <Text style={detailLabel}>Kunde</Text>
          <Text style={detailValue}>{customerName}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>E-Mail</Text>
          <Text style={detailValue}>{customerEmail}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Betrag</Text>
          <Text style={detailValueHighlight}>{amount} {currency}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Zahlungsdatum</Text>
          <Text style={detailValue}>{paymentDate}</Text>
        </div>
        {subscriptionPlan && (
          <div style={detailRow}>
            <Text style={detailLabel}>Abo-Plan</Text>
            <Text style={detailValue}>{subscriptionPlan}</Text>
          </div>
        )}
        <div style={detailRow}>
          <Text style={detailLabel}>Dispute-Datum</Text>
          <Text style={detailValue}>{disputeDate}</Text>
        </div>
      </div>

      {/* Reason */}
      <Text style={sectionTitle}>❓ Streitgrund</Text>
      
      <div style={reasonBox}>
        <Text style={reasonTitle}>{reason}</Text>
        <Text style={reasonDescription}>{reasonDescription}</Text>
      </div>

      {/* Required Actions */}
      <div style={actionsBox}>
        <Text style={actionsTitle}>📝 Erforderliche Schritte</Text>
        <div style={actionItem}>
          <Text style={actionNumber}>1</Text>
          <div style={actionContent}>
            <Text style={actionTitle}>Beweise sammeln</Text>
            <Text style={actionDesc}>
              Rechnungen, Liefernachweise, Kommunikation mit dem Kunden
            </Text>
          </div>
        </div>
        <div style={actionItem}>
          <Text style={actionNumber}>2</Text>
          <div style={actionContent}>
            <Text style={actionTitle}>Stripe-Formular ausfüllen</Text>
            <Text style={actionDesc}>
              Alle relevanten Dokumente im Stripe-Dashboard hochladen
            </Text>
          </div>
        </div>
        <div style={actionItem}>
          <Text style={actionNumber}>3</Text>
          <div style={actionContent}>
            <Text style={actionTitle}>Antwort einreichen</Text>
            <Text style={actionDesc}>
              Vor Ablauf der Frist ({responseDeadline}) antworten
            </Text>
          </div>
        </div>
      </div>

      {/* Consequences */}
      <div style={warningBox}>
        <Text style={warningTitle}>⚠️ Wichtiger Hinweis</Text>
        <Text style={warningText}>
          Wird nicht rechtzeitig geantwortet, geht der Streit automatisch zugunsten 
          des Kunden aus. Der Betrag von {amount} {currency} plus eventuelle 
          Dispute-Gebühren werden dann abgebucht.
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={stripeDisputeUrl} primaryColor={primaryColor}>
          {content.buttonText || 'In Stripe öffnen'}
        </EmailButton>
      </div>

      <Text style={secondaryLink}>
        Oder im <a href={dashboardUrl} style={link}>Admin-Dashboard</a> ansehen
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

const alertBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #fca5a5',
}

const alertIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const alertTitle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const alertAmount: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const alertSubtitle: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '12px',
  margin: 0,
  fontFamily: 'monospace',
}

const urgencyBoxCritical: React.CSSProperties = {
  backgroundColor: '#dc2626',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center',
}

const urgencyBoxWarning: React.CSSProperties = {
  backgroundColor: '#f97316',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center',
}

const urgencyBoxNormal: React.CSSProperties = {
  backgroundColor: '#22c55e',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center',
}

const urgencyTitle: React.CSSProperties = {
  color: 'white',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const urgencyText: React.CSSProperties = {
  color: 'white',
  fontSize: '14px',
  margin: '0 0 4px',
}

const urgencyDays: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '12px',
  margin: 0,
}

const sectionTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
}

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
  textAlign: 'right',
}

const detailValueHighlight: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '700',
  margin: 0,
  textAlign: 'right',
}

const reasonBox: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #fed7aa',
}

const reasonTitle: React.CSSProperties = {
  color: '#9a3412',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const reasonDescription: React.CSSProperties = {
  color: '#c2410c',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const actionsBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
}

const actionsTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const actionItem: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
}

const actionNumber: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: 'white',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: '700',
  flexShrink: 0,
  margin: 0,
  lineHeight: '24px',
  textAlign: 'center',
}

const actionContent: React.CSSProperties = {
  flex: 1,
}

const actionTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const actionDesc: React.CSSProperties = {
  color: '#3b82f6',
  fontSize: '13px',
  margin: 0,
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #fca5a5',
}

const warningTitle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const warningText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 16px',
}

const secondaryLink: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  textAlign: 'center',
  margin: '0 0 24px',
}

const link: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default PaymentDisputeEmail









