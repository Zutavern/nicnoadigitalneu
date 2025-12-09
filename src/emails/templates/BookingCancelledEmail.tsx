import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface BookingCancelledEmailProps {
  userName: string
  serviceName: string
  bookingDate: string
  bookingTime?: string
  reason?: string
  rebookUrl?: string
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

export function BookingCancelledEmail({
  userName,
  serviceName,
  bookingDate,
  bookingTime,
  reason,
  rebookUrl = 'https://nicnoa.de/dashboard/bookings/new',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: BookingCancelledEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{serviceName\}\}/g, serviceName)
    .replace(/\{\{bookingDate\}\}/g, bookingDate)

  return (
    <EmailLayout
      preview={content.headline}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>❌ Termin storniert</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={cancelBox}>
        <Text style={cancelTitle}>Stornierter Termin</Text>
        <Text style={cancelService}>{serviceName}</Text>
        <Text style={cancelDate}>
          {bookingDate}
          {bookingTime && ` um ${bookingTime} Uhr`}
        </Text>
      </Section>

      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonTitle}>Grund</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}

      <Text style={paragraph}>
        Wir bedauern, dass dieser Termin nicht stattfinden kann. 
        Du kannst jederzeit einen neuen Termin buchen.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={rebookUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Neuen Termin buchen'}
        </EmailButton>
      </div>

      <Text style={helpText}>
        Bei Fragen stehen wir dir gerne zur Verfügung.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
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

const cancelBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '20px 0',
}

const cancelTitle: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const cancelService: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
  textDecoration: 'line-through',
}

const cancelDate: React.CSSProperties = {
  color: '#7f1d1d',
  fontSize: '14px',
  margin: '0',
}

const reasonBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '10px',
  padding: '16px',
  margin: '16px 0',
}

const reasonTitle: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const reasonText: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const helpText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  textAlign: 'center',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default BookingCancelledEmail




