import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface ChairRentalConfirmationEmailProps {
  // Für Salon-Besitzer
  salonOwnerName: string
  salonName: string
  // Für Stylist
  stylistName: string
  stylistEmail: string
  stylistPhone?: string
  // Rental Details
  chairName: string
  startDate: string
  monthlyRent: string
  contractDuration?: string
  firstPaymentDue: string
  // Links
  rentalManagementUrl?: string
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

export function ChairRentalConfirmationEmail({
  salonOwnerName,
  salonName,
  stylistName,
  stylistEmail,
  stylistPhone,
  chairName,
  startDate,
  monthlyRent,
  contractDuration = 'Unbefristet',
  firstPaymentDue,
  rentalManagementUrl = 'https://nicnoa.de/salon/chairs',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: ChairRentalConfirmationEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{chairName\}\}/g, chairName)

  return (
    <EmailLayout
      preview={`Stuhlmiete bestätigt: ${stylistName} mietet ${chairName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>✅ Miete bestätigt</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{salonOwnerName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={confirmationBox}>
        <Text style={confirmationIcon}>🎉</Text>
        <Text style={confirmationTitle}>Mietvertrag aktiv</Text>
        <Text style={confirmationSubtitle}>
          {chairName} • ab {startDate}
        </Text>
      </div>

      <Text style={sectionTitle}>👤 Neuer Mieter</Text>
      
      <div style={stylistCard}>
        <div style={stylistAvatar}>
          {stylistName.charAt(0).toUpperCase()}
        </div>
        <div style={stylistInfo}>
          <Text style={stylistNameText}>{stylistName}</Text>
          <Text style={stylistDetail}>📧 {stylistEmail}</Text>
          {stylistPhone && (
            <Text style={stylistDetail}>📱 {stylistPhone}</Text>
          )}
        </div>
      </div>

      <Text style={sectionTitle}>📋 Mietvereinbarung</Text>
      
      <div style={detailsBox}>
        <div style={detailRow}>
          <Text style={detailLabel}>Salon</Text>
          <Text style={detailValue}>{salonName}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Platz</Text>
          <Text style={detailValue}>{chairName}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Startdatum</Text>
          <Text style={detailValue}>{startDate}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>Laufzeit</Text>
          <Text style={detailValue}>{contractDuration}</Text>
        </div>
        <Hr style={detailDivider} />
        <div style={detailRow}>
          <Text style={rentLabel}>Monatliche Miete</Text>
          <Text style={rentValue}>{monthlyRent}</Text>
        </div>
      </div>

      <div style={paymentBox}>
        <Text style={paymentIcon}>💰</Text>
        <Text style={paymentText}>
          Erste Zahlung fällig am <strong>{firstPaymentDue}</strong>
        </Text>
      </div>

      <Text style={nextStepsTitle}>📌 Nächste Schritte</Text>
      
      <Text style={nextStepItem}>
        1. <strong>Mieter begrüßen</strong> – Vereinbare ein Kennenlernen
      </Text>
      <Text style={nextStepItem}>
        2. <strong>Schlüssel übergeben</strong> – Organisiere den Zugang
      </Text>
      <Text style={nextStepItem}>
        3. <strong>Einweisung</strong> – Erkläre Abläufe und Hausregeln
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={rentalManagementUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Mietverhältnis verwalten'}
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

const confirmationBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const confirmationIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const confirmationTitle: React.CSSProperties = {
  color: 'white',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const confirmationSubtitle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: '15px',
  margin: 0,
}

const sectionTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const stylistCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#f4f4f5',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
}

const stylistAvatar: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: '#6366f1',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  fontWeight: '700',
}

const stylistInfo: React.CSSProperties = {
  flex: 1,
}

const stylistNameText: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 6px',
}

const stylistDetail: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 2px',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
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
}

const detailDivider: React.CSSProperties = {
  borderColor: '#d4d4d8',
  margin: '12px 0',
}

const rentLabel: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: 0,
}

const rentValue: React.CSSProperties = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: '700',
  margin: 0,
}

const paymentBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '0 0 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const paymentIcon: React.CSSProperties = {
  fontSize: '24px',
  margin: 0,
}

const paymentText: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
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

export default ChairRentalConfirmationEmail







