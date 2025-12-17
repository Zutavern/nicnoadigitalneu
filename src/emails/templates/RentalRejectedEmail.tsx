import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface RentalRejectedEmailProps {
  stylistName: string
  salonName: string
  salonOwnerName: string
  chairName: string
  rejectionReason?: string
  applicationDate: string
  findSalonUrl?: string
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

export function RentalRejectedEmail({
  stylistName,
  salonName,
  salonOwnerName,
  chairName,
  rejectionReason,
  applicationDate,
  findSalonUrl = 'https://nicnoa.online/stylist',
  content,
  logoUrl,
  primaryColor = '#71717a',
  footerText,
}: RentalRejectedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{salonName\}\}/g, salonName)

  return (
    <EmailLayout
      preview={`Deine Bewerbung bei ${salonName} wurde leider abgelehnt`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>❌ Bewerbung abgelehnt</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Bewerbungsdetails</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Ansprechpartner:</strong> {salonOwnerName}
        </Text>
        <Text style={detailItem}>
          <strong>Gewünschter Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Bewerbung vom:</strong> {applicationDate}
        </Text>
      </div>

      {rejectionReason && (
        <>
          <Text style={reasonTitle}>📝 Begründung</Text>
          <div style={reasonBox}>
            <Text style={reasonText}>"{rejectionReason}"</Text>
          </div>
        </>
      )}

      <div style={encouragementBox}>
        <Text style={encouragementTitle}>💪 Lass dich nicht entmutigen!</Text>
        <Text style={encouragementText}>
          Jeder Salon hat unterschiedliche Anforderungen. Es gibt viele andere tolle 
          Salons, die nach talentierten Stylisten suchen. Probiere es weiter!
        </Text>
      </div>

      <Text style={tipsTitle}>💡 Tipps für deine nächste Bewerbung</Text>
      
      <Text style={tipItem}>
        • <strong>Profil optimieren</strong> – Füge aktuelle Fotos deiner Arbeit hinzu
      </Text>
      <Text style={tipItem}>
        • <strong>Qualifikationen</strong> – Hebe deine Stärken und Spezialisierungen hervor
      </Text>
      <Text style={tipItem}>
        • <strong>Persönliche Nachricht</strong> – Erkläre, warum du zum Salon passt
      </Text>
      <Text style={tipItem}>
        • <strong>Verfügbarkeit</strong> – Sei flexibel bei Arbeitszeiten
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={findSalonUrl} primaryColor="#10b981">
          {content.buttonText || 'Weitere Salons entdecken'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
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
  backgroundColor: '#f4f4f5',
  borderLeft: '4px solid #a1a1aa',
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const reasonText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: 0,
}

const encouragementBox: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const encouragementTitle: React.CSSProperties = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const encouragementText: React.CSSProperties = {
  color: '#065f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: 0,
}

const tipsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const tipItem: React.CSSProperties = {
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

export default RentalRejectedEmail


