import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from '../components/EmailLayout'
import { EmailButton } from '../components/EmailButton'

interface NewMessageEmailProps {
  userName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
  senderImage?: string
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

export function NewMessageEmail({
  userName,
  senderName,
  messagePreview,
  conversationUrl,
  content,
  logoUrl,
  primaryColor = '#10b981',
  footerText,
}: NewMessageEmailProps) {
  const bodyText = content.body
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\{\{senderName\}\}/g, senderName)

  // Kürze die Nachricht auf max 150 Zeichen
  const shortPreview = messagePreview.length > 150 
    ? messagePreview.substring(0, 150) + '...'
    : messagePreview

  return (
    <EmailLayout
      preview={`Neue Nachricht von ${senderName}`}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      footerText={footerText}
    >
      <Text style={badge}>💬 Neue Nachricht</Text>

      <Heading style={heading}>{content.headline}</Heading>
      
      <Text style={paragraph}>
        Hallo <strong>{userName}</strong>,
      </Text>
      
      <Text style={paragraph}>{bodyText}</Text>

      <Section style={messageBox}>
        <div style={senderSection}>
          <div style={avatar}>
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text style={senderNameStyle}>{senderName}</Text>
            <Text style={senderTime}>Gerade eben</Text>
          </div>
        </div>
        
        <Section style={messageContent}>
          <Text style={messageText}>{shortPreview}</Text>
        </Section>
      </Section>

      <div style={buttonContainer}>
        <EmailButton href={conversationUrl} primaryColor={primaryColor}>
          {content.buttonText || 'Nachricht beantworten'}
        </EmailButton>
      </div>

      <Text style={unsubscribeNote}>
        Du erhältst diese E-Mail, weil du Nachrichtenbenachrichtigungen 
        aktiviert hast. Du kannst dies in deinen Einstellungen ändern.
      </Text>

      {content.footer && (
        <Text style={footerNote}>{content.footer}</Text>
      )}
    </EmailLayout>
  )
}

const badge: React.CSSProperties = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
  margin: '0 0 20px',
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const messageBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '16px',
  padding: '20px',
  margin: '20px 0',
}

const senderSection: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
}

const avatar: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: '44px',
  textAlign: 'center',
}

const senderNameStyle: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const senderTime: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  margin: '0',
}

const messageContent: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '16px',
}

const messageText: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const unsubscribeNote: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center',
}

const footerNote: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  marginTop: '16px',
}

export default NewMessageEmail





