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

interface PasswordResetEmailProps {
  userName: string
  salutation?: Salutation
  resetUrl: string
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

export function PasswordResetEmail({
  userName,
  salutation,
  resetUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Setze dein NICNOA-Passwort zurück"
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <EmailBadge variant="info" icon="🔐">
        Passwort zurücksetzen
      </EmailBadge>

      <EmailHeading as="h1">{content.headline}</EmailHeading>

      <EmailGreeting userName={userName} salutation={salutation} />

      <EmailParagraph>{content.body}</EmailParagraph>

      <EmailButtonContainer>
        <EmailButton href={resetUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Neues Passwort setzen'}
        </EmailButton>
      </EmailButtonContainer>

      <EmailDivider />

      <EmailInfoCard variant="warning" icon="⏰">
        <strong>Wichtiger Hinweis:</strong> Dieser Link ist aus Sicherheitsgründen nur <strong>24 Stunden</strong> gültig. 
        Danach musst du einen neuen Link anfordern.
      </EmailInfoCard>

      <EmailParagraph muted small center>
        Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. 
        Dein Passwort bleibt unverändert.
      </EmailParagraph>

      {content.footer && (
        <EmailFooterNote>{content.footer}</EmailFooterNote>
      )}
    </EmailLayout>
  )
}

export default PasswordResetEmail
