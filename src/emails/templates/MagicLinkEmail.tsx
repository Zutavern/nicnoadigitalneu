import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'
import {
  EmailBadge,
  EmailHeading,
  EmailParagraph,
  EmailDivider,
  EmailInfoCard,
  EmailButtonContainer,
  EmailFooterNote,
  EmailGreeting,
  type Salutation,
} from '../components/EmailComponents'

interface MagicLinkEmailProps {
  userName: string
  salutation?: Salutation
  loginUrl: string
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

export function MagicLinkEmail({
  userName,
  salutation,
  loginUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Dein Magic Link für NICNOA"
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <EmailBadge variant="info" icon="🔗">
        Magic Link Login
      </EmailBadge>

      <EmailHeading as="h1">{content.headline}</EmailHeading>

      <EmailGreeting userName={userName} salutation={salutation} />

      <EmailParagraph>{content.body}</EmailParagraph>

      <EmailButtonContainer>
        <EmailButton href={loginUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Jetzt anmelden'}
        </EmailButton>
      </EmailButtonContainer>

      <EmailDivider />

      <EmailInfoCard variant="warning" icon="⏰">
        <strong>Wichtiger Hinweis:</strong> Dieser Link ist aus Sicherheitsgründen nur <strong>15 Minuten</strong> gültig 
        und kann nur einmal verwendet werden.
      </EmailInfoCard>

      <EmailParagraph muted small center>
        Falls du diese Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.
        Niemand kann ohne diesen Link auf dein Konto zugreifen.
      </EmailParagraph>

      {content.footer && (
        <EmailFooterNote>{content.footer}</EmailFooterNote>
      )}
    </EmailLayout>
  )
}

export default MagicLinkEmail



