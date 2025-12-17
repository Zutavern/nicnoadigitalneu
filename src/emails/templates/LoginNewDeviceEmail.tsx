import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface LoginNewDeviceEmailProps {
  userName: string
  loginTime: string
  loginDate: string
  device: string
  browser: string
  ipAddress: string
  location: string
  securityUrl?: string
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

export function LoginNewDeviceEmail({
  userName,
  loginTime,
  loginDate,
  device,
  browser,
  ipAddress,
  location,
  securityUrl = 'https://nicnoa.online/dashboard/settings/security',
  content,
  logoUrl,
  primaryColor = '#f59e0b',
  footerText,
}: LoginNewDeviceEmailProps) {
  const bodyText = content.body
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{device\}\}/g, device)
    .replace(/\{\{location\}\}/g, location)

  return (
    <EmailLayout
      preview={`Neuer Login von ${device} in ${location}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🔐 Sicherheitshinweis</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={alertBox}>
        <Text style={alertIcon}>🖥️</Text>
        <Text style={alertTitle}>Neuer Login erkannt</Text>
        <Text style={alertSubtitle}>{loginDate} um {loginTime}</Text>
      </div>

      <Text style={detailsTitle}>📋 Login-Details</Text>
      
      <div style={detailsBox}>
        <div style={detailRow}>
          <Text style={detailLabel}>🖥️ Gerät</Text>
          <Text style={detailValue}>{device}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>🌐 Browser</Text>
          <Text style={detailValue}>{browser}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>📍 Standort</Text>
          <Text style={detailValue}>{location}</Text>
        </div>
        <div style={detailRow}>
          <Text style={detailLabel}>🔢 IP-Adresse</Text>
          <Text style={detailValue}>{ipAddress}</Text>
        </div>
      </div>

      <div style={warningBox}>
        <Text style={warningTitle}>⚠️ Das warst nicht du?</Text>
        <Text style={warningText}>
          Wenn du diesen Login nicht durchgeführt hast, solltest du sofort dein 
          Passwort ändern und die Zwei-Faktor-Authentifizierung aktivieren.
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={securityUrl} primaryColor="#dc2626">
          {content.buttonText || 'Sicherheitseinstellungen prüfen'}
        </EmailButton>
      </div>

      <Text style={tipText}>
        💡 <strong>Tipp:</strong> Aktiviere die Zwei-Faktor-Authentifizierung für 
        zusätzliche Sicherheit. So kann niemand ohne deinen Code auf dein Konto zugreifen.
      </Text>

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

const alertBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #fcd34d',
}

const alertIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const alertTitle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const alertSubtitle: React.CSSProperties = {
  color: '#b45309',
  fontSize: '14px',
  margin: 0,
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

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
  textAlign: 'right',
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
  border: '1px solid #fca5a5',
}

const warningTitle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const warningText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const tipText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
  padding: '16px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default LoginNewDeviceEmail











