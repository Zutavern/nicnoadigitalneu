import { Hr, Section, Text, Row, Column, Img, Link } from '@react-email/components'
import * as React from 'react'

// ============================================
// Salutation Type & Helper
// ============================================
export type Salutation = 'FRAU' | 'HERR' | 'DIVERS' | 'KEINE_ANGABE' | null | undefined

/**
 * Extrahiert den Vornamen aus dem vollständigen Namen
 * @example getFirstName('Maria Schmidt') → 'Maria'
 */
export function getFirstName(name: string | null | undefined): string {
  return name?.split(' ')[0] || ''
}

/**
 * Generiert die personalisierte Anrede - immer "Hallo [Vorname]"
 * Verwendet die informelle "Du"-Form
 * @example getSalutationText('FRAU', 'Maria Schmidt') → 'Hallo Maria'
 * @example getSalutationText('HERR', 'Thomas Müller') → 'Hallo Thomas'
 * @example getSalutationText(null, 'Alex') → 'Hallo Alex'
 */
export function getSalutationText(salutation: Salutation, name: string | null | undefined): string {
  const firstName = getFirstName(name)
  
  // Immer "Hallo [Name]" - informell und einheitlich
  return firstName ? `Hallo ${firstName}` : 'Hallo'
}

// ============================================
// Email Badge Component
// ============================================
interface EmailBadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  icon?: string
}

export function EmailBadge({ children, variant = 'default', icon }: EmailBadgeProps) {
  const styles = getBadgeStyles(variant)
  return (
    <span style={styles}>
      {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
      {children}
    </span>
  )
}

function getBadgeStyles(variant: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.3px',
  }

  const variants: Record<string, React.CSSProperties> = {
    success: { backgroundColor: '#ecfdf5', color: '#059669' },
    warning: { backgroundColor: '#fef3c7', color: '#d97706' },
    error: { backgroundColor: '#fef2f2', color: '#dc2626' },
    info: { backgroundColor: '#eff6ff', color: '#2563eb' },
    default: { backgroundColor: '#f1f5f9', color: '#475569' },
  }

  return { ...base, ...variants[variant] }
}

// ============================================
// Email Heading Component
// ============================================
interface EmailHeadingProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center' | 'right'
}

export function EmailHeading({ children, as = 'h1', align = 'left' }: EmailHeadingProps) {
  const styles = getHeadingStyles(as, align)
  return <Text style={styles}>{children}</Text>
}

function getHeadingStyles(as: string, align: string): React.CSSProperties {
  const base: React.CSSProperties = {
    color: '#0f172a',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '0 0 16px',
    textAlign: align as React.CSSProperties['textAlign'],
  }

  const sizes: Record<string, React.CSSProperties> = {
    h1: { fontSize: '28px', letterSpacing: '-0.5px' },
    h2: { fontSize: '22px', letterSpacing: '-0.3px' },
    h3: { fontSize: '18px', letterSpacing: '-0.2px' },
  }

  return { ...base, ...sizes[as] }
}

// ============================================
// Email Paragraph Component
// ============================================
interface EmailParagraphProps {
  children: React.ReactNode
  muted?: boolean
  small?: boolean
  center?: boolean
}

export function EmailParagraph({ children, muted, small, center }: EmailParagraphProps) {
  const style: React.CSSProperties = {
    color: muted ? '#64748b' : '#334155',
    fontSize: small ? '14px' : '16px',
    lineHeight: small ? '22px' : '26px',
    margin: '0 0 16px',
    textAlign: center ? 'center' : 'left',
  }
  return <Text style={style}>{children}</Text>
}

// ============================================
// Email Greeting Component (personalisierte Anrede)
// ============================================
interface EmailGreetingProps {
  userName: string | null | undefined
  salutation?: Salutation
}

/**
 * Personalisierte Anrede für E-Mails
 * Verwendet immer "Hallo [Vorname]" - informell und einheitlich
 * 
 * @example <EmailGreeting userName="Maria Schmidt" />  → "Hallo Maria,"
 * @example <EmailGreeting userName="Thomas Müller" />  → "Hallo Thomas,"
 * @example <EmailGreeting userName="Alex" />           → "Hallo Alex,"
 */
export function EmailGreeting({ userName, salutation }: EmailGreetingProps) {
  const firstName = getFirstName(userName)
  
  return (
    <Text style={{
      color: '#334155',
      fontSize: '16px',
      lineHeight: '26px',
      margin: '0 0 16px',
    }}>
      Hallo {firstName ? <strong>{firstName}</strong> : 'dort'},
    </Text>
  )
}

// ============================================
// Email Divider Component
// ============================================
interface EmailDividerProps {
  spacing?: 'sm' | 'md' | 'lg'
  gradient?: boolean
  primaryColor?: string
}

export function EmailDivider({ spacing = 'md', gradient, primaryColor = '#10b981' }: EmailDividerProps) {
  const spacingValues = {
    sm: '16px 0',
    md: '28px 0',
    lg: '40px 0',
  }

  if (gradient) {
    return (
      <div style={{ margin: spacingValues[spacing], height: '2px', background: `linear-gradient(90deg, ${primaryColor} 0%, #8b5cf6 50%, #ec4899 100%)`, borderRadius: '2px' }} />
    )
  }

  return <Hr style={{ borderColor: '#e2e8f0', margin: spacingValues[spacing] }} />
}

