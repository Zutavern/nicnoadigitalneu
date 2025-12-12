import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface NewReviewStylistEmailProps {
  stylistName: string
  reviewerName: string
  rating: number
  serviceName: string
  reviewTitle?: string
  reviewText: string
  reviewDate: string
  currentAverageRating: string
  totalReviews: number
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

export function NewReviewStylistEmail({
  stylistName,
  reviewerName,
  rating,
  serviceName,
  reviewTitle,
  reviewText,
  reviewDate,
  currentAverageRating,
  totalReviews,
  reviewsUrl = 'https://nicnoa.de/stylist/reviews',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: NewReviewStylistEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{reviewerName\}\}/g, reviewerName)
    .replace(/\{\{rating\}\}/g, String(rating))

  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  const isPositive = rating >= 4

  return (
    <EmailLayout
      preview={`${isPositive ? '🎉' : ''} Neue ${rating}-Sterne Bewertung von ${reviewerName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={isPositive ? positiveBadge : neutralBadge}>
        {isPositive ? '⭐ Tolle Bewertung!' : '⭐ Neue Bewertung'}
      </Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={isPositive ? reviewBoxPositive : reviewBoxNeutral}>
        <div style={ratingContainer}>
          <Text style={ratingText}>{stars}</Text>
          <Text style={isPositive ? ratingNumberPositive : ratingNumberNeutral}>
            {rating}/5
          </Text>
        </div>
        
        {reviewTitle && (
          <Text style={reviewTitleStyle}>"{reviewTitle}"</Text>
        )}
        
        <Text style={reviewContent}>"{reviewText}"</Text>
        
        <div style={reviewMetaContainer}>
          <Text style={reviewMeta}>
            — {reviewerName}
          </Text>
          <Text style={serviceBadge}>{serviceName}</Text>
        </div>
        
        <Text style={reviewDateStyle}>{reviewDate}</Text>
      </div>

      <Text style={statsTitle}>📊 Deine Bewertungsstatistik</Text>
      <div style={statsBox}>
        <div style={statItem}>
          <Text style={statValue}>{currentAverageRating}</Text>
          <Text style={statLabel}>Durchschnitt</Text>
        </div>
        <div style={statItem}>
          <Text style={statValue}>{totalReviews}</Text>
          <Text style={statLabel}>Bewertungen</Text>
        </div>
      </div>

      {isPositive ? (
        <Text style={tipText}>
          🎉 <strong>Tolle Arbeit!</strong> Positive Bewertungen helfen dir, mehr Kunden zu gewinnen. 
          Teile dein Profil, um noch mehr Buchungen zu erhalten!
        </Text>
      ) : (
        <Text style={tipText}>
          💡 <strong>Tipp:</strong> Nutze konstruktives Feedback, um dich zu verbessern. 
          Du kannst auch auf die Bewertung antworten, um zu zeigen, dass dir Kundenzufriedenheit wichtig ist.
        </Text>
      )}

      <div style={buttonContainer}>
        <EmailButton href={reviewsUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Bewertung ansehen'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const positiveBadge: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  color: '#059669',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const neutralBadge: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  color: '#52525b',
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

const reviewBoxPositive: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  border: '1px solid #a7f3d0',
}

const reviewBoxNeutral: React.CSSProperties = {
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

const ratingNumberPositive: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  margin: 0,
}

const ratingNumberNeutral: React.CSSProperties = {
  backgroundColor: '#71717a',
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

const reviewMetaContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
}

const reviewMeta: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const serviceBadge: React.CSSProperties = {
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  color: '#6366f1',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500',
  margin: 0,
}

const reviewDateStyle: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: 0,
}

const statsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const statsBox: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
}

const statItem: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center',
}

const statValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const statLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  margin: 0,
}

const tipText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  padding: '16px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
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

export default NewReviewStylistEmail








