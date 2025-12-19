import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import { getSalutationText, type Salutation } from '../components/EmailComponents'

interface ChairVacancyEmailProps {
  salonOwnerName: string
  salutation?: Salutation
  salonName: string
  chairName: string
  previousStylist: string
  availableFrom: string
  monthlyRate: string
  chairFeatures?: string[]
  manageUrl?: string
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

export function ChairVacancyEmail({
  salonOwnerName,
  salutation,
  salonName,
  chairName,
  previousStylist,
  availableFrom,
  monthlyRate,
  chairFeatures = [],
  manageUrl = 'https://nicnoa.online/salon/chairs',
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: ChairVacancyEmailProps) {
  const bodyText = content.body
    .replace(/\{\{salonOwnerName\}\}/g, salonOwnerName)
    .replace(/\{\{chairName\}\}/g, chairName)
    .replace(/\{\{previousStylist\}\}/g, previousStylist)

  return (
    <EmailLayout
      preview={`${chairName} in ${salonName} ist wieder verfügbar`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💺 Platz frei</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        {getSalutationText(salutation, salonOwnerName)},
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <Text style={detailsTitle}>📋 Platz-Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Salon:</strong> {salonName}
        </Text>
        <Text style={detailItem}>
          <strong>Platz:</strong> {chairName}
        </Text>
        <Text style={detailItem}>
          <strong>Vorheriger Mieter:</strong> {previousStylist}
        </Text>
        <Text style={detailItem}>
          <strong>Verfügbar ab:</strong> {availableFrom}
        </Text>
        <Text style={detailItem}>
          <strong>Monatliche Miete:</strong> {monthlyRate}
        </Text>
      </div>

      {chairFeatures.length > 0 && (
        <>
          <Text style={featuresTitle}>✨ Ausstattung</Text>
          {chairFeatures.map((feature, index) => (
            <Text key={index} style={featureItem}>
              • {feature}
            </Text>
          ))}
        </>
      )}

      <Text style={actionTitle}>📌 Empfohlene Aktionen</Text>
      
      <Text style={actionItem}>
        1. <strong>Anzeige aktualisieren</strong> – Stelle sicher, dass alle Infos aktuell sind
      </Text>
      <Text style={actionItem}>
        2. <strong>Preis prüfen</strong> – Passe ggf. den Mietpreis an den Markt an
      </Text>
      <Text style={actionItem}>
        3. <strong>Fotos erneuern</strong> – Frische Bilder ziehen mehr Interessenten an
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={manageUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Platz verwalten'}
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

const featuresTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const featureItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 6px',
  paddingLeft: '8px',
}

const actionTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const actionItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 10px',
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

export default ChairVacancyEmail