// ============================================
// Email Feature List Component
// ============================================
interface FeatureItem {
  icon: string
  title: string
  description?: string
}

interface EmailFeatureListProps {
  features: FeatureItem[]
  primaryColor?: string
}

export function EmailFeatureList({ features, primaryColor = '#10b981' }: EmailFeatureListProps) {
  return (
    <Section style={{ margin: '24px 0' }}>
      {features.map((feature, index) => (
        <Row key={index} style={{ marginBottom: index < features.length - 1 ? '16px' : '0' }}>
          <Column style={{ width: '40px', verticalAlign: 'top' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${primaryColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              {feature.icon}
            </div>
          </Column>
          <Column style={{ paddingLeft: '12px', verticalAlign: 'top' }}>
            <Text style={{ margin: '0', color: '#0f172a', fontWeight: '600', fontSize: '15px' }}>
              {feature.title}
            </Text>
            {feature.description && (
              <Text style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px', lineHeight: '20px' }}>
                {feature.description}
              </Text>
            )}
          </Column>
        </Row>
      ))}
    </Section>
  )
}

// ============================================
// Email Info Card Component
// ============================================
interface EmailInfoCardProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon?: string
}

export function EmailInfoCard({ children, variant = 'default', icon }: EmailInfoCardProps) {
  const styles = getInfoCardStyles(variant)
  return (
    <Section style={styles.container}>
      {icon && <span style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}>{icon}</span>}
      <div style={styles.content}>{children}</div>
    </Section>
  )
}

function getInfoCardStyles(variant: string) {
  const variants: Record<string, { bg: string; border: string; text: string }> = {
    default: { bg: '#f8fafc', border: '#e2e8f0', text: '#334155' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  }

  const v = variants[variant]

  return {
    container: {
      backgroundColor: v.bg,
      border: `1px solid ${v.border}`,
      borderRadius: '12px',
      padding: '20px 24px',
      margin: '24px 0',
    } as React.CSSProperties,
    content: {
      color: v.text,
      fontSize: '14px',
      lineHeight: '22px',
    } as React.CSSProperties,
  }
}

// ============================================
// Email Stats Row Component
// ============================================
interface StatItem {
  value: string
  label: string
  icon?: string
}

interface EmailStatsRowProps {
  stats: StatItem[]
  primaryColor?: string
}

export function EmailStatsRow({ stats, primaryColor = '#10b981' }: EmailStatsRowProps) {
  return (
    <Row style={{ margin: '24px 0' }}>
      {stats.map((stat, index) => (
        <Column key={index} style={{ textAlign: 'center', width: `${100 / stats.length}%` }}>
          {stat.icon && <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{stat.icon}</span>}
          <Text style={{ margin: '0', color: primaryColor, fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            {stat.value}
          </Text>
          <Text style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
            {stat.label}
          </Text>
        </Column>
      ))}
    </Row>
  )
}

// ============================================
// Email Quote Component
// ============================================
interface EmailQuoteProps {
  children: React.ReactNode
  author?: string
  primaryColor?: string
}

export function EmailQuote({ children, author, primaryColor = '#10b981' }: EmailQuoteProps) {
  return (
    <Section style={{ 
      borderLeft: `4px solid ${primaryColor}`,
      paddingLeft: '20px',
      margin: '24px 0',
    }}>
      <Text style={{ 
        color: '#334155',
        fontSize: '16px',
        fontStyle: 'italic',
        lineHeight: '26px',
        margin: '0',
      }}>
        "{children}"
      </Text>
      {author && (
        <Text style={{ 
          color: '#64748b',
          fontSize: '14px',
          marginTop: '8px',
          marginBottom: '0',
        }}>
          — {author}
        </Text>
      )}
    </Section>
  )
}

// ============================================
// Email Code Block Component
// ============================================
interface EmailCodeBlockProps {
  code: string
  label?: string
}

export function EmailCodeBlock({ code, label }: EmailCodeBlockProps) {
  return (
    <Section style={{ margin: '24px 0' }}>
      {label && (
        <Text style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
          {label}
        </Text>
      )}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px 24px',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: '18px',
        fontWeight: '600',
        color: '#f1f5f9',
        letterSpacing: '4px',
        textAlign: 'center',
      }}>
        {code}
      </div>
    </Section>
  )
}

// ============================================
// Email Button Container Component
// ============================================
interface EmailButtonContainerProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export function EmailButtonContainer({ children, align = 'center' }: EmailButtonContainerProps) {
  return (
    <Section style={{ 
      textAlign: align,
      margin: '32px 0 24px',
    }}>
      {children}
    </Section>
  )
}

// ============================================
// Email Footer Note Component
// ============================================
interface EmailFooterNoteProps {
  children: React.ReactNode
}

export function EmailFooterNote({ children }: EmailFooterNoteProps) {
  return (
    <Text style={{
      color: '#94a3b8',
      fontSize: '13px',
      lineHeight: '20px',
      textAlign: 'center',
      margin: '0',
      paddingTop: '16px',
      borderTop: '1px solid #f1f5f9',
    }}>
      {children}
    </Text>
  )
}

export default {
  EmailBadge,
  EmailHeading,
  EmailParagraph,
  EmailDivider,
  EmailFeatureList,
  EmailInfoCard,
  EmailStatsRow,
  EmailQuote,
  EmailCodeBlock,
  EmailButtonContainer,
  EmailFooterNote,
}










