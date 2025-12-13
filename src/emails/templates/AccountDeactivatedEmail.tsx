import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface AccountDeactivatedEmailProps {
  userName: string
  deactivationDate: string
  reason?: 'subscription_expired' | 'compliance_issue' | 'user_request' | 'admin_action' | 'inactivity'
  dataRetentionDays: number
  reactivationUrl?: string
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

export function AccountDeactivatedEmail({
  userName,
  deactivationDate,
  reason = 'admin_action',
  dataRetentionDays = 30,
  reactivationUrl = 'https://nicnoa.de/reactivate',
  supportEmail = 'support@nicnoa.de',
  content,
  logoUrl,
  primaryColor = '#71717a',
  footerText,
}: AccountDeactivatedEmailProps) {
  const reasonLabels: Record<string, string> = {
    subscription_expired: 'Abonnement abgelaufen',
    compliance_issue: 'Compliance-Problem',
    user_request: 'Auf deine Anfrage',
    admin_action: 'Administrative Maßnahme',
    inactivity: 'Inaktivität',
  }

  const reasonDescriptions: Record<string, string> = {
    subscription_expired: 'Dein Abonnement ist abgelaufen und wurde nicht verlängert.',
    compliance_issue: 'Es gibt offene Compliance-Anforderungen, die erfüllt werden müssen.',
    user_request: 'Du hast die Deaktivierung deines Accounts angefordert.',
    admin_action: 'Dein Account wurde aus administrativen Gründen deaktiviert.',
    inactivity: 'Dein Account war über einen längeren Zeitraum inaktiv.',
  }

  const bodyText = content.body
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{deactivationDate\}\}/g, deactivationDate)

  return (
    <EmailLayout
      preview={`Dein NICNOA Account wurde deaktiviert`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⚠️ Account deaktiviert</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      <div style={statusBox}>
        <Text style={statusIcon}>🔒</Text>
        <Text style={statusTitle}>Account deaktiviert</Text>
        <Text style={statusDate}>seit {deactivationDate}</Text>
      </div>

      <Text style={detailsTitle}>📋 Details</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Grund:</strong> {reasonLabels[reason]}
        </Text>
        <Text style={detailItem}>
          {reasonDescriptions[reason]}
        </Text>
      </div>

      <div style={warningBox}>
        <Text style={warningTitle}>⚠️ Wichtige Information</Text>
        <Text style={warningText}>
          Deine Daten werden noch <strong>{dataRetentionDays} Tage</strong> gespeichert. 
          Nach dieser Frist werden alle Daten unwiderruflich gelöscht.
        </Text>
      </div>

      <Text style={whatNextTitle}>📌 Was bedeutet das?</Text>
      
      <Text style={whatNextItem}>
        • <strong>Kein Zugriff</strong> – Du kannst dich nicht mehr einloggen
      </Text>
      <Text style={whatNextItem}>
        • <strong>Buchungen</strong> – Bestehende Buchungen werden storniert
      </Text>
      <Text style={whatNextItem}>
        • <strong>Kunden</strong> – Deine Kunden werden benachrichtigt
      </Text>
      <Text style={whatNextItem}>
        • <strong>Daten</strong> – Nach {dataRetentionDays} Tagen werden alle Daten gelöscht
      </Text>

      <Hr style={divider} />

      <Text style={reactivateTitle}>🔓 Account reaktivieren</Text>
      <Text style={reactivateText}>
        Du kannst deinen Account innerhalb von {dataRetentionDays} Tagen reaktivieren. 
        Alle deine Daten und Einstellungen werden wiederhergestellt.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={reactivationUrl} primaryColor="#10b981">
          {content.buttonText || 'Account reaktivieren'}
        </EmailButton>
      </div>

      <Text style={supportText}>
        Fragen? Kontaktiere uns unter{' '}
        <a href={`mailto:${supportEmail}`} style={supportLink}>{supportEmail}</a>
      </Text>

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

const statusBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const statusIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const statusTitle: React.CSSProperties = {
  color: '#52525b',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const statusDate: React.CSSProperties = {
  color: '#a1a1aa',
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

const detailItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const warningTitle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const warningText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const whatNextTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const whatNextItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
  paddingLeft: '4px',
}

const reactivateTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const reactivateText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0 24px',
}

const supportText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center',
  margin: '0 0 16px',
}

const supportLink: React.CSSProperties = {
  color: '#6366f1',
  textDecoration: 'underline',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0',
}

export default AccountDeactivatedEmail










