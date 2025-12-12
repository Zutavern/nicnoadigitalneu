import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface BookingReminderEmailProps {
  userName: string
  stylistName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  salonName?: string
  salonAddress?: string
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

export function BookingReminderEmail({
  userName,
  stylistName,
  serviceName,
  bookingDate,
  bookingTime,
  salonName,
  salonAddress,
  dashboardUrl = 'https://nicnoa.de/dashboard/bookings',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: BookingReminderEmailProps) {
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
      <Text style={badge}>⏰ Terminerinnerung</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={reminderBox}>
        <Text style={reminderIcon}>📅</Text>
        <Text style={reminderTitle}>Morgen um {bookingTime} Uhr</Text>
        <Text style={reminderSubtitle}>{serviceName} bei {stylistName}</Text>
        
        {salonName && (
          <Text style={locationText}>
            📍 {salonName}
            {salonAddress && <><br />{salonAddress}</>}
          </Text>
        )}
      </Section>

      <Text style={checklistTitle}>Vor dem Termin:</Text>
      <Text style={checklistItem}>✓ Komm bitte 5-10 Minuten vorher</Text>
      <Text style={checklistItem}>✓ Teile uns mit, falls sich etwas ändert</Text>
      <Text style={checklistItem}>✓ Bring Inspirationsbilder mit, falls vorhanden</Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Termin ansehen'}
        </EmailButton>
      </div>

      <Text style={cancelNote}>
        Kannst du nicht kommen? Bitte sage deinen Termin rechtzeitig ab, 
        damit andere Kunden die Möglichkeit haben, den Slot zu nutzen.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
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

const reminderBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  borderRadius: '16px',
  padding: '28px',
  textAlign: 'center',
  margin: '24px 0',
}

const reminderIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 12px',
}

const reminderTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const reminderSubtitle: React.CSSProperties = {
  color: '#bfdbfe',
  fontSize: '15px',
  margin: '0 0 12px',
}

const locationText: React.CSSProperties = {
  color: '#93c5fd',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const checklistTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '20px 0 12px',
}

const checklistItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const cancelNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default BookingReminderEmail








