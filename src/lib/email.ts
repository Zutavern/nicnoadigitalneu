import { prisma } from '@/lib/prisma'

interface EmailPreviewResult {
  subject: string
  html: string
  text?: string
}

interface EmailPreviewError {
  error: string
}

interface PreviewData {
  userName?: string
  userEmail?: string
  companyName?: string
  resetLink?: string
  verifyLink?: string
  loginLink?: string
  bookingDate?: string
  bookingTime?: string
  salonName?: string
  stylistName?: string
  serviceName?: string
  amount?: string
  [key: string]: string | undefined
}

interface TemplateContent {
  headline?: string
  body?: string
  buttonText?: string
  buttonUrl?: string
  footer?: string
}

/**
 * Renders an email template preview with placeholder data
 */
export async function renderEmailPreview(
  templateSlug: string,
  customContent?: {
    subject?: string
    content?: TemplateContent
  },
  previewData?: PreviewData
): Promise<EmailPreviewResult | EmailPreviewError> {
  try {
    // Fetch template from database
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: templateSlug },
    })

    if (!template) {
      return { error: `Template "${templateSlug}" nicht gefunden` }
    }

    // Fetch platform settings for branding
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        companyName: true,
        emailLogoUrl: true,
        emailPrimaryColor: true,
        emailFooterText: true,
        emailFromName: true,
      },
    })

    // Default preview data
    const defaultPreviewData: PreviewData = {
      userName: 'Max Mustermann',
      userEmail: 'max@example.com',
      companyName: settings?.companyName || 'NICNOA',
      resetLink: 'https://example.com/reset?token=abc123',
      verifyLink: 'https://example.com/verify?token=abc123',
      loginLink: 'https://example.com/login',
      bookingDate: '15. Januar 2025',
      bookingTime: '14:00 Uhr',
      salonName: 'Salon Schönheit',
      stylistName: 'Anna Schmidt',
      serviceName: 'Haarschnitt & Styling',
      amount: '45,00 €',
      currentYear: new Date().getFullYear().toString(),
    }

    // Merge with custom preview data
    const data = { ...defaultPreviewData, ...previewData }

    // Parse template content (JSON field)
    const templateContent = template.content as TemplateContent | null
    
    // Use custom content or template content
    let subject = customContent?.subject || template.subject
    const content: TemplateContent = {
      headline: customContent?.content?.headline || templateContent?.headline || '',
      body: customContent?.content?.body || templateContent?.body || '',
      buttonText: customContent?.content?.buttonText || templateContent?.buttonText,
      buttonUrl: customContent?.content?.buttonUrl || templateContent?.buttonUrl,
      footer: customContent?.content?.footer || templateContent?.footer,
    }

    // Replace placeholders in subject
    subject = replacePlaceholders(subject, data)

    // Replace placeholders in content fields
    const processedContent: TemplateContent = {
      headline: content.headline ? replacePlaceholders(content.headline, data) : undefined,
      body: content.body ? replacePlaceholders(content.body, data) : undefined,
      buttonText: content.buttonText ? replacePlaceholders(content.buttonText, data) : undefined,
      buttonUrl: content.buttonUrl ? replacePlaceholders(content.buttonUrl, data) : undefined,
      footer: content.footer ? replacePlaceholders(content.footer, data) : undefined,
    }

    // Generate HTML from content
    const htmlContent = generateHtmlFromContent(processedContent)

    // Add branding wrapper
    const brandedHtml = wrapWithBranding(htmlContent, {
      logoUrl: settings?.emailLogoUrl,
      primaryColor: template.primaryColor || settings?.emailPrimaryColor || '#10b981',
      footerText: processedContent.footer || settings?.emailFooterText || `© ${new Date().getFullYear()} ${settings?.companyName || 'NICNOA'}. Alle Rechte vorbehalten.`,
      companyName: settings?.companyName || 'NICNOA',
    })

    // Generate plain text version
    const text = generatePlainText(processedContent, subject)

    return {
      subject,
      html: brandedHtml,
      text,
    }
  } catch (error) {
    console.error('Error rendering email preview:', error)
    return { error: 'Fehler beim Rendern der Vorschau' }
  }
}

/**
 * Generate HTML content from template content structure
 */
