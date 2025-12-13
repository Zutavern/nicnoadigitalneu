import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface DocumentUploadedEmailProps {
  adminName: string
  stylistName: string
  stylistEmail: string
  documentType: string
  documentName: string
  uploadDate: string
  uploadTime: string
  pendingDocuments: number
  totalDocuments: number
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

export function DocumentUploadedEmail({
  adminName,
  stylistName,
  stylistEmail,
  documentType,
  documentName,
  uploadDate,
  uploadTime,
  pendingDocuments,
  totalDocuments,
  reviewUrl = 'https://nicnoa.de/admin/onboarding',
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: DocumentUploadedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{documentType\}\}/g, documentType)

  return (
    <EmailLayout
      preview={`Neues Dokument von ${stylistName}: ${documentType}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📄 Neues Dokument</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Dokument-Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Typ:</strong> {documentType}
        </Text>
        <Text style={detailItem}>
          <strong>Dateiname:</strong> {documentName}
        </Text>
        <Text style={detailItem}>
          <strong>Hochgeladen von:</strong> {stylistName}
        </Text>
        <Text style={detailItem}>
          <strong>E-Mail:</strong> {stylistEmail}
        </Text>
        <Text style={detailItem}>
          <strong>Datum:</strong> {uploadDate} um {uploadTime}
        </Text>
      </div>

      <div style={progressBox}>
        <Text style={progressTitle}>📊 Onboarding-Fortschritt</Text>
        <div style={progressBar}>
          <div style={{
            ...progressFill,
            width: `${((totalDocuments - pendingDocuments) / totalDocuments) * 100}%`,
          }} />
        </div>
        <Text style={progressText}>
          {totalDocuments - pendingDocuments} von {totalDocuments} Dokumenten hochgeladen
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={reviewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Dokument prüfen'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#eef2ff',
  color: '#4f46e5',
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

const progressBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const progressTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const progressBar: React.CSSProperties = {
  backgroundColor: '#e4e4e7',
  borderRadius: '8px',
  height: '12px',
  overflow: 'hidden',
  marginBottom: '8px',
}

const progressFill: React.CSSProperties = {
  backgroundColor: '#6366f1',
  height: '100%',
  borderRadius: '8px',
  transition: 'width 0.3s',
}

const progressText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
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

export default DocumentUploadedEmail











