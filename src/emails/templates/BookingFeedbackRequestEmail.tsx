import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface BookingFeedbackRequestEmailProps {
  customerName: string
  stylistName: string
  serviceName: string
  serviceDate: string
  serviceTime: string
  salonName: string
  reviewUrl: string
  stylistImageUrl?: string
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

export function BookingFeedbackRequestEmail({
  customerName,
  stylistName,
  serviceName,
  serviceDate,
  serviceTime,
  salonName,
  reviewUrl,
  stylistImageUrl,
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: BookingFeedbackRequestEmailProps) {
  const bodyText = content.body
    .replace(/\{\{customerName\}\}/g, customerName)
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{serviceName\}\}/g, serviceName)

  return (
    <EmailLayout
      preview={`Wie war dein Termin bei ${stylistName}?`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⭐ Dein Feedback</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{customerName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Service Card */}
      <div style={serviceCard}>
        <div style={serviceHeader}>
          <div style={stylistAvatar}>
            {stylistImageUrl ? (
              <img src={stylistImageUrl} alt={stylistName} style={avatarImg} />
            ) : (
              stylistName.charAt(0).toUpperCase()
            )}
          </div>
          <div style={serviceInfo}>
            <Text style={stylistNameText}>{stylistName}</Text>
            <Text style={salonNameText}>{salonName}</Text>
          </div>
        </div>
        <Hr style={cardDivider} />
        <div style={serviceDetails}>
          <Text style={serviceNameText}>✨ {serviceName}</Text>
          <Text style={serviceDateText}>📅 {serviceDate} um {serviceTime}</Text>
        </div>
      </div>

      {/* Rating Preview */}
      <Text style={ratingTitle}>Wie zufrieden warst du?</Text>
      <div style={ratingContainer}>
        <Text style={star}>⭐</Text>
        <Text style={star}>⭐</Text>
        <Text style={star}>⭐</Text>
        <Text style={star}>⭐</Text>
        <Text style={star}>⭐</Text>
      </div>
      <Text style={ratingSubtext}>Klicke, um zu bewerten</Text>

      <div style={buttonContainer}>
        <EmailButton href={reviewUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt bewerten'}
        </EmailButton>
      </div>

      {/* Benefits */}
      <div style={benefitsBox}>
        <Text style={benefitsTitle}>🎁 Warum deine Meinung wichtig ist</Text>
        <Text style={benefitItem}>
          ✓ Hilf anderen, den perfekten Stylisten zu finden
        </Text>
        <Text style={benefitItem}>
          ✓ Gib {stylistName} wertvolles Feedback
        </Text>
        <Text style={benefitItem}>
          ✓ Verbessere die Qualität für alle
        </Text>
      </div>

      <Text style={noteText}>
        💬 Die Bewertung dauert nur 30 Sekunden und macht einen großen Unterschied!
      </Text>

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

const serviceCard: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  border: '1px solid #e4e4e7',
}

const serviceHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px',
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
  overflow: 'hidden',
}

const avatarImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const serviceInfo: React.CSSProperties = {
  flex: 1,
}

const stylistNameText: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const salonNameText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const cardDivider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '16px 0',
}

const serviceDetails: React.CSSProperties = {
  // padding: '0',
}

const serviceNameText: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const serviceDateText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const ratingTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center',
  margin: '0 0 16px',
}

const ratingContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '8px',
}

const star: React.CSSProperties = {
  fontSize: '32px',
  margin: 0,
  cursor: 'pointer',
}

const ratingSubtext: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '13px',
  textAlign: 'center',
  margin: '0 0 24px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const benefitsBox: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const benefitsTitle: React.CSSProperties = {
  color: '#065f46',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const benefitItem: React.CSSProperties = {
  color: '#065f46',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 4px',
}

const noteText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center',
  margin: '0 0 16px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default BookingFeedbackRequestEmail