function generateHtmlFromContent(content: TemplateContent): string {
  let html = ''

  if (content.headline) {
    html += `<h2 style="margin-top: 0; color: #18181b;">${content.headline}</h2>`
  }

  if (content.body) {
    // Convert newlines to paragraphs
    const paragraphs = content.body.split('\n\n')
    html += paragraphs.map(p => `<p style="color: #52525b; margin: 16px 0;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  }

  if (content.buttonText && content.buttonUrl) {
    html += `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${content.buttonUrl}" class="button" style="display: inline-block; background-color: #10b981; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          ${content.buttonText}
        </a>
      </div>
    `
  }

  return html
}

/**
 * Generate plain text version of email
 */
function generatePlainText(content: TemplateContent, subject: string): string {
  let text = `${subject}\n${'='.repeat(subject.length)}\n\n`

  if (content.headline) {
    text += `${content.headline}\n\n`
  }

  if (content.body) {
    text += `${content.body}\n\n`
  }

  if (content.buttonText && content.buttonUrl) {
    text += `${content.buttonText}: ${content.buttonUrl}\n\n`
  }

  // Footer with links
  text += `---\n`
  if (content.footer) {
    text += `${content.footer}\n\n`
  }
  
  // Add plain text links
  text += `Datenschutz: ${BASE_URL}/datenschutz\n`
  text += `Impressum: ${BASE_URL}/impressum\n`
  text += `AGB: ${BASE_URL}/agb\n`
  text += `Login: ${BASE_URL}/login\n`

  return text
}

/**
 * Replace {{placeholder}} with actual values
 */
function replacePlaceholders(content: string, data: PreviewData): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match
  })
}

// Base URL for footer links
const BASE_URL = 'https://www.nicnoa.online'

// Footer links for all emails
const FOOTER_LINKS = [
  { label: 'Datenschutz', href: `${BASE_URL}/datenschutz` },
  { label: 'Impressum', href: `${BASE_URL}/impressum` },
  { label: 'AGB', href: `${BASE_URL}/agb` },
  { label: 'Login', href: `${BASE_URL}/login` },
]

/**
 * Wrap HTML content with branded email template
 */
function wrapWithBranding(
  content: string,
  branding: {
    logoUrl?: string | null
    primaryColor: string
    footerText: string
    companyName: string
  }
): string {
  const { logoUrl, primaryColor, footerText, companyName } = branding

  // Generate footer links HTML
  const footerLinksHtml = FOOTER_LINKS
    .map(link => `<a href="${link.href}" style="color: ${primaryColor}; text-decoration: none;">${link.label}</a>`)
    .join(' &nbsp;|&nbsp; ')

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f4f5;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%);
      padding: 32px;
      text-align: center;
    }
    .header img {
      max-height: 48px;
      width: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 16px 0 0 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .content h2 {
      color: #18181b;
      margin-top: 0;
    }
    .content p {
      color: #52525b;
      margin: 16px 0;
    }
    .button {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: ${adjustColor(primaryColor, -15)};
    }
    .footer {
      background-color: #f4f4f5;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #71717a;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
    .footer-links {
      margin-top: 12px;
      font-size: 11px;
    }
    @media (max-width: 600px) {
      .content {
        padding: 24px 16px;
      }
      .header {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" />` : `<h1>${companyName}</h1>`}
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">${footerText}</p>
        <p class="footer-links" style="margin: 0;">
          ${footerLinksHtml}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Adjust hex color brightness
 */
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse hex to RGB
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (r * percent) / 100))
  g = Math.min(255, Math.max(0, g + (g * percent) / 100))
  b = Math.min(255, Math.max(0, b + (b * percent) / 100))

  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

/**
 * Send an email using Resend (if configured)
 * 
 * IMPORTANT: The FROM address must be from a verified domain in Resend.
 * If your domain is not verified, use useTestSender: true to use Resend's test domain.
 * Resend Test Domain: onboarding@resend.dev (can send to any email)
 */
export async function sendEmail(options: {
  to: string | string[]
  templateSlug: string
  data?: PreviewData
  replyTo?: string
  useTestSender?: boolean // Use Resend's test domain (onboarding@resend.dev)
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get Resend configuration - use type assertion for new fields
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    }) as {
      resendApiKey?: string | null
      resendEnabled?: boolean
      resendFromEmail?: string | null
      resendFromName?: string | null
    } | null

    if (!settings?.resendEnabled || !settings?.resendApiKey) {
      console.warn('Resend is not configured or disabled')
      return { success: false, error: 'E-Mail-Versand nicht konfiguriert' }
    }

    // Render email
    const rendered = await renderEmailPreview(options.templateSlug, undefined, options.data)

    if ('error' in rendered) {
      return { success: false, error: rendered.error }
    }

    // Determine the FROM address
    // If useTestSender is true OR no custom from email is set, use Resend's test domain
    let fromAddress: string
    if (options.useTestSender || !settings.resendFromEmail) {
      // Use Resend's test domain - works without domain verification
      fromAddress = `${settings.resendFromName || 'NICNOA'} <onboarding@resend.dev>`
    } else {
      fromAddress = `${settings.resendFromName || 'NICNOA'} <${settings.resendFromEmail}>`
    }

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        reply_to: options.replyTo,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      
      // Check if error is about domain verification
      const errorMessage = errorData.message || 'Fehler beim E-Mail-Versand'
      if (errorMessage.toLowerCase().includes('domain') || errorMessage.toLowerCase().includes('verif')) {
        return { 
          success: false, 
          error: `Domain nicht verifiziert. Bitte verifizieren Sie Ihre Domain in Resend oder verwenden Sie die Test-Funktion. (${errorMessage})`
        }
      }
      
      return { success: false, error: errorMessage }
    }

    const result = await response.json()

    // Log the email
    const template = await prisma.emailTemplate.findUnique({ where: { slug: options.templateSlug } })
    if (template) {
      await prisma.emailLog.create({
        data: {
          template: { connect: { id: template.id } },
          recipientEmail: Array.isArray(options.to) ? options.to[0] : options.to,
          subject: rendered.subject,
          status: 'SENT',
          resendId: result.id,
          sentAt: new Date(),
        },
      })
    }

    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Interner Fehler beim E-Mail-Versand' }
  }
}
