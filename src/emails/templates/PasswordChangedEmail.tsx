import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface PasswordChangedEmailProps {
  userName: string
  changeTime: string
  changeDate: string
  device?: string
  ipAddress?: string
  location?: string
  securityUrl?: string
  supportEmail?: string
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

export function PasswordChangedEmail({
  userName,
  changeTime,
  changeDate,
  device,
  ipAddress,
  location,
  securityUrl = 'https://nicnoa.de/dashboard/settings/security',
  supportEmail = 'support@nicnoa.de',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: PasswordChangedEmailProps) {
  const bodyText = content.body
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{changeDate\}\}/g, changeDate)
    .replace(/\{\{changeTime\}\}/g, changeTime)

  return (
    <EmailLayout
      preview={`Dein Passwort wurde erfolgreich geändert`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>🔑 Passwort geändert</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={successBox}>
        <Text style={successIcon}>✅</Text>
        <Text style={successTitle}>Passwort erfolgreich geändert</Text>
        <Text style={successSubtitle}>{changeDate} um {changeTime}</Text>
      </div>

      {(device || ipAddress || location) && (
        <>
          <Text style={detailsTitle}>📋 Änderungsdetails</Text>
          
          <div style={detailsBox}>
            {device && (
              <div style={detailRow}>
                <Text style={detailLabel}>🖥️ Gerät</Text>
                <Text style={detailValue}>{device}</Text>
              </div>
            )}
            {location && (
              <div style={detailRow}>
                <Text style={detailLabel}>📍 Standort</Text>
                <Text style={detailValue}>{location}</Text>
              </div>
            )}
            {ipAddress && (
              <div style={detailRow}>
                <Text style={detailLabel}>🔢 IP-Adresse</Text>
                <Text style={detailValue}>{ipAddress}</Text>
              </div>
            )}
          </div>
        </>
      )}

      <div style={infoBox}>
        <Text style={infoTitle}>ℹ️ Was du wissen solltest</Text>
        <Text style={infoItem}>
          • Du wurdest von allen anderen Geräten abgemeldet
        </Text>
        <Text style={infoItem}>
          • Verwende das neue Passwort für zukünftige Logins
        </Text>
        <Text style={infoItem}>
          • Speichere dein Passwort sicher in einem Passwort-Manager
        </Text>
      </div>

      <div style={warningBox}>
        <Text style={warningTitle}>⚠️ Das warst nicht du?</Text>
        <Text style={warningText}>
          Wenn du diese Änderung nicht vorgenommen hast, wurde möglicherweise 
          unbefugt auf dein Konto zugegriffen. Kontaktiere sofort unseren Support:
        </Text>
        <Text style={supportLink}>
          <a href={`mailto:${supportEmail}`} style={link}>{supportEmail}</a>
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={securityUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Sicherheitseinstellungen prüfen'}
        </EmailButton>
      </div>

      <Text style={tipText}>
        💡 <strong>Sicherheitstipp:</strong> Aktiviere die Zwei-Faktor-Authentifizierung, 
        um dein Konto zusätzlich zu schützen. So benötigt jeder Login einen zusätzlichen Code.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  color: '#059669',
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

const successBox: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #a7f3d0',
}

const successIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const successTitle: React.CSSProperties = {
  color: '#065f46',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const successSubtitle: React.CSSProperties = {
  color: '#059669',
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

const infoBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const infoTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const infoItem: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 6px',
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
  margin: '0 0 8px',
}

const supportLink: React.CSSProperties = {
  margin: 0,
}

const link: React.CSSProperties = {
  color: '#dc2626',
  fontWeight: '600',
  textDecoration: 'underline',
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
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default PasswordChangedEmail


