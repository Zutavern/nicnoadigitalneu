import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import {
  EmailBadge,
  EmailHeading,
  EmailParagraph,
  EmailDivider,
  EmailFeatureList,
  EmailButtonContainer,
  EmailFooterNote,
} from '../components/EmailComponents'

interface WelcomeEmailProps {
  userName: string
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

export function WelcomeEmail({
  userName,
  dashboardUrl = 'https://nicnoa.online/dashboard',
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: WelcomeEmailProps) {
  const bodyText = content.body.replace(/\{\{name\}\}/g, userName)

  const features = [
    {
      icon: '✨',
      title: 'Professionelles Dashboard',
      description: 'Behalte alle deine Termine, Einnahmen und Statistiken im Blick',
    },
    {
      icon: '📅',
      title: 'Smart Booking',
      description: 'Einfache Terminverwaltung für dich und deine Kunden',
    },
    {
      icon: '📊',
      title: 'Detaillierte Analytics',
      description: 'Verstehe dein Geschäft mit aussagekräftigen Einblicken',
    },
    {
      icon: '💺',
      title: 'Stuhlvermietung',
      description: 'Finde den perfekten Platz oder vermiete deinen eigenen',
    },
  ]

  return (
    <EmailLayout
      preview={`Willkommen bei NICNOA, ${userName}! 🎉`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <EmailBadge variant="success" icon="🎉">
        Willkommen!
      </EmailBadge>

      <EmailHeading as="h1">{content.headline}</EmailHeading>

      <EmailParagraph>
        Hallo <strong>{userName}</strong>,
      </EmailParagraph>

      <EmailParagraph>{bodyText}</EmailParagraph>

      <EmailDivider gradient primaryColor={primaryColor} />

      <EmailParagraph muted small>
        <strong>Was dich erwartet:</strong>
      </EmailParagraph>

      <EmailFeatureList features={features} primaryColor={primaryColor} />

      <EmailButtonContainer>
        <EmailButton href={dashboardUrl} primaryColor={primaryColor} size="lg">
          {content.buttonText || 'Zum Dashboard'}
        </EmailButton>
      </EmailButtonContainer>

      {content.footer && (
        <EmailFooterNote>{content.footer}</EmailFooterNote>
      )}
    </EmailLayout>
  )
}

export default WelcomeEmail
