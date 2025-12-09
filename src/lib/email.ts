import { Resend } from 'resend'
import { prisma } from './prisma'
import { render } from '@react-email/components'
import { ReactElement } from 'react'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email templates mapping - All 44 templates
const templateComponents: Record<string, () => Promise<{ default: React.FC<any> }>> = {
  // Auth & Account
  'welcome': () => import('@/emails/templates/WelcomeEmail'),
  'email-verification': () => import('@/emails/templates/EmailVerificationEmail'),
  'password-reset': () => import('@/emails/templates/PasswordResetEmail'),
  'password-changed': () => import('@/emails/templates/PasswordChangedEmail'),
  'login-new-device': () => import('@/emails/templates/LoginNewDeviceEmail'),
  'account-deactivated': () => import('@/emails/templates/AccountDeactivatedEmail'),
  
  // Onboarding
  'onboarding-submitted': () => import('@/emails/templates/OnboardingSubmittedEmail'),
  'onboarding-approved': () => import('@/emails/templates/OnboardingApprovedEmail'),
  'onboarding-rejected': () => import('@/emails/templates/OnboardingRejectedEmail'),
  
  // Subscription & Payment
  'subscription-activated': () => import('@/emails/templates/SubscriptionActivatedEmail'),
  'subscription-renewed': () => import('@/emails/templates/SubscriptionRenewedEmail'),
  'subscription-expiring': () => import('@/emails/templates/SubscriptionExpiringEmail'),
  'subscription-expired': () => import('@/emails/templates/SubscriptionExpiredEmail'),
  'payment-failed': () => import('@/emails/templates/PaymentFailedEmail'),
  'payment-received': () => import('@/emails/templates/PaymentReceivedEmail'),
  'payment-dispute': () => import('@/emails/templates/PaymentDisputeEmail'),
  'invoice-receipt': () => import('@/emails/templates/InvoiceReceiptEmail'),
  
  // Referral
  'referral-invitation': () => import('@/emails/templates/ReferralInvitationEmail'),
  'referral-success': () => import('@/emails/templates/ReferralSuccessEmail'),
  
  // Booking
  'booking-confirmation': () => import('@/emails/templates/BookingConfirmationEmail'),
  'booking-reminder': () => import('@/emails/templates/BookingReminderEmail'),
  'booking-cancelled': () => import('@/emails/templates/BookingCancelledEmail'),
  'booking-feedback-request': () => import('@/emails/templates/BookingFeedbackRequestEmail'),
  'customer-no-show': () => import('@/emails/templates/CustomerNoShowEmail'),
  
  // Rental (Chair)
  'new-rental-request': () => import('@/emails/templates/NewRentalRequestEmail'),
  'rental-accepted': () => import('@/emails/templates/RentalAcceptedEmail'),
  'rental-rejected': () => import('@/emails/templates/RentalRejectedEmail'),
  'rental-application-sent': () => import('@/emails/templates/RentalApplicationSentEmail'),
  'rental-ending-soon': () => import('@/emails/templates/RentalEndingSoonEmail'),
  'chair-rental-confirmation': () => import('@/emails/templates/ChairRentalConfirmationEmail'),
  'chair-vacancy': () => import('@/emails/templates/ChairVacancyEmail'),
  'rent-payment-due': () => import('@/emails/templates/RentPaymentDueEmail'),
  'rent-payment-overdue': () => import('@/emails/templates/RentPaymentOverdueEmail'),
  
  // Reviews
  'new-review-salon': () => import('@/emails/templates/NewReviewSalonEmail'),
  'new-review-stylist': () => import('@/emails/templates/NewReviewStylistEmail'),
  
  // Salon Invitations
  'salon-invitation': () => import('@/emails/templates/SalonInvitationEmail'),
  'salon-invitation-unregistered': () => import('@/emails/templates/SalonInvitationUnregisteredEmail'),
  'salon-invitation-accepted': () => import('@/emails/templates/SalonInvitationAcceptedEmail'),
  'salon-invitation-rejected': () => import('@/emails/templates/SalonInvitationRejectedEmail'),
  
  // Messaging
  'new-message': () => import('@/emails/templates/NewMessageEmail'),
  
  // Documents
  'document-uploaded': () => import('@/emails/templates/DocumentUploadedEmail'),
  'document-status': () => import('@/emails/templates/DocumentStatusEmail'),
  
  // Admin
  'new-user-registered': () => import('@/emails/templates/NewUserRegisteredEmail'),
  'security-alert': () => import('@/emails/templates/SecurityAlertEmail'),
  'high-churn-alert': () => import('@/emails/templates/HighChurnAlertEmail'),
  
  // Summaries
  'daily-summary': () => import('@/emails/templates/DailySummaryEmail'),
  'weekly-summary': () => import('@/emails/templates/WeeklySummaryEmail'),
  'monthly-summary': () => import('@/emails/templates/MonthlySummaryEmail'),
}

