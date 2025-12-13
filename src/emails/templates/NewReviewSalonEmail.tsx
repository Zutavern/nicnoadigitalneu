import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface NewReviewSalonEmailProps {
  salonOwnerName: string
  salonName: string
  reviewerName: string
  rating: number
  reviewTitle?: string
  reviewText: string
  reviewDate: string
  reviewsUrl?: string
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

export function NewReviewSalonEmail({
  salonOwnerName,
  salonName,
  reviewerName,
  rating,
  reviewTitle,
  reviewText,
  reviewDate,
  reviewsUrl = 'https://nicnoa.de/salon/reviews',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: NewReviewSalonEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)
    .replace(/\{\{salonName\}\}/g, salonName)
    .replace(/\{\{reviewerName\}\}/g, reviewerName)

  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <EmailLayout
      preview={`Neue ${rating}-Sterne Bewertung für ${salonName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⭐ Neue Bewertung</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{salonOwnerName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={reviewBox}>
        <div style={ratingContainer}>
          <Text style={ratingText}>{stars}</Text>
          <Text style={ratingNumber}>{rating}/5</Text>
        </div>
        
        {reviewTitle && (
          <Text style={reviewTitleStyle}>"{reviewTitle}"</Text>
        )}
        
        <Text style={reviewContent}>"{reviewText}"</Text>
        
        <Text style={reviewMeta}>
          — {reviewerName}, {reviewDate}
        </Text>
      </div>

      <Text style={tipTitle}>💡 Tipp</Text>
      <Text style={tipText}>
        Bewertungen sind wichtig für neue Kunden! Antworten Sie zeitnah auf 
        Feedback, um Ihre Reputation zu stärken.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={reviewsUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Alle Bewertungen ansehen'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  color: '#d97706',
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

const reviewBox: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  border: '1px solid #e4e4e7',
}

const ratingContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
}

const ratingText: React.CSSProperties = {
  fontSize: '24px',
  margin: 0,
}

const ratingNumber: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  margin: 0,
}

const reviewTitleStyle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const reviewContent: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: '0 0 16px',
}

const reviewMeta: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '13px',
  margin: 0,
}

const tipTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const tipText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
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

export default NewReviewSalonEmail









