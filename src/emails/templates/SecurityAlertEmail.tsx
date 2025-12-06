import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface SecurityAlertEmailProps {
  adminName: string
  alertType: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'api_abuse' | 'data_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  // Details
  affectedUser?: string
  affectedEmail?: string
  ipAddress?: string
  location?: string
  device?: string
  description: string
  // Recommendations
  recommendations: string[]
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

export function SecurityAlertEmail({
  adminName,
  alertType,
  severity,
  timestamp,
  affectedUser,
  affectedEmail,
  ipAddress,
  location,
  device,
  description,
  recommendations,
  securityUrl = 'https://nicnoa.de/admin/security',
  content,
  logoUrl,
  primaryColor = '#dc2626',
  footerText,
}: SecurityAlertEmailProps) {
  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    medium: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    high: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    critical: { bg: '#7f1d1d', text: '#fef2f2', border: '#dc2626' },
  }

  const alertTypeLabels: Record<string, string> = {
    login_attempt: 'Fehlgeschlagener Login-Versuch',
    password_change: 'Passwort-Änderung',
    suspicious_activity: 'Verdächtige Aktivität',
    api_abuse: 'API-Missbrauch',
    data_breach: 'Möglicher Datenzugriff',
  }

  const severityLabels: Record<string, string> = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    critical: 'KRITISCH',
  }

  const colors = severityColors[severity]

  return (
    <EmailLayout
      preview={`🚨 ${severityLabels[severity]}: ${alertTypeLabels[alertType]}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <div style={{
        ...alertHeader,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}>
        <Text style={{...alertHeaderIcon}}>🚨</Text>
        <Text style={{...alertHeaderText, color: colors.text}}>
          SICHERHEITSWARNUNG
        </Text>
      </div>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>{description}</Text>

      <Hr style={divider} />

      {/* Severity Badge */}
      <div style={severityContainer}>
        <Text style={severityLabel}>Schweregrad</Text>
        <span style={{
          ...severityBadge,
          backgroundColor: colors.bg,
          color: colors.text,
          border: `2px solid ${colors.border}`,
        }}>
          {severityLabels[severity]}
        </span>
      </div>

      {/* Alert Details */}
      <Text style={detailsTitle}>📋 Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Typ:</strong> {alertTypeLabels[alertType]}
        </Text>
        <Text style={detailItem}>
          <strong>Zeitpunkt:</strong> {timestamp}
        </Text>
        {affectedUser && (
          <Text style={detailItem}>
            <strong>Betroffener Nutzer:</strong> {affectedUser}
          </Text>
        )}
        {affectedEmail && (
          <Text style={detailItem}>
            <strong>E-Mail:</strong> {affectedEmail}
          </Text>
        )}
        {ipAddress && (
          <Text style={detailItem}>
            <strong>IP-Adresse:</strong> {ipAddress}
          </Text>
        )}
        {location && (
          <Text style={detailItem}>
            <strong>Standort:</strong> {location}
          </Text>
        )}
        {device && (
          <Text style={detailItem}>
            <strong>Gerät:</strong> {device}
          </Text>
        )}
      </div>

      {/* Recommendations */}
      <Text style={recommendationsTitle}>⚡ Empfohlene Maßnahmen</Text>
      <div style={recommendationsBox}>
        {recommendations.map((rec, index) => (
          <Text key={index} style={recommendationItem}>
            {index + 1}. {rec}
          </Text>
        ))}
      </div>

      <div style={buttonContainer}>
        <EmailButton href={securityUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Sicherheits-Dashboard öffnen'}
        </EmailButton>
      </div>

      <Text style={urgentNote}>
        ⚠️ Bei kritischen Vorfällen handeln Sie sofort. 
        Kontaktieren Sie bei Bedarf: security@nicnoa.de
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const alertHeader: React.CSSProperties = {
  borderRadius: '12px',
  padding: '16px 24px',
  marginBottom: '24px',
  textAlign: 'center',
  border: '2px solid',
}

const alertHeaderIcon: React.CSSProperties = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const alertHeaderText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '700',
  margin: 0,
  letterSpacing: '2px',
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

const severityContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '24px',
}

const severityLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
}

const severityBadge: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '700',
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

const recommendationsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const recommendationsBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const recommendationItem: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const urgentNote: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0 0 16px',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default SecurityAlertEmail

