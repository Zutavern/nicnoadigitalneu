import { Heading, Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface BookingConfirmationEmailProps {
  userName: string
  stylistName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  salonName?: string
  salonAddress?: string
  price?: string
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

export function BookingConfirmationEmail({
  userName,
  stylistName,
  serviceName,
  bookingDate,
  bookingTime,
  salonName,
  salonAddress,
  price,
  dashboardUrl = 'https://nicnoa.de/dashboard/bookings',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: BookingConfirmationEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{serviceName\}\}/g, serviceName)
    .replace(/\{\{bookingDate\}\}/g, bookingDate)
    .replace(/\{\{bookingTime\}\}/g, bookingTime)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>✅ Termin bestätigt</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={bookingCard}>
        <div style={dateSection}>
          <Text style={dateDay}>{bookingDate.split(',')[0] || bookingDate}</Text>
          <Text style={dateTime}>{bookingTime} Uhr</Text>
        </div>
        
        <Hr style={cardDivider} />
        
        <div style={detailsSection}>
          <div style={detailRow}>
            <Text style={detailIcon}>💇</Text>
            <div>
              <Text style={detailLabel}>Service</Text>
              <Text style={detailValue}>{serviceName}</Text>
            </div>
          </div>
          
          <div style={detailRow}>
            <Text style={detailIcon}>👤</Text>
            <div>
              <Text style={detailLabel}>Stylist</Text>
              <Text style={detailValue}>{stylistName}</Text>
            </div>
          </div>
          
          {salonName && (
            <div style={detailRow}>
              <Text style={detailIcon}>📍</Text>
              <div>
                <Text style={detailLabel}>Location</Text>
                <Text style={detailValue}>{salonName}</Text>
                {salonAddress && <Text style={addressText}>{salonAddress}</Text>}
              </div>
            </div>
          )}
          
          {price && (
            <div style={detailRow}>
              <Text style={detailIcon}>💰</Text>
              <div>
                <Text style={detailLabel}>Preis</Text>
                <Text style={detailValue}>{price}</Text>
              </div>
            </div>
          )}
        </div>
      </Section>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Termin verwalten'}
        </EmailButton>
      </div>

      <Text style={note}>
        Bitte erscheine pünktlich zu deinem Termin. Bei Verhinderung 
        bitten wir dich, mindestens 24 Stunden vorher abzusagen.
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

const bookingCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '2px solid #10b981',
  borderRadius: '16px',
  overflow: 'hidden',
  margin: '24px 0',
}

const dateSection: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '24px',
  textAlign: 'center',
}

const dateDay: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const dateTime: React.CSSProperties = {
  color: '#a7f3d0',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
}

const cardDivider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '0',
}

const detailsSection: React.CSSProperties = {
  padding: '20px 24px',
}

const detailRow: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
}

const detailIcon: React.CSSProperties = {
  fontSize: '20px',
  margin: '0',
  width: '24px',
}

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  margin: '0 0 2px',
}

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0',
}

const addressText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  margin: '2px 0 0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const note: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  backgroundColor: '#f4f4f5',
  padding: '12px 16px',
  borderRadius: '8px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default BookingConfirmationEmail


