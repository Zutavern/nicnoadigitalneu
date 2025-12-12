import posthog from 'posthog-js'

// ============================================
// Analytics Utility Library
// ============================================

/**
 * Track a custom event in PostHog
 * @param eventName - Name of the event (e.g., 'signup_started', 'button_clicked')
 * @param properties - Optional properties to include with the event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    posthog.capture(eventName, properties)
  }
}

/**
 * Track a page view
 * @param url - The URL of the page
 * @param properties - Optional properties (e.g., referrer, page_title)
 */
export function trackPageView(url: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    posthog.capture('$pageview', {
      $current_url: url,
      ...properties,
    })
  }
}

/**
 * Identify a user after login/signup
 * @param userId - Unique user ID
 * @param properties - Optional user properties (name, email, role, etc.)
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    posthog.identify(userId, properties)
  }
}

/**
 * Reset the user identity (on logout)
 */
export function resetUser() {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    posthog.reset()
  }
}

/**
 * Set user properties without identifying
 * @param properties - Properties to set on the current user
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    posthog.people.set(properties)
  }
}

/**
 * Track a conversion event (for funnel analysis)
 * @param funnelName - Name of the funnel (e.g., 'signup_funnel')
 * @param step - Current step in the funnel
 * @param properties - Optional properties
 */
export function trackFunnelStep(funnelName: string, step: string, properties?: Record<string, unknown>) {
  trackEvent(`${funnelName}_${step}`, {
    funnel: funnelName,
    step,
    ...properties,
  })
}

// ============================================
// Pre-defined Event Trackers
// ============================================

// Auth Events
export const AuthEvents = {
  signupStarted: (source?: string) => trackEvent('signup_started', { source }),
  signupCompleted: (method: 'email' | 'google' | 'linkedin' | 'facebook' | 'apple') =>
    trackEvent('signup_completed', { method }),
  signupFailed: (errorType: string) => trackEvent('signup_failed', { error_type: errorType }),

  loginStarted: (source?: string) => trackEvent('login_started', { source }),
  loginCompleted: (method: string, has2fa: boolean) =>
    trackEvent('login_completed', { method, has_2fa: has2fa }),
  loginFailed: (errorType: string) => trackEvent('login_failed', { error_type: errorType }),

  twoFactorChallengeShown: () => trackEvent('2fa_challenge_shown'),
  twoFactorCompleted: (method: 'totp' | 'backup') =>
    trackEvent('2fa_completed', { method }),
  twoFactorFailed: () => trackEvent('2fa_failed'),

  magicLinkRequested: () => trackEvent('magic_link_requested'),
  magicLinkClicked: () => trackEvent('magic_link_clicked'),
  magicLinkFailed: () => trackEvent('magic_link_failed'),

  passwordResetRequested: () => trackEvent('password_reset_requested'),
  passwordResetCompleted: () => trackEvent('password_reset_completed'),
  passwordResetFailed: (reason: string) => trackEvent('password_reset_failed', { reason }),

  logout: () => {
    trackEvent('logout')
    resetUser()
  },
}

// Page View Events
export const PageEvents = {
  homepageViewed: (source?: string) => trackEvent('homepage_viewed', { source }),
  blogListViewed: () => trackEvent('blog_list_viewed'),
  blogArticleViewed: (slug: string, title: string) =>
    trackEvent('blog_article_viewed', { slug, title }),

  featuresViewed: () => trackEvent('features_viewed'),
  productViewed: () => trackEvent('product_viewed'),
  pricingViewed: () => trackEvent('pricing_viewed'),

  careersViewed: () => trackEvent('careers_viewed'),
  jobViewed: (jobId: string, jobTitle: string) =>
    trackEvent('job_viewed', { job_id: jobId, job_title: jobTitle }),
  jobApplicationStarted: (jobId: string) =>
    trackEvent('job_application_started', { job_id: jobId }),
  jobApplicationSubmitted: (jobId: string) =>
    trackEvent('job_application_submitted', { job_id: jobId }),

  partnerPageViewed: () => trackEvent('partner_page_viewed'),
  betaSignupStarted: () => trackEvent('beta_signup_started'),
  betaSignupCompleted: () => trackEvent('beta_signup_completed'),

  roadmapViewed: () => trackEvent('roadmap_viewed'),
  aboutUsViewed: () => trackEvent('about_us_viewed'),
  faqViewed: () => trackEvent('faq_viewed'),

  contactFormOpened: () => trackEvent('contact_form_opened'),
  contactFormSubmitted: () => trackEvent('contact_form_submitted'),
}

// CTA Events
export const CTAEvents = {
  ctaClicked: (ctaId: string, ctaText: string, location: string) =>
    trackEvent('cta_clicked', { cta_id: ctaId, cta_text: ctaText, location }),
  
  trialStarted: () => trackEvent('trial_started'),
  demoRequested: () => trackEvent('demo_requested'),
  newsletterSubscribed: (source: string) =>
    trackEvent('newsletter_subscribed', { source }),
}

// Error Events
export const ErrorEvents = {
  pageNotFound: (url: string) => trackEvent('page_not_found', { url }),
  apiError: (endpoint: string, statusCode: number) =>
    trackEvent('api_error', { endpoint, status_code: statusCode }),
  clientError: (errorMessage: string, componentStack?: string) =>
    trackEvent('client_error', { error_message: errorMessage, component_stack: componentStack }),
}

// Feature Flags (if using PostHog feature flags)
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    return posthog.isFeatureEnabled(flagKey) || false
  }
  return false
}

export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (typeof window !== 'undefined' && posthog?.__loaded) {
    return posthog.getFeatureFlag(flagKey)
  }
  return undefined
}
