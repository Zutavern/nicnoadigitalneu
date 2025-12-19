import * as React from 'react'
import { Row, Column, Text } from '@react-email/components'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import {
  EmailBadge,
  EmailHeading,
  EmailParagraph,
  EmailDivider,
  EmailInfoCard,
  EmailButtonContainer,
  EmailFooterNote,
  EmailGreeting,
  type Salutation,
} from '../components/EmailComponents'

interface BookingConfirmationEmailProps {
  userName: string
  salutation?: Salutation
  stylistName: string
  salonName?: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  duration?: string
  price?: string
  bookingUrl?: string
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
  salutation,
  stylistName,
  salonName,
  serviceName,
  bookingDate,
  bookingTime,
  duration,
  price,
  bookingUrl = 'https://nicnoa.de/dashboard/bookings',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: BookingConfirmationEmailProps) {
  const bodyText = content.body
    .replace(/\{\{serviceName\}\}/g, serviceName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{bookingDate\}\}/g, bookingDate)
    .replace(/\{\{bookingTime\}\}/g, bookingTime)

  return (
    <EmailLayout
      preview={`Dein Termin am ${bookingDate} um ${bookingTime} Uhr ist bestätigt!`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <EmailBadge variant="success" icon="✅">
        Termin bestätigt
      </EmailBadge>

      <EmailHeading as="h1">{content.headline}</EmailHeading>

      <EmailGreeting userName={userName} salutation={salutation} />

      <EmailParagraph>{bodyText}</EmailParagraph>

      <EmailDivider />

      {/* Booking Details Card */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        margin: '24px 0',
        border: '1px solid #e2e8f0',
      }}>
        <Text style={{ margin: '0 0 16px', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📋 Termindetails
        </Text>

        <Row style={{ marginBottom: '12px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Dienstleistung</Text>
            <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{serviceName}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Stuhlmieter</Text>
            <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>{stylistName}</Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: '12px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Datum</Text>
            <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>📅 {bookingDate}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Uhrzeit</Text>
            <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>🕐 {bookingTime} Uhr</Text>
          </Column>
        </Row>

        {(duration || price) && (
          <Row>
            {duration && (
              <Column style={{ width: '50%' }}>
                <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Dauer</Text>
                <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>⏱️ {duration}</Text>
              </Column>
            )}
            {price && (
              <Column style={{ width: '50%' }}>
                <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Preis</Text>
                <Text style={{ margin: '4px 0 0', color: primaryColor, fontSize: '15px', fontWeight: '600' }}>💰 {price}</Text>
              </Column>
            )}
          </Row>
        )}

        {salonName && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <Text style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>Salon</Text>
            <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '15px', fontWeight: '600' }}>📍 {salonName}</Text>
          </div>
        )}
      </div>

      <EmailButtonContainer>
        <EmailButton href={bookingUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Termin verwalten'}
        </EmailButton>
      </EmailButtonContainer>

      <EmailInfoCard variant="info" icon="ℹ️">
        <strong>Absagen oder ändern?</strong> Bitte informiere uns mindestens 24 Stunden vor dem Termin, 
        falls du absagen oder verschieben möchtest.
      </EmailInfoCard>

      {content.footer && (
        <EmailFooterNote>{content.footer}</EmailFooterNote>
      )}
    </EmailLayout>
  )
}

export default BookingConfirmationEmail
