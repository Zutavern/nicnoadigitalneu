import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface RentalApplicationSentEmailProps {
  stylistName: string
  salonName: string
  salonOwnerName: string
  chairName: string
  monthlyRent: string
  applicationDate: string
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

export function RentalApplicationSentEmail({
  stylistName,
  salonName,
  salonOwnerName,
  chairName,
  monthlyRent,
  applicationDate,
  dashboardUrl = 'https://nicnoa.online/stylist',
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: RentalApplicationSentEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{salonName\}\}/g, salonName)

  return (
    <EmailLayout
      preview={`Deine Bewerbung bei ${salonName} wurde versendet`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📤 Bewerbung versendet</Text>
      
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
          <strong>Monatliche Miete:</strong> {monthlyRent}
        </Text>
        <Text style={detailItem}>
          <strong>Eingereicht am:</strong> {applicationDate}
        </Text>
      </div>

      <div style={statusBox}>
        <Text style={statusIcon}>⏳</Text>
        <Text style={statusTitle}>Status: Wird geprüft</Text>
        <Text style={statusText}>
          Der Salon-Besitzer wurde benachrichtigt und wird deine Bewerbung prüfen. 
          Du erhältst eine E-Mail, sobald es eine Entscheidung gibt.
        </Text>
      </div>

      <Text style={tipsTitle}>💡 In der Zwischenzeit</Text>
      
      <Text style={tipItem}>
        • <strong>Profil optimieren</strong> – Ein vollständiges Profil erhöht deine Chancen
      </Text>
      <Text style={tipItem}>
        • <strong>Portfolio aktualisieren</strong> – Zeige deine besten Arbeiten
      </Text>
      <Text style={tipItem}>
        • <strong>Weitere Salons ansehen</strong> – Halte deine Optionen offen
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
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

const statusBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const statusIcon: React.CSSProperties = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const statusTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const statusText: React.CSSProperties = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '22px',
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

export default RentalApplicationSentEmail