export interface EmailContent {
  headline: string
  body: string
  buttonText?: string
  buttonUrl?: string
  footer?: string
}

export interface SendEmailOptions {
  to: string
  toName?: string
  templateSlug?: string
  template?: string  // Alias für templateSlug (für API-Kompatibilität)
  data: Record<string, any>
  userId?: string
}

export interface EmailSettings {
  logoUrl?: string
  primaryColor?: string
  footerText?: string
  fromName?: string
  replyTo?: string
}

// Get platform email settings
async function getEmailSettings(): Promise<EmailSettings> {
  const settings = await prisma.platformSettings.findFirst()
  return {
    logoUrl: settings?.emailLogoUrl || settings?.logoUrl || undefined,
    primaryColor: settings?.emailPrimaryColor || '#10b981',
    footerText: settings?.emailFooterText || '© 2025 NICNOA&CO.online. Alle Rechte vorbehalten.',
    fromName: settings?.emailFromName || 'NICNOA',
    replyTo: settings?.emailReplyTo || settings?.supportEmail || undefined,
  }
}

// Replace placeholders in text
function replaceVariables(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '')
}

// Main email sending function
export async function sendEmail({ to, toName, templateSlug, template: templateAlias, data, userId }: SendEmailOptions) {
  // Support both templateSlug and template parameter names
  const slug = templateSlug || templateAlias
  
  if (!slug) {
    console.error('No template specified')
    return { success: false, error: 'No template specified' }
  }
  
  // Get template from database
  const dbTemplate = await prisma.emailTemplate.findUnique({
    where: { slug }
  })

  if (!dbTemplate) {
    console.error(`Email template '${slug}' not found`)
    return { success: false, error: 'Template not found' }
  }

  if (!dbTemplate.isActive) {
    console.warn(`Email template '${slug}' is inactive`)
    return { success: false, error: 'Template inactive' }
  }

  // Get platform settings
  const settings = await getEmailSettings()

  // Load template component
  const componentLoader = templateComponents[slug]
  if (!componentLoader) {
    console.error(`No component found for template '${slug}'`)
    return { success: false, error: 'Component not found' }
  }

  const templateContent = dbTemplate.content as EmailContent

  try {
    // Import and render the email component
    const { default: EmailComponent } = await componentLoader()
    
    const emailElement = EmailComponent({
      ...data,
      content: templateContent,
      logoUrl: dbTemplate.logoUrl || settings.logoUrl,
      primaryColor: dbTemplate.primaryColor || settings.primaryColor,
      footerText: settings.footerText,
    }) as ReactElement

    const emailHtml = await render(emailElement)
    const subject = replaceVariables(dbTemplate.subject, data)

    // Create log entry
    const emailLog = await prisma.emailLog.create({
      data: {
        templateId: dbTemplate.id,
        userId,
        recipientEmail: to,
        recipientName: toName,
        subject,
        status: 'PENDING',
        metadata: data,
      }
    })

    // Check if Resend is configured
    if (!resend) {
      console.log(`[Email Preview] Would send "${subject}" to ${to}`)
      console.log(`[Email Preview] Template: ${slug}`)
      
      // Update log status
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          errorMessage: 'Demo mode - Resend not configured',
        }
      })

      return { 
        success: true, 
        messageId: `demo-${emailLog.id}`,
        preview: true 
      }
    }

    // Send via Resend
    const { data: result, error } = await resend.emails.send({
      from: `${settings.fromName} <${process.env.RESEND_FROM_EMAIL || 'noreply@nicnoa.de'}>`,
      to: [to],
      replyTo: settings.replyTo,
      subject,
      html: emailHtml,
    })

    // Update log
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: error ? 'FAILED' : 'SENT',
        errorMessage: error?.message,
        resendId: result?.id,
        sentAt: error ? null : new Date(),
      }
    })

    if (error) {
      console.error(`Failed to send email: ${error.message}`)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: result?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Render email preview (for admin editor)
export async function renderEmailPreview(
  templateSlug: string,
  customContent?: EmailContent,
  previewData?: Record<string, any>
): Promise<{ html: string; subject: string } | { error: string }> {
  const template = await prisma.emailTemplate.findUnique({
    where: { slug: templateSlug }
  })

  if (!template) {
    return { error: 'Template not found' }
  }

  const settings = await getEmailSettings()
  const componentLoader = templateComponents[templateSlug]
  
  if (!componentLoader) {
    return { error: 'Component not found' }
  }

  const content = customContent || (template.content as EmailContent)
  
  // Sample data for preview
  const sampleData: Record<string, any> = {
    userName: 'Max Mustermann',
    userEmail: 'max@beispiel.de',
    salonName: 'Salon Elegance',
    stylistName: 'Anna Beispiel',
    bookingDate: new Date().toLocaleDateString('de-DE'),
    bookingTime: '14:00',
    serviceName: 'Damenschnitt',
    amount: '89,00 €',
    resetUrl: 'https://nicnoa.de/reset?token=xxx',
    verifyUrl: 'https://nicnoa.de/verify?token=xxx',
    dashboardUrl: 'https://nicnoa.de/dashboard',
    referralCode: 'MAXM2024',
    referralUrl: 'https://nicnoa.de/r/MAXM2024',
    invoiceNumber: 'INV-2024-001',
    planName: 'Premium',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
    ...previewData,
  }

  try {
    const { default: EmailComponent } = await componentLoader()
    
    const emailElement = EmailComponent({
      ...sampleData,
      content,
      logoUrl: template.logoUrl || settings.logoUrl,
      primaryColor: template.primaryColor || settings.primaryColor,
      footerText: settings.footerText,
    }) as ReactElement

    const html = await render(emailElement)
    const subject = replaceVariables(template.subject, sampleData)

    return { html, subject }
  } catch (error) {
    console.error('Preview render error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Render error' 
    }
  }
}

// Send test email
export async function sendTestEmail(templateSlug: string, testEmail: string) {
  return sendEmail({
    to: testEmail,
    templateSlug,
    data: {
      userName: 'Test Benutzer',
      userEmail: testEmail,
    }
  })
}

// Helper functions for specific email types
export const emails = {
  // Auth
  sendWelcome: (to: string, userName: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'welcome', data: { userName }, userId }),

  sendEmailVerification: (to: string, userName: string, verifyUrl: string) =>
    sendEmail({ to, templateSlug: 'email-verification', data: { userName, verifyUrl } }),

  sendPasswordReset: (to: string, userName: string, resetUrl: string) =>
    sendEmail({ to, templateSlug: 'password-reset', data: { userName, resetUrl } }),

  // Onboarding
  sendOnboardingSubmitted: (to: string, stylistName: string, reviewUrl: string) =>
    sendEmail({ to, templateSlug: 'onboarding-submitted', data: { stylistName, reviewUrl } }),

  sendOnboardingApproved: (to: string, userName: string, dashboardUrl: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'onboarding-approved', data: { userName, dashboardUrl }, userId }),

  sendOnboardingRejected: (to: string, userName: string, reason: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'onboarding-rejected', data: { userName, reason }, userId }),

  // Subscription
  sendSubscriptionActivated: (to: string, userName: string, planName: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'subscription-activated', data: { userName, planName }, userId }),

  sendSubscriptionRenewed: (to: string, userName: string, planName: string, nextBillingDate: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'subscription-renewed', data: { userName, planName, nextBillingDate }, userId }),

  sendSubscriptionExpiring: (to: string, userName: string, expirationDate: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'subscription-expiring', data: { userName, expirationDate }, userId }),

  sendSubscriptionExpired: (to: string, userName: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'subscription-expired', data: { userName }, userId }),

  sendPaymentFailed: (to: string, userName: string, amount: string, retryUrl: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'payment-failed', data: { userName, amount, retryUrl }, userId }),

  sendInvoiceReceipt: (to: string, userName: string, invoiceNumber: string, amount: string, invoiceUrl: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'invoice-receipt', data: { userName, invoiceNumber, amount, invoiceUrl }, userId }),

  // Referral
  sendReferralInvitation: (to: string, referrerName: string, referralUrl: string) =>
    sendEmail({ to, templateSlug: 'referral-invitation', data: { referrerName, referralUrl } }),

  sendReferralSuccess: (to: string, userName: string, referredName: string, rewardDescription: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'referral-success', data: { userName, referredName, rewardDescription }, userId }),

  // Booking
  sendBookingConfirmation: (to: string, userName: string, stylistName: string, serviceName: string, bookingDate: string, bookingTime: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'booking-confirmation', data: { userName, stylistName, serviceName, bookingDate, bookingTime }, userId }),

  sendBookingReminder: (to: string, userName: string, stylistName: string, serviceName: string, bookingDate: string, bookingTime: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'booking-reminder', data: { userName, stylistName, serviceName, bookingDate, bookingTime }, userId }),

  sendBookingCancelled: (to: string, userName: string, serviceName: string, bookingDate: string, reason?: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'booking-cancelled', data: { userName, serviceName, bookingDate, reason }, userId }),

  // System
  sendNewMessage: (to: string, userName: string, senderName: string, messagePreview: string, conversationUrl: string, userId?: string) =>
    sendEmail({ to, templateSlug: 'new-message', data: { userName, senderName, messagePreview, conversationUrl }, userId }),
}

export default emails

