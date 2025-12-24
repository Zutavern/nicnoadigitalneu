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

interface MockEmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  content: {
    headline: string
    body: string
    buttonText?: string
    buttonUrl?: string
    footer?: string
  }
  primaryColor?: string | null
}

/**
 * Renders an email template preview from mock data (for Demo Mode)
 */
export async function renderEmailPreviewFromMock(
  template: MockEmailTemplate,
  customContent?: {
    subject?: string
    content?: TemplateContent
  },
  previewData?: PreviewData
): Promise<EmailPreviewResult | EmailPreviewError> {
  try {
    // Default preview data
    const defaultPreviewData: PreviewData = {
      userName: 'Max Mustermann',
      userEmail: 'max@example.com',
      companyName: 'NICNOA&CO.online',
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

    // Parse template content
    const templateContent: TemplateContent = template.content ? {
      headline: template.content.headline || '',
      body: template.content.body || '',
      buttonText: template.content.buttonText,
      buttonUrl: template.content.buttonUrl,
      footer: template.content.footer,
    } : { headline: '', body: '' }
    
    // Use custom content or template content
    let subject = customContent?.subject || template.subject || 'Keine Betreffzeile'
    const content: TemplateContent = {
      headline: customContent?.content?.headline ?? templateContent.headline ?? '',
      body: customContent?.content?.body ?? templateContent.body ?? '',
      buttonText: customContent?.content?.buttonText ?? templateContent.buttonText,
      buttonUrl: customContent?.content?.buttonUrl ?? templateContent.buttonUrl,
      footer: customContent?.content?.footer ?? templateContent.footer,
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
      logoUrl: null,
      primaryColor: template.primaryColor || '#10b981',
      companyName: 'NICNOA&CO.online',
    })

    // Generate plain text version
    const text = generatePlainText(processedContent, subject)

    return {
      subject,
      html: brandedHtml,
      text,
    }
  } catch (error) {
    console.error('Error rendering email preview from mock:', error)
    return { error: 'Fehler beim Rendern der Vorschau' }
  }
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

    // Fetch platform settings for branding (use findFirst since there's only one record)
    const settings = await prisma.platformSettings.findFirst({
      select: {
        companyName: true,
        emailLogoUrl: true,
        emailPrimaryColor: true,
        emailFooterText: true,
        emailFromName: true,
      },
    })
    
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Branding Settings:', {
        logoUrl: settings?.emailLogoUrl,
        primaryColor: settings?.emailPrimaryColor,
        footerText: settings?.emailFooterText?.substring(0, 50),
      })
    }

    // Default preview data
    const defaultPreviewData: PreviewData = {
      userName: 'Max Mustermann',
      userEmail: 'max@example.com',
      companyName: settings?.companyName || 'NICNOA&CO.online',
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

    // Parse template content (JSON field) - handle null, undefined, or empty object
    const rawTemplateContent = template.content as Record<string, unknown> | null
    const templateContent: TemplateContent = rawTemplateContent ? {
      headline: typeof rawTemplateContent.headline === 'string' ? rawTemplateContent.headline : '',
      body: typeof rawTemplateContent.body === 'string' ? rawTemplateContent.body : '',
      buttonText: typeof rawTemplateContent.buttonText === 'string' ? rawTemplateContent.buttonText : undefined,
      buttonUrl: typeof rawTemplateContent.buttonUrl === 'string' ? rawTemplateContent.buttonUrl : undefined,
      footer: typeof rawTemplateContent.footer === 'string' ? rawTemplateContent.footer : undefined,
    } : { headline: '', body: '' }
    
    // Use custom content or template content
    let subject = customContent?.subject || template.subject || 'Keine Betreffzeile'
    const content: TemplateContent = {
      headline: customContent?.content?.headline ?? templateContent.headline ?? '',
      body: customContent?.content?.body ?? templateContent.body ?? '',
      buttonText: customContent?.content?.buttonText ?? templateContent.buttonText,
      buttonUrl: customContent?.content?.buttonUrl ?? templateContent.buttonUrl,
      footer: customContent?.content?.footer ?? templateContent.footer,
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
      companyName: settings?.companyName || 'NICNOA&CO.online',
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
 * Generate a stylized text logo when no image logo is uploaded
 * Matches the styling from the React navigation component
 */
function generateTextLogo(companyName: string, primaryColor: string): string {
  // Use the same system font stack as the website (sans-serif)
  const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  
  // Check if it's the default NICNOA name - apply special styling matching the nav
  if (companyName.toUpperCase().includes('NICNOA')) {
    return `
      <div style="display: inline-block; text-align: center;">
        <span style="
          font-family: ${fontFamily};
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #ffffff;
        ">NICNOA</span><span style="
          font-family: ${fontFamily};
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: ${primaryColor};
        ">&amp;CO</span><span style="
          font-family: ${fontFamily};
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: ${primaryColor};
        ">.online</span>
      </div>
    `
  }
  
  // Generic styling for custom company names (same font stack)
  return `
    <div style="display: inline-block; text-align: center;">
      <span style="
        font-family: ${fontFamily};
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: #ffffff;
      ">${companyName}</span>
    </div>
  `
}

/**
 * Wrap HTML content with branded email template
 */
function wrapWithBranding(
  content: string,
  branding: {
    logoUrl?: string | null
    primaryColor: string
    companyName: string
  }
): string {
  const { logoUrl, primaryColor, companyName } = branding

  // Generate logo HTML - either image or styled text
  const logoHtml = logoUrl 
    ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 48px; width: auto;" />`
    : generateTextLogo(companyName, primaryColor)

  // Generate footer links HTML - using dark gray for better readability
  const footerLinksHtml = FOOTER_LINKS
    .map(link => `<a href="${link.href}" style="color: #374151; text-decoration: none;">${link.label}</a>`)
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
      color: #374151;
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
        ${logoHtml}
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p class="footer-links" style="margin: 0 0 8px 0;">
          ${footerLinksHtml}
        </p>
        <p style="margin: 0; font-size: 11px;">
          © ${new Date().getFullYear()} ${companyName}. Alle Rechte vorbehalten.
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
  subject?: string // Optional custom subject (overrides template subject)
  data?: PreviewData
  userId?: string // Optional user ID for logging
  replyTo?: string
  useTestSender?: boolean // Use Resend's test domain (onboarding@resend.dev)
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get Resend configuration - use findFirst since there's only one record
    const settings = await prisma.platformSettings.findFirst() as {
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
        subject: options.subject || rendered.subject,
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

// ============================================================================
// COMPATIBILITY LAYER
// Legacy API for backwards compatibility with existing code
// ============================================================================

/**
 * Legacy emails object for backwards compatibility
 * Provides the old API interface that wraps the new sendEmail function
 */
export const emails = {
  /**
   * Send email using template slug
   */
  sendEmail: async (options: {
    to: string | string[]
    templateSlug: string
    data?: PreviewData
    userId?: string
    subject?: string
    replyTo?: string
    useTestSender?: boolean
  }) => {
    return sendEmail(options)
  },

  /**
   * Send password changed notification email
   */
  sendPasswordChanged: async (email: string, userName: string) => {
    return sendEmail({
      to: email,
      templateSlug: 'password-changed',
      data: {
        userName,
        changeTime: new Date().toLocaleString('de-DE'),
      },
    })
  },

  /**
   * Send booking reminder email
   */
  sendBookingReminder: async (
    email: string,
    customerName: string,
    stylistName: string,
    serviceName: string,
    bookingDate: string,
    bookingTime: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'booking-reminder',
      data: {
        userName: customerName,
        stylistName,
        serviceName,
        bookingDate,
        bookingTime,
      },
    })
  },

  /**
   * Send subscription expiring notification email
   */
  sendSubscriptionExpiring: async (
    email: string,
    userName: string,
    expirationDate: string,
    userId?: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'subscription-expiring',
      data: {
        userName,
        expirationDate,
      },
      userId,
    })
  },

  /**
   * Send welcome email
   */
  sendWelcome: async (email: string, userName: string) => {
    return sendEmail({
      to: email,
      templateSlug: 'welcome',
      data: { userName },
    })
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (email: string, userName: string, resetLink: string) => {
    return sendEmail({
      to: email,
      templateSlug: 'password-reset',
      data: { userName, resetLink },
    })
  },

  /**
   * Send email verification email
   */
  sendEmailVerification: async (email: string, userName: string, verifyLink: string) => {
    return sendEmail({
      to: email,
      templateSlug: 'email-verification',
      data: { userName, verifyLink },
    })
  },

  /**
   * Send payment failed notification email
   */
  sendPaymentFailed: async (
    email: string,
    userName: string,
    amount?: string,
    invoiceUrl?: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'payment-failed',
      subject: 'Zahlungsproblem - Bitte aktualisieren Sie Ihre Zahlungsmethode',
      data: {
        userName,
        amount: amount || 'Nicht verfügbar',
        invoiceUrl: invoiceUrl || '',
        portalUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings/billing`,
      },
    })
  },

  /**
   * Send trial ending soon notification email
   */
  sendTrialEndingSoon: async (
    email: string,
    userName: string,
    trialEndDate: string,
    daysRemaining: number,
    planName?: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'trial-ending',
      subject: `Ihre Testphase endet in ${daysRemaining} Tagen`,
      data: {
        userName,
        trialEndDate,
        daysRemaining: daysRemaining.toString(),
        planName: planName || 'Premium',
        upgradeUrl: `${process.env.NEXTAUTH_URL}/preise`,
      },
    })
  },

  /**
   * Send subscription renewed notification email
   */
  sendSubscriptionRenewed: async (
    email: string,
    userName: string,
    planName: string,
    amount: string,
    nextBillingDate: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'subscription-renewed',
      data: {
        userName,
        planName,
        amount,
        nextBillingDate,
      },
    })
  },

  /**
   * Send subscription cancelled notification email
   */
  sendSubscriptionCancelled: async (
    email: string,
    userName: string,
    endDate: string
  ) => {
    return sendEmail({
      to: email,
      templateSlug: 'subscription-cancelled',
      data: {
        userName,
        endDate,
        reactivateUrl: `${process.env.NEXTAUTH_URL}/preise`,
      },
    })
  },
}

// Default export for backwards compatibility with `import emails from '@/lib/email'`
export default emails
