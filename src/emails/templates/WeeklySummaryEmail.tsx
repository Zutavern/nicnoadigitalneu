import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface WeeklySummaryEmailProps {
  stylistName: string
  weekRange: string // z.B. "2. - 8. Dezember 2024"
  // Earnings
  totalEarnings: string
  earningsChange: string
  earningsChangePositive: boolean
  // Bookings
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  newCustomers: number
  // Performance
  busyDays: string[] // z.B. ["Donnerstag", "Freitag"]
  quietDays: string[]
  topService?: string
  averageRating?: string
  // Upcoming
  upcomingBookings: number
  // Links
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

export function WeeklySummaryEmail({
  stylistName,
  weekRange,
  totalEarnings,
  earningsChange,
  earningsChangePositive,
  totalBookings,
  completedBookings,
  cancelledBookings,
  newCustomers,
  busyDays,
  quietDays,
  topService,
  averageRating,
  upcomingBookings,
  dashboardUrl = 'https://nicnoa.online/stylist',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: WeeklySummaryEmailProps) {
  const bodyText = content.body
    .replace(/\{\{stylistName\}\}/g, stylistName)
    .replace(/\{\{weekRange\}\}/g, weekRange)

  return (
    <EmailLayout
      preview={`Dein Wochenbericht: ${weekRange}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📅 Wochenbericht</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{stylistName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Earnings Highlight */}
      <div style={earningsBox}>
        <Text style={earningsLabel}>Deine Wocheneinnahmen</Text>
        <Text style={earningsValue}>{totalEarnings}</Text>
        <Text style={{
          ...earningsChangeStyle,
          backgroundColor: earningsChangePositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: earningsChangePositive ? '#065f46' : '#991b1b',
        }}>
          {earningsChangePositive ? '↑' : '↓'} {earningsChange} zur Vorwoche
        </Text>
      </div>

      {/* Stats Grid */}
      <Text style={sectionTitle}>📊 Diese Woche in Zahlen</Text>
      <div style={statsGrid}>
        <div style={statBox}>
          <Text style={statValue}>{totalBookings}</Text>
          <Text style={statLabel}>Termine</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#059669'}}>{completedBookings}</Text>
          <Text style={statLabel}>Abgeschlossen</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#6366f1'}}>{newCustomers}</Text>
          <Text style={statLabel}>Neue Kunden</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#dc2626'}}>{cancelledBookings}</Text>
          <Text style={statLabel}>Storniert</Text>
        </div>
      </div>

      {/* Insights */}
      <Text style={sectionTitle}>💡 Insights</Text>
      <div style={insightsBox}>
        {busyDays.length > 0 && (
          <Text style={insightItem}>
            📈 <strong>Stärkste Tage:</strong> {busyDays.join(', ')}
          </Text>
        )}
        {quietDays.length > 0 && (
          <Text style={insightItem}>
            📉 <strong>Ruhige Tage:</strong> {quietDays.join(', ')}
          </Text>
        )}
        {topService && (
          <Text style={insightItem}>
            ⭐ <strong>Beliebtester Service:</strong> {topService}
          </Text>
        )}
        {averageRating && (
          <Text style={insightItem}>
            🌟 <strong>Durchschnittsbewertung:</strong> {averageRating}
          </Text>
        )}
      </div>

      {/* Upcoming */}
      <div style={upcomingBox}>
        <Text style={upcomingTitle}>📆 Nächste Woche</Text>
        <Text style={upcomingValue}>
          {upcomingBookings} {upcomingBookings === 1 ? 'Termin' : 'Termine'} geplant
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Zum Dashboard'}
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

const earningsBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const earningsLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const earningsValue: React.CSSProperties = {
  color: 'white',
  fontSize: '40px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const earningsChangeStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
}

const sectionTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const statsGrid: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
}

const statBox: React.CSSProperties = {
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
  fontSize: '12px',
  fontWeight: '500',
  margin: 0,
}

const insightsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const insightItem: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const upcomingBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const upcomingTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const upcomingValue: React.CSSProperties = {
  color: '#3b82f6',
  fontSize: '20px',
  fontWeight: '700',
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

export default WeeklySummaryEmail











