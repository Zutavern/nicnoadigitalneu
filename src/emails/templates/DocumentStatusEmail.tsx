import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface DocumentStatusEmailProps {
  stylistName: string
  documentType: string
  documentName: string
  status: 'approved' | 'rejected'
  reviewedBy?: string
  reviewDate: string
  rejectionReason?: string
  nextSteps?: string[]
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

export function DocumentStatusEmail({
  stylistName,
  documentType,
  documentName,
  status,
  reviewedBy,
  reviewDate,
  rejectionReason,
  nextSteps = [],
  dashboardUrl = 'https://nicnoa.de/onboarding/stylist',
  content,
  logoUrl,
  primaryColor,
  footerText,
}: DocumentStatusEmailProps) {
  const isApproved = status === 'approved'
  const color = isApproved ? '#10b981' : '#dc2626'

  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{documentType\}\}/g, documentType)

  return (
    <EmailLayout
      preview={`Dokument ${isApproved ? 'genehmigt' : 'abgelehnt'}: ${documentType}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor || color}
      footerText={footerText}
    >
      <Text style={isApproved ? approvedBadge : rejectedBadge}>
        {isApproved ? '✅ Genehmigt' : '❌ Abgelehnt'}
      </Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={isApproved ? statusBoxApproved : statusBoxRejected}>
        <Text style={statusIcon}>{isApproved ? '✅' : '❌'}</Text>
        <Text style={isApproved ? statusTitleApproved : statusTitleRejected}>
          Dokument {isApproved ? 'genehmigt' : 'abgelehnt'}
        </Text>
      </div>

      <Text style={detailsTitle}>📋 Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Dokumenttyp:</strong> {documentType}
        </Text>
        <Text style={detailItem}>
          <strong>Dateiname:</strong> {documentName}
        </Text>
        <Text style={detailItem}>
          <strong>Geprüft am:</strong> {reviewDate}
        </Text>
        {reviewedBy && (
          <Text style={detailItem}>
            <strong>Geprüft von:</strong> {reviewedBy}
          </Text>
        )}
      </div>

      {!isApproved && rejectionReason && (
        <>
          <Text style={reasonTitle}>📝 Ablehnungsgrund</Text>
          <div style={reasonBox}>
            <Text style={reasonText}>{rejectionReason}</Text>
          </div>
        </>
      )}

      {nextSteps.length > 0 && (
        <>
          <Text style={nextStepsTitle}>
            {isApproved ? '✨ Nächste Schritte' : '📌 Was du tun kannst'}
          </Text>
          {nextSteps.map((step, index) => (
            <Text key={index} style={nextStepItem}>
              {index + 1}. {step}
            </Text>
          ))}
        </>
      )}

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor || color}>
          {content.buttonText || (isApproved ? 'Weiter im Onboarding' : 'Dokument erneut hochladen')}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const approvedBadge: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  color: '#059669',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const rejectedBadge: React.CSSProperties = {
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

const statusBoxApproved: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #a7f3d0',
}

const statusBoxRejected: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #fca5a5',
}

const statusIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const statusTitleApproved: React.CSSProperties = {
  color: '#065f46',
  fontSize: '20px',
  fontWeight: '700',
  margin: 0,
}

const statusTitleRejected: React.CSSProperties = {
  color: '#991b1b',
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

const reasonTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const reasonBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const reasonText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: 0,
}

const nextStepsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const nextStepItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
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

export default DocumentStatusEmail




