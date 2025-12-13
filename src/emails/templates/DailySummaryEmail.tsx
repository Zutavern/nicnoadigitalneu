import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface DailySummaryEmailProps {
  adminName: string
  date: string
  // Key Metrics
  totalRevenue: string
  revenueChangePercent: string
  revenueChangePositive: boolean
  newUsers: number
  newBookings: number
  completedBookings: number
  cancelledBookings: number
  // Platform Stats
  activeSalons: number
  activeStylists: number
  totalCustomers: number
  // Alerts
  pendingOnboardings: number
  openSupportTickets: number
  failedPayments: number
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

export function DailySummaryEmail({
  adminName,
  date,
  totalRevenue,
  revenueChangePercent,
  revenueChangePositive,
  newUsers,
  newBookings,
  completedBookings,
  cancelledBookings,
  activeSalons,
  activeStylists,
  totalCustomers,
  pendingOnboardings,
  openSupportTickets,
  failedPayments,
  dashboardUrl = 'https://nicnoa.de/admin/dashboard',
  content,
  logoUrl,
  primaryColor = '#6366f1',
  footerText,
}: DailySummaryEmailProps) {
  const bodyText = content.body
    .replace(/\{\{adminName\}\}/g, adminName)
    .replace(/\{\{date\}\}/g, date)

  const hasAlerts = pendingOnboardings > 0 || openSupportTickets > 0 || failedPayments > 0

  return (
    <EmailLayout
      preview={`Tagesbericht ${date}: ${totalRevenue} Umsatz, ${newUsers} neue Nutzer`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>📊 Tagesbericht</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Revenue Highlight */}
      <div style={revenueBox}>
        <Text style={revenueLabel}>Tagesumsatz {date}</Text>
        <Text style={revenueValue}>{totalRevenue}</Text>
        <Text style={{
          ...revenueChangeStyle,
          color: revenueChangePositive ? '#ecfdf5' : '#fef2f2',
          backgroundColor: revenueChangePositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
        }}>
          {revenueChangePositive ? '↑' : '↓'} {revenueChangePercent} zum Vortag
        </Text>
      </div>

      {/* Alerts Section */}
      {hasAlerts && (
        <>
          <Text style={sectionTitle}>🚨 Aktionen erforderlich</Text>
          <div style={alertsBox}>
            {pendingOnboardings > 0 && (
              <Text style={alertItem}>
                📋 <strong>{pendingOnboardings}</strong> Onboarding-Anträge warten auf Prüfung
              </Text>
            )}
            {openSupportTickets > 0 && (
              <Text style={alertItem}>
                🎫 <strong>{openSupportTickets}</strong> offene Support-Tickets
              </Text>
            )}
            {failedPayments > 0 && (
              <Text style={alertItem}>
                💳 <strong>{failedPayments}</strong> fehlgeschlagene Zahlungen
              </Text>
            )}
          </div>
        </>
      )}

      {/* Daily Stats */}
      <Text style={sectionTitle}>📈 Tagesaktivität</Text>
      <div style={statsGrid}>
        <div style={statBox}>
          <Text style={statValue}>{newUsers}</Text>
          <Text style={statLabel}>Neue Nutzer</Text>
        </div>
        <div style={statBox}>
          <Text style={statValue}>{newBookings}</Text>
          <Text style={statLabel}>Neue Buchungen</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#059669'}}>{completedBookings}</Text>
          <Text style={statLabel}>Abgeschlossen</Text>
        </div>
        <div style={statBox}>
          <Text style={{...statValue, color: '#dc2626'}}>{cancelledBookings}</Text>
          <Text style={statLabel}>Storniert</Text>
        </div>
      </div>

      {/* Platform Overview */}
      <Text style={sectionTitle}>🏢 Plattform-Übersicht</Text>
      <div style={platformBox}>
        <Text style={platformItem}>
          <strong>{activeSalons}</strong> aktive Salons
        </Text>
        <Text style={platformItem}>
          <strong>{activeStylists}</strong> aktive Stylisten
        </Text>
        <Text style={platformItem}>
          <strong>{totalCustomers}</strong> registrierte Kunden
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Zum Admin-Dashboard'}
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

const revenueChangeStyle: React.CSSProperties = {
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

const alertsBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '0 12px 12px 0',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const alertItem: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
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

const platformBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}

const platformItem: React.CSSProperties = {
  color: '#52525b',
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

export default DailySummaryEmail











