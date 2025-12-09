import { Heading, Hr, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface HighChurnAlertEmailProps {
  adminName: string
  alertDate: string
  period: string
  churnRate: string
  previousChurnRate: string
  churnIncrease: string
  cancelledUsers: number
  totalUsers: number
  topReasons: Array<{ reason: string; count: number; percentage: string }>
  affectedPlans: Array<{ plan: string; cancellations: number }>
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

export function HighChurnAlertEmail({
  adminName,
  alertDate,
  period,
  churnRate,
  previousChurnRate,
  churnIncrease,
  cancelledUsers,
  totalUsers,
  topReasons,
  affectedPlans,
  dashboardUrl = 'https://nicnoa.de/admin/analytics',
  content,
  logoUrl,
  primaryColor = '#dc2626',
  footerText,
}: HighChurnAlertEmailProps) {
  const bodyText = content.body
    .replace(/\{\{adminName\}\}/g, adminName)
    .replace(/\{\{churnRate\}\}/g, churnRate)
    .replace(/\{\{period\}\}/g, period)

  return (
    <EmailLayout
      preview={`⚠️ Hohe Abwanderungsrate erkannt: ${churnRate}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>⚠️ Churn-Alert</Text>
      
      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{adminName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Hr style={divider} />

      {/* Alert Box */}
      <div style={alertBox}>
        <Text style={alertIcon}>📉</Text>
        <Text style={alertTitle}>Erhöhte Abwanderung erkannt</Text>
        <Text style={alertSubtitle}>{alertDate} • {period}</Text>
      </div>

      {/* Key Metrics */}
      <Text style={sectionTitle}>📊 Kennzahlen</Text>
      
      <div style={metricsGrid}>
        <div style={metricCard}>
          <Text style={metricValue}>{churnRate}</Text>
          <Text style={metricLabel}>Aktuelle Churn-Rate</Text>
        </div>
        <div style={metricCard}>
          <Text style={metricValue}>{previousChurnRate}</Text>
          <Text style={metricLabel}>Vorheriger Zeitraum</Text>
        </div>
        <div style={metricCardWarning}>
          <Text style={metricValueWarning}>+{churnIncrease}</Text>
          <Text style={metricLabel}>Anstieg</Text>
        </div>
      </div>

      <div style={statsBox}>
        <div style={statRow}>
          <Text style={statLabel}>Gekündigte Abos</Text>
          <Text style={statValue}>{cancelledUsers}</Text>
        </div>
        <div style={statRow}>
          <Text style={statLabel}>Aktive Nutzer gesamt</Text>
          <Text style={statValue}>{totalUsers}</Text>
        </div>
      </div>

      {/* Top Reasons */}
      {topReasons.length > 0 && (
        <>
          <Text style={sectionTitle}>🔍 Häufigste Kündigungsgründe</Text>
          <div style={reasonsBox}>
            {topReasons.map((item, index) => (
              <div key={index} style={reasonRow}>
                <div style={reasonInfo}>
                  <Text style={reasonRank}>#{index + 1}</Text>
                  <Text style={reasonText}>{item.reason}</Text>
                </div>
                <div style={reasonStats}>
                  <Text style={reasonCount}>{item.count}x</Text>
                  <Text style={reasonPercentage}>{item.percentage}</Text>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Affected Plans */}
      {affectedPlans.length > 0 && (
        <>
          <Text style={sectionTitle}>📋 Betroffene Pläne</Text>
          <div style={plansBox}>
            {affectedPlans.map((plan, index) => (
              <div key={index} style={planRow}>
                <Text style={planName}>{plan.plan}</Text>
                <Text style={planCancellations}>{plan.cancellations} Kündigungen</Text>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recommendations */}
      <div style={recommendationsBox}>
        <Text style={recommendationsTitle}>💡 Empfohlene Maßnahmen</Text>
        <Text style={recommendationItem}>
          • Kündigungs-Feedback analysieren und Muster identifizieren
        </Text>
        <Text style={recommendationItem}>
          • Betroffene Nutzer proaktiv kontaktieren
        </Text>
        <Text style={recommendationItem}>
          • Retention-Kampagne für gefährdete Nutzer starten
        </Text>
        <Text style={recommendationItem}>
          • Produkt-Verbesserungen basierend auf Feedback priorisieren
        </Text>
      </div>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Analytics-Dashboard öffnen'}
        </EmailButton>
      </div>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
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
  backgroundColor: '#fef2f2',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px',
  textAlign: 'center',
  border: '2px solid #fca5a5',
}

const alertIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const alertTitle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const alertSubtitle: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  margin: 0,
}

const sectionTitle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const metricsGrid: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
}

const metricCard: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center',
}

const metricCardWarning: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center',
}

const metricValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const metricValueWarning: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const metricLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  margin: 0,
}

const statsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
}

const statRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
}

const statLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: 0,
}

const statValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: 0,
}

const reasonsBox: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
}

const reasonRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #fed7aa',
}

const reasonInfo: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const reasonRank: React.CSSProperties = {
  color: '#ea580c',
  fontSize: '12px',
  fontWeight: '600',
  margin: 0,
}

const reasonText: React.CSSProperties = {
  color: '#9a3412',
  fontSize: '14px',
  margin: 0,
}

const reasonStats: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const reasonCount: React.CSSProperties = {
  color: '#9a3412',
  fontSize: '14px',
  fontWeight: '600',
  margin: 0,
}

const reasonPercentage: React.CSSProperties = {
  color: '#ea580c',
  fontSize: '12px',
  margin: 0,
}

const plansBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
}

const planRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
}

const planName: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
}

const planCancellations: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
}

const recommendationsBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
}

const recommendationsTitle: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const recommendationItem: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 4px',
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

export default HighChurnAlertEmail




