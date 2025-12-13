import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface MonthlySummaryEmailProps {
  userName: string
  salonName: string
  month: string
  year: string
  // Revenue Stats
  totalRevenue: string
  revenueChange: string
  revenueChangePositive: boolean
  // Bookings Stats
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  noShowBookings: number
  // Chair Stats
  occupancyRate: string
  activeRentals: number
  totalChairs: number
  // Top Performers
  topStylist?: string
  topService?: string
  // Links
  dashboardUrl?: string
  analyticsUrl?: string
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

export function MonthlySummaryEmail({
  userName,
  salonName,
  month,
  year,
  totalRevenue,
  revenueChange,
  revenueChangePositive,
  totalBookings,
  completedBookings,
  cancelledBookings,
  noShowBookings,
  occupancyRate,
  activeRentals,
  totalChairs,
  topStylist,
  topService,
  dashboardUrl = 'https://nicnoa.de/salon/dashboard',
  analyticsUrl = 'https://nicnoa.de/salon/analytics',
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: MonthlySummaryEmailProps) {
  const bodyText = content.body
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{month\}\}/g, month)
    .replace(/\{\{year\}\}/g, year)

  return (
    <EmailLayout
      preview={`Dein Monatsbericht für ${month} ${year}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📊 Monatsbericht</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Revenue Highlight */}
      <div style={revenueBox}>
        <Text style={revenueLabel}>Gesamtumsatz {month}</Text>
        <Text style={revenueValue}>{totalRevenue}</Text>
        <Text style={{
          ...revenueChange as React.CSSProperties,
          color: revenueChangePositive ? '#059669' : '#dc2626',
        }}>
          {revenueChangePositive ? '↑' : '↓'} {revenueChange} zum Vormonat
        </Text>
      </div>

      {/* Stats Grid */}
      <Text style={sectionTitle}>📅 Buchungen</Text>
      <div style={statsGrid}>
        <div style={statBox}>
          <Text style={statValue}>{totalBookings}</Text>
          <Text style={statLabel}>Gesamt</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#059669'}}>{completedBookings}</Text>
          <Text style={statLabel}>Abgeschlossen</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#dc2626'}}>{cancelledBookings}</Text>
          <Text style={statLabel}>Storniert</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#f59e0b'}}>{noShowBookings}</Text>
          <Text style={statLabel}>No-Shows</Text>
        </div>
      </div>

      <Text style={sectionTitle}>💺 Stuhlvermietung</Text>
      <div style={detailsBox}>
        <Text style={detailItem}>
          <strong>Auslastung:</strong> {occupancyRate}
        </Text>
        <Text style={detailItem}>
          <strong>Aktive Mietverträge:</strong> {activeRentals} von {totalChairs} Plätzen
        </Text>
      </div>

      {(topStylist || topService) && (
        <>
          <Text style={sectionTitle}>🏆 Top-Performer</Text>
          <div style={highlightBox}>
            {topStylist && (
              <Text style={highlightItem}>
                👤 <strong>Bester Stylist:</strong> {topStylist}
              </Text>
            )}
            {topService && (
              <Text style={highlightItem}>
                ✨ <strong>Beliebteste Leistung:</strong> {topService}
              </Text>
            )}
          </div>
        </>
      )}

      <div style={buttonContainer}>
        <EmailButton href={analyticsUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Detaillierte Analyse'}
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

const revenueBox: React.CSSProperties = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
}

const revenueLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const revenueValue: React.CSSProperties = {
  color: 'white',
  fontSize: '40px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const revenueChange: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
  backgroundColor: 'rgba(255,255,255,0.2)',
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

const highlightBox: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const highlightItem: React.CSSProperties = {
  color: '#92400e',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
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

export default MonthlySummaryEmail









