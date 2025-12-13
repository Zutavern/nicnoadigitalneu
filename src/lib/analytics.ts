import posthog from 'posthog-js'

// ============================================
// Analytics Utility Library
// ============================================

/**
 * Track a custom event in PostHog (Client-Side)
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
// Pre-defined Event Trackers (Client-Side)
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
  twoFactorEnabled: () => trackEvent('2fa_enabled'),
  twoFactorDisabled: () => trackEvent('2fa_disabled'),

  magicLinkRequested: () => trackEvent('magic_link_requested'),
  magicLinkClicked: () => trackEvent('magic_link_clicked'),
  magicLinkFailed: () => trackEvent('magic_link_failed'),

  passwordResetRequested: () => trackEvent('password_reset_requested'),
  passwordResetCompleted: () => trackEvent('password_reset_completed'),
  passwordResetFailed: (reason: string) => trackEvent('password_reset_failed', { reason }),
  passwordChanged: () => trackEvent('password_changed'),

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
  
  // Dashboard Pages
  dashboardViewed: (role: string) => trackEvent('dashboard_viewed', { role }),
  settingsViewed: () => trackEvent('settings_viewed'),
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

// ============================================
// Business Events (Client-Side)
// ============================================

// Subscription Events
export const SubscriptionEvents = {
  pricingPlanViewed: (planId: string, planName: string) =>
    trackEvent('pricing_plan_viewed', { plan_id: planId, plan_name: planName }),
  checkoutStarted: (planId: string, planName: string, price: number) =>
    trackEvent('checkout_started', { plan_id: planId, plan_name: planName, price }),
  subscriptionCreated: (planId: string, planName: string, billingInterval: string) =>
    trackEvent('subscription_created', { plan_id: planId, plan_name: planName, billing_interval: billingInterval }),
  subscriptionUpgraded: (fromPlan: string, toPlan: string) =>
    trackEvent('subscription_upgraded', { from_plan: fromPlan, to_plan: toPlan }),
  subscriptionDowngraded: (fromPlan: string, toPlan: string) =>
    trackEvent('subscription_downgraded', { from_plan: fromPlan, to_plan: toPlan }),
  subscriptionCancelled: (planId: string, reason?: string) =>
    trackEvent('subscription_cancelled', { plan_id: planId, cancellation_reason: reason }),
  subscriptionReactivated: (planId: string) =>
    trackEvent('subscription_reactivated', { plan_id: planId }),
  paymentMethodAdded: () => trackEvent('payment_method_added'),
  paymentMethodUpdated: () => trackEvent('payment_method_updated'),
}

// Salon Events
export const SalonEvents = {
  salonCreated: (salonId: string, salonName: string) =>
    trackEvent('salon_created', { salon_id: salonId, salon_name: salonName }),
  salonUpdated: (salonId: string, fieldsUpdated: string[]) =>
    trackEvent('salon_updated', { salon_id: salonId, fields_updated: fieldsUpdated }),
  salonDeleted: (salonId: string) =>
    trackEvent('salon_deleted', { salon_id: salonId }),
  
  // Stylist Management
  stylistInvited: (salonId: string, inviteMethod: 'email' | 'link') =>
    trackEvent('stylist_invited', { salon_id: salonId, invite_method: inviteMethod }),
  stylistJoined: (salonId: string) =>
    trackEvent('stylist_joined', { salon_id: salonId }),
  stylistRemoved: (salonId: string, reason?: string) =>
    trackEvent('stylist_removed', { salon_id: salonId, reason }),
  
  // Chair/Station Management
  chairCreated: (salonId: string) =>
    trackEvent('chair_created', { salon_id: salonId }),
  chairRented: (salonId: string, rentalType: string) =>
    trackEvent('chair_rented', { salon_id: salonId, rental_type: rentalType }),
  chairVacated: (salonId: string) =>
    trackEvent('chair_vacated', { salon_id: salonId }),
}

// Booking Events
export const BookingEvents = {
  bookingStarted: (serviceId?: string) =>
    trackEvent('booking_started', { service_id: serviceId }),
  bookingSlotSelected: (date: string, time: string) =>
    trackEvent('booking_slot_selected', { date, time }),
  bookingConfirmed: (bookingId: string, serviceId: string, stylistId: string, totalAmount: number) =>
    trackEvent('booking_confirmed', { 
      booking_id: bookingId, 
      service_id: serviceId, 
      stylist_id: stylistId,
      total_amount: totalAmount 
    }),
  bookingCancelled: (bookingId: string, reason?: string, cancelledBy?: 'customer' | 'stylist' | 'salon') =>
    trackEvent('booking_cancelled', { 
      booking_id: bookingId, 
      cancellation_reason: reason,
      cancelled_by: cancelledBy 
    }),
  bookingRescheduled: (bookingId: string, oldDate: string, newDate: string) =>
    trackEvent('booking_rescheduled', { 
      booking_id: bookingId, 
      old_date: oldDate, 
      new_date: newDate 
    }),
  bookingCompleted: (bookingId: string, duration: number) =>
    trackEvent('booking_completed', { booking_id: bookingId, duration_minutes: duration }),
  bookingNoShow: (bookingId: string) =>
    trackEvent('booking_no_show', { booking_id: bookingId }),
}

// Onboarding Events
export const OnboardingEvents = {
  onboardingStarted: (role: string) =>
    trackEvent('onboarding_started', { role }),
  onboardingStepCompleted: (step: number, stepName: string) =>
    trackEvent('onboarding_step_completed', { step, step_name: stepName }),
  onboardingSkipped: (step: number) =>
    trackEvent('onboarding_skipped', { skipped_at_step: step }),
  onboardingCompleted: (role: string, completionTime?: number) =>
    trackEvent('onboarding_completed', { role, completion_time_seconds: completionTime }),
  
  profileCompleted: (completionPercent: number) =>
    trackEvent('profile_completed', { completion_percent: completionPercent }),
}

// Service Events
export const ServiceEvents = {
  serviceCreated: (serviceId: string, serviceName: string, price: number) =>
    trackEvent('service_created', { service_id: serviceId, service_name: serviceName, price }),
  serviceUpdated: (serviceId: string) =>
    trackEvent('service_updated', { service_id: serviceId }),
  serviceDeleted: (serviceId: string) =>
    trackEvent('service_deleted', { service_id: serviceId }),
  serviceViewed: (serviceId: string, serviceName: string) =>
    trackEvent('service_viewed', { service_id: serviceId, service_name: serviceName }),
}

// Review Events
export const ReviewEvents = {
  reviewStarted: (targetType: 'salon' | 'stylist', targetId: string) =>
    trackEvent('review_started', { target_type: targetType, target_id: targetId }),
  reviewSubmitted: (targetType: 'salon' | 'stylist', targetId: string, rating: number) =>
    trackEvent('review_submitted', { target_type: targetType, target_id: targetId, rating }),
}

// Messaging Events
export const MessagingEvents = {
  conversationStarted: (participantCount: number) =>
    trackEvent('conversation_started', { participant_count: participantCount }),
  messageSent: (messageType: 'text' | 'image' | 'file') =>
    trackEvent('message_sent', { message_type: messageType }),
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

// ============================================
// Revenue Tracking (for PostHog Revenue Attribution)
// ============================================

export const RevenueEvents = {
  // Track when a purchase is completed (for PostHog's revenue attribution)
  purchaseCompleted: (
    amount: number,
    currency: string,
    productType: string,
    properties?: Record<string, unknown>
  ) =>
    trackEvent('purchase_completed', {
      $set: {
        total_revenue: amount,
      },
      revenue: amount,
      currency,
      product_type: productType,
      ...properties,
    }),

  // Track recurring revenue
  recurringRevenueStarted: (mrr: number, planName: string) =>
    trackEvent('recurring_revenue_started', {
      mrr,
      plan_name: planName,
      $set: { current_mrr: mrr },
    }),

  // Track revenue churn
  revenueChurned: (lostMrr: number, reason?: string) =>
    trackEvent('revenue_churned', {
      lost_mrr: lostMrr,
      churn_reason: reason,
    }),
}


