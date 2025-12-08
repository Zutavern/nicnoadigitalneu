import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface NewUserRegisteredEmailProps {
  adminName: string
  newUserName: string
  newUserEmail: string
  userRole: 'SALON_OWNER' | 'STYLIST' | 'CUSTOMER'
  registrationDate: string
  registrationTime: string
  ipAddress?: string
  location?: string
  referralCode?: string
  referredBy?: string
  todayRegistrations: number
  thisWeekRegistrations: number
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

export function NewUserRegisteredEmail({
  adminName,
  newUserName,
  newUserEmail,
  userRole,
  registrationDate,
  registrationTime,
  ipAddress,
  location,
  referralCode,
  referredBy,
  todayRegistrations,
  thisWeekRegistrations,
  dashboardUrl = 'https://nicnoa.de/admin/users',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: NewUserRegisteredEmailProps) {
  const roleLabels: Record<string, string> = {
    SALON_OWNER: 'Salon-Besitzer',
    STYLIST: 'Stuhlmieter',
    CUSTOMER: 'Kunde',
  }

  const roleColors: Record<string, { bg: string; text: string }> = {
    SALON_OWNER: { bg: '#dbeafe', text: '#1e40af' },
    STYLIST: { bg: '#fce7f3', text: '#9d174d' },
    CUSTOMER: { bg: '#f3e8ff', text: '#7c3aed' },
  }

  const colors = roleColors[userRole]

  return (
    <EmailLayout
      preview={`Neuer Nutzer: ${newUserName} (${roleLabels[userRole]})`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>👤 Neue Registrierung</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>
        Ein neuer Nutzer hat sich auf der Plattform registriert.
      </Text>

      <Hr style={divider} />

      {/* User Card */}
      <div style={userCard}>
        <div style={userAvatar}>
          {newUserName.charAt(0).toUpperCase()}
        </div>
        <div style={userInfo}>
          <Text style={userName}>{newUserName}</Text>
          <Text style={userEmail}>{newUserEmail}</Text>
          <span style={{
            ...roleBadge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}>
            {roleLabels[userRole]}
          </span>
        </div>
      </div>

      {/* Registration Details */}
      <Text style={detailsTitle}>📋 Registrierungsdetails</Text>
      
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Datum:</strong> {registrationDate}
        </Text>
        <Text style={detailItem}>
          <strong>Uhrzeit:</strong> {registrationTime}
        </Text>
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
        {referralCode && (
          <Text style={detailItem}>
            <strong>Empfehlungscode:</strong> {referralCode}
          </Text>
        )}
        {referredBy && (
          <Text style={detailItem}>
            <strong>Empfohlen von:</strong> {referredBy}
          </Text>
        )}
      </div>

      {/* Stats */}
      <Text style={statsTitle}>📊 Registrierungsstatistik</Text>
      <div style={statsContainer}>
        <div style={statBox}>
          <Text style={statValue}>{todayRegistrations}</Text>
          <Text style={statLabel}>Heute</Text>
        </div>
        <div style={statBox}>
          <Text style={statValue}>{thisWeekRegistrations}</Text>
          <Text style={statLabel}>Diese Woche</Text>
        </div>
      </div>

      {userRole === 'STYLIST' && (
        <div style={noteBox}>
          <Text style={noteText}>
            📋 <strong>Hinweis:</strong> Dieser Stylist muss noch das Compliance-Onboarding 
            abschließen, bevor er vollständig aktiviert werden kann.
          </Text>
        </div>
      )}

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Nutzer ansehen'}
        </EmailButton>
      </div>

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

const userCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#f4f4f5',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
}

const userAvatar: React.CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#6366f1',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: '700',
}

const userInfo: React.CSSProperties = {
  flex: 1,
}

const userName: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const userEmail: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 8px',
}

const roleBadge: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
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

const statsTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const statsContainer: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
}

const statBox: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center',
}

const statValue: React.CSSProperties = {
  color: '#059669',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const statLabel: React.CSSProperties = {
  color: '#065f46',
  fontSize: '13px',
  margin: 0,
}

const noteBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const noteText: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
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

export default NewUserRegisteredEmail



