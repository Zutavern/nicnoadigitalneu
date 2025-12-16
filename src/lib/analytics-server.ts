import { prisma } from './prisma'

// ============================================
// Server-Side Analytics for PostHog + Local DB
// ============================================

interface PostHogEvent {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

interface PostHogConfig {
  apiKey: string
  host: string
  enabled: boolean
}

interface TrackOptions {
  /** Store event in local database (default: true) */
  persistToDb?: boolean
  /** Send event to PostHog (default: true) */
  sendToPostHog?: boolean
}

/**
 * Get PostHog configuration from database
 */
async function getPostHogConfig(): Promise<PostHogConfig | null> {
  try {
    const settings = await prisma.platformSettings.findFirst()
    
    if (!settings?.posthogEnabled || !settings?.posthogPersonalApiKey) {
      return null
    }

    return {
      apiKey: settings.posthogPersonalApiKey,
      host: settings.posthogHost || 'https://eu.i.posthog.com',
      enabled: settings.posthogEnabled,
    }
  } catch (error) {
    console.error('[Analytics Server] Failed to get PostHog config:', error)
    return null
  }
}

/**
 * Store event in local AnalyticsEvent database
 */
async function storeEventInDb(
  eventName: string,
  userId: string | null,
  properties?: Record<string, unknown>
): Promise<boolean> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: eventName,
        userId: userId && userId !== 'system' && userId !== 'anonymous' ? userId : null,
        metadata: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
      },
    })
    return true
  } catch (error) {
    console.error('[Analytics Server] Failed to store event in DB:', error)
    return false
  }
}

/**
 * Send event to PostHog via Capture API
 */
async function sendToPostHog(
  eventName: string,
  userId: string,
  properties?: Record<string, unknown>
): Promise<boolean> {
  try {
    const config = await getPostHogConfig()
    
    if (!config) {
      // PostHog not configured, skip silently
      return false
    }

    const event: PostHogEvent = {
      event: eventName,
      distinctId: userId,
      properties: {
        ...properties,
        $lib: 'nicnoa-server',
        $lib_version: '1.0.0',
        source: 'server',
      },
      timestamp: new Date(),
    }

    const response = await fetch(`${config.host}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        ...event,
      }),
    })

    if (!response.ok) {
      console.error('[Analytics Server] Failed to send event:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('[Analytics Server] Error sending event:', error)
    return false
  }
}

/**
 * Track a server-side event
 * Sends to both PostHog AND stores in local database by default
 * 
 * @param eventName - Name of the event
 * @param userId - User ID (use 'system' for system events, 'anonymous' for anonymous)
 * @param properties - Optional event properties
 * @param options - Control where the event is sent
 */
export async function trackServerEvent(
  eventName: string,
  userId: string,
  properties?: Record<string, unknown>,
  options: TrackOptions = {}
): Promise<{ db: boolean; posthog: boolean }> {
  const { persistToDb = true, sendToPostHog: shouldSendToPostHog = true } = options
  
  const results = { db: false, posthog: false }
  
  // Store in local DB
  if (persistToDb) {
    results.db = await storeEventInDb(eventName, userId, properties)
  }
  
  // Send to PostHog
  if (shouldSendToPostHog) {
    results.posthog = await sendToPostHog(eventName, userId, properties)
  }
  
  return results
}

/**
 * Batch send multiple events
 */
export async function trackServerEventsBatch(
  events: Array<{ event: string; userId: string; properties?: Record<string, unknown> }>,
  options: TrackOptions = {}
): Promise<{ db: boolean; posthog: boolean }> {
  const { persistToDb = true, sendToPostHog: shouldSendToPostHog = true } = options
  const results = { db: false, posthog: false }

  // Store all in DB
  if (persistToDb) {
    try {
      await prisma.analyticsEvent.createMany({
        data: events.map((e) => ({
          eventType: e.event,
          userId: e.userId && e.userId !== 'system' && e.userId !== 'anonymous' ? e.userId : null,
          metadata: {
            ...e.properties,
            timestamp: new Date().toISOString(),
          },
        })),
      })
      results.db = true
    } catch (error) {
      console.error('[Analytics Server] Failed to batch store events in DB:', error)
    }
  }

  // Send batch to PostHog
  if (shouldSendToPostHog) {
    try {
      const config = await getPostHogConfig()
      
      if (config) {
        const batchEvents = events.map((e) => ({
          event: e.event,
          distinct_id: e.userId,
          properties: {
            ...e.properties,
            $lib: 'nicnoa-server',
            $lib_version: '1.0.0',
            source: 'server',
          },
          timestamp: new Date().toISOString(),
        }))

        const response = await fetch(`${config.host}/batch/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: config.apiKey,
            batch: batchEvents,
          }),
        })

        if (response.ok) {
          results.posthog = true
        } else {
          console.error('[Analytics Server] Failed to send batch events:', response.statusText)
        }
      }
    } catch (error) {
      console.error('[Analytics Server] Error sending batch events:', error)
    }
  }

  return results
}

/**
 * Identify/update user properties in PostHog from server
 */
export async function identifyServerUser(
  userId: string,
  properties: Record<string, unknown>
): Promise<boolean> {
  try {
    const config = await getPostHogConfig()
    
    if (!config) {
      return false
    }

    const response = await fetch(`${config.host}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        event: '$identify',
        distinct_id: userId,
        properties: {
          $set: properties,
        },
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error('[Analytics Server] Failed to identify user:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('[Analytics Server] Error identifying user:', error)
    return false
  }
}

// ============================================
// Pre-defined Server-Side Event Trackers
// ============================================

/**
 * Subscription/Payment Events (from Stripe Webhooks)
 */
export const ServerSubscriptionEvents = {
  subscriptionCreated: async (
    userId: string,
    planId: string,
    planName: string,
    amount: number,
    interval: 'month' | 'year'
  ) => {
    await trackServerEvent('subscription_created', userId, {
      plan_id: planId,
      plan_name: planName,
      amount,
      billing_interval: interval,
      mrr: interval === 'year' ? amount / 12 : amount,
    })
    // Update user properties
    await identifyServerUser(userId, {
      subscription_plan: planName,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      is_paying_customer: true,
    })
  },

  subscriptionUpgraded: async (
    userId: string,
    fromPlan: string,
    toPlan: string,
    newAmount: number
  ) => {
    await trackServerEvent('subscription_upgraded', userId, {
      from_plan: fromPlan,
      to_plan: toPlan,
      new_amount: newAmount,
    })
    await identifyServerUser(userId, {
      subscription_plan: toPlan,
    })
  },

  subscriptionDowngraded: async (
    userId: string,
    fromPlan: string,
    toPlan: string,
    newAmount: number
  ) => {
    await trackServerEvent('subscription_downgraded', userId, {
      from_plan: fromPlan,
      to_plan: toPlan,
      new_amount: newAmount,
    })
    await identifyServerUser(userId, {
      subscription_plan: toPlan,
    })
  },

  subscriptionCancelled: async (
    userId: string,
    planId: string,
    reason?: string
  ) => {
    await trackServerEvent('subscription_cancelled', userId, {
      plan_id: planId,
      cancellation_reason: reason,
    })
    await identifyServerUser(userId, {
      subscription_status: 'cancelled',
      churn_date: new Date().toISOString(),
    })
  },

  subscriptionRenewed: async (
    userId: string,
    planId: string,
    amount: number
  ) => {
    await trackServerEvent('subscription_renewed', userId, {
      plan_id: planId,
      amount,
    })
  },

  paymentSucceeded: async (
    userId: string,
    amount: number,
    currency: string,
    invoiceId?: string
  ) => {
    await trackServerEvent('payment_succeeded', userId, {
      amount,
      currency,
      invoice_id: invoiceId,
      revenue: amount / 100, // Convert from cents
    })
  },

  paymentFailed: async (
    userId: string,
    amount: number,
    failureReason: string,
    invoiceId?: string
  ) => {
    await trackServerEvent('payment_failed', userId, {
      amount,
      failure_reason: failureReason,
      invoice_id: invoiceId,
    })
  },

  trialStarted: async (
    userId: string,
    planId: string,
    trialDays: number
  ) => {
    await trackServerEvent('trial_started', userId, {
      plan_id: planId,
      trial_days: trialDays,
      trial_end_date: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
    })
    await identifyServerUser(userId, {
      subscription_status: 'trialing',
      trial_started_at: new Date().toISOString(),
    })
  },

  trialExpired: async (userId: string, converted: boolean) => {
    await trackServerEvent('trial_expired', userId, {
      converted_to_paid: converted,
    })
    if (!converted) {
      await identifyServerUser(userId, {
        subscription_status: 'expired',
        trial_expired_at: new Date().toISOString(),
      })
    }
  },

  trialConverted: async (userId: string, planId: string) => {
    await trackServerEvent('trial_converted', userId, {
      plan_id: planId,
    })
  },
}

/**
 * User Lifecycle Events
 */
export const ServerUserEvents = {
  userCreated: async (
    userId: string,
    email: string,
    role: string,
    signupMethod: string
  ) => {
    await trackServerEvent('user_created', userId, {
      email,
      role,
      signup_method: signupMethod,
    })
    await identifyServerUser(userId, {
      email,
      role,
      signup_date: new Date().toISOString(),
      signup_method: signupMethod,
    })
  },

  userDeleted: async (userId: string, reason?: string) => {
    await trackServerEvent('user_deleted', userId, {
      deletion_reason: reason,
    })
  },

  userBlocked: async (
    userId: string,
    blockedBy: string,
    reason?: string
  ) => {
    await trackServerEvent('user_blocked', userId, {
      blocked_by: blockedBy,
      block_reason: reason,
    })
  },

  userUnblocked: async (userId: string, unblockedBy: string) => {
    await trackServerEvent('user_unblocked', userId, {
      unblocked_by: unblockedBy,
    })
  },

  emailVerified: async (userId: string) => {
    await trackServerEvent('email_verified', userId, {})
    await identifyServerUser(userId, {
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
  },
}

/**
 * Business Events (Server-Side)
 */
export const ServerBusinessEvents = {
  salonCreated: async (
    userId: string,
    salonId: string,
    salonName: string
  ) => {
    await trackServerEvent('salon_created', userId, {
      salon_id: salonId,
      salon_name: salonName,
    })
    await identifyServerUser(userId, {
      has_salon: true,
      salon_count: 1, // Should be incremented in real implementation
    })
  },

  bookingCreated: async (
    userId: string,
    bookingId: string,
    salonId: string,
    stylistId: string,
    serviceId: string,
    amount: number
  ) => {
    await trackServerEvent('booking_created', userId, {
      booking_id: bookingId,
      salon_id: salonId,
      stylist_id: stylistId,
      service_id: serviceId,
      amount,
    })
  },

  bookingCompleted: async (
    userId: string,
    bookingId: string,
    revenue: number
  ) => {
    await trackServerEvent('booking_completed', userId, {
      booking_id: bookingId,
      revenue,
    })
  },

  reviewReceived: async (
    targetUserId: string,
    reviewerId: string,
    rating: number,
    targetType: 'salon' | 'stylist'
  ) => {
    await trackServerEvent('review_received', targetUserId, {
      reviewer_id: reviewerId,
      rating,
      target_type: targetType,
    })
  },
}

/**
 * Video Call Events
 */
export const ServerVideoCallEvents = {
  callInitiated: async (
    callerId: string,
    calleeId: string,
    callId: string
  ) => {
    await trackServerEvent('video_call_initiated', callerId, {
      call_id: callId,
      caller_id: callerId,
      callee_id: calleeId,
    })
  },

  callAnswered: async (
    callerId: string,
    calleeId: string,
    callId: string
  ) => {
    await trackServerEvent('video_call_answered', calleeId, {
      call_id: callId,
      caller_id: callerId,
      callee_id: calleeId,
    })
  },

  callEnded: async (
    callerId: string,
    calleeId: string,
    callId: string,
    duration: number
  ) => {
    await trackServerEvent('video_call_ended', callerId, {
      call_id: callId,
      caller_id: callerId,
      callee_id: calleeId,
      duration_seconds: duration,
      duration_formatted: formatDuration(duration),
    })
  },

  callMissed: async (
    callerId: string,
    calleeId: string,
    callId: string,
    reason: 'no_answer' | 'rejected' | 'cancelled'
  ) => {
    await trackServerEvent('video_call_missed', callerId, {
      call_id: callId,
      caller_id: callerId,
      callee_id: calleeId,
      reason,
    })
  },

  callRejected: async (
    callerId: string,
    calleeId: string,
    callId: string
  ) => {
    await trackServerEvent('video_call_rejected', calleeId, {
      call_id: callId,
      caller_id: callerId,
      callee_id: calleeId,
    })
  },
}

/**
 * System Events (Cron Jobs, etc.)
 */
export const ServerSystemEvents = {
  cronJobCompleted: async (
    jobName: string,
    duration: number,
    affectedRecords: number
  ) => {
    await trackServerEvent('cron_job_completed', 'system', {
      job_name: jobName,
      duration_ms: duration,
      affected_records: affectedRecords,
    })
  },

  emailSent: async (
    userId: string,
    emailType: string,
    success: boolean
  ) => {
    await trackServerEvent('email_sent', userId, {
      email_type: emailType,
      success,
    })
  },

  notificationSent: async (
    userId: string,
    notificationType: string,
    channel: 'in_app' | 'email' | 'push'
  ) => {
    await trackServerEvent('notification_sent', userId, {
      notification_type: notificationType,
      channel,
    })
  },

  subscriptionWarning: async (
    userId: string,
    warningType: 'expiring' | 'payment_failed' | 'trial_ending',
    daysRemaining?: number
  ) => {
    await trackServerEvent('subscription_warning_sent', userId, {
      warning_type: warningType,
      days_remaining: daysRemaining,
    })
  },
}

/**
 * Referral Events
 */
export const ServerReferralEvents = {
  referralCreated: async (
    referrerId: string,
    referralCode: string
  ) => {
    await trackServerEvent('referral_link_created', referrerId, {
      referral_code: referralCode,
    })
  },

  referralClicked: async (
    referralCode: string,
    referrerId: string
  ) => {
    await trackServerEvent('referral_link_clicked', referrerId, {
      referral_code: referralCode,
    })
  },

  referralConverted: async (
    referrerId: string,
    newUserId: string,
    referralCode: string
  ) => {
    await trackServerEvent('referral_converted', referrerId, {
      referral_code: referralCode,
      new_user_id: newUserId,
    })
    await identifyServerUser(referrerId, {
      referral_count: 1, // Should be incremented
    })
  },

  referralRewarded: async (
    referrerId: string,
    rewardType: string,
    rewardValue: number
  ) => {
    await trackServerEvent('referral_reward_given', referrerId, {
      reward_type: rewardType,
      reward_value: rewardValue,
    })
  },
}

/**
 * Onboarding Events
 */
export const ServerOnboardingEvents = {
  onboardingStarted: async (
    userId: string,
    userType: 'stylist' | 'salon_owner'
  ) => {
    await trackServerEvent('onboarding_started', userId, {
      user_type: userType,
    })
  },

  onboardingStepCompleted: async (
    userId: string,
    step: string,
    stepNumber: number
  ) => {
    await trackServerEvent('onboarding_step_completed', userId, {
      step,
      step_number: stepNumber,
    })
  },

  onboardingSubmitted: async (
    userId: string,
    userType: 'stylist' | 'salon_owner'
  ) => {
    await trackServerEvent('onboarding_submitted', userId, {
      user_type: userType,
    })
  },

  onboardingApproved: async (
    userId: string,
    approvedBy: string
  ) => {
    await trackServerEvent('onboarding_approved', userId, {
      approved_by: approvedBy,
    })
    await identifyServerUser(userId, {
      onboarding_status: 'approved',
      onboarding_approved_at: new Date().toISOString(),
    })
  },

  onboardingRejected: async (
    userId: string,
    rejectedBy: string,
    reason?: string
  ) => {
    await trackServerEvent('onboarding_rejected', userId, {
      rejected_by: rejectedBy,
      rejection_reason: reason,
    })
  },
}

// ============================================
// AI / Credits / Metered Billing Events
// ============================================

/**
 * AI Usage and Credits Events
 */
export const ServerAIEvents = {
  /** Logs when AI is used (text generation, image creation, etc.) */
  aiUsageLogged: async (
    userId: string,
    modelKey: string,
    feature: string,
    costUsd: number,
    priceUsd: number,
    tokens?: { input: number; output: number }
  ) => {
    await trackServerEvent('ai_usage_logged', userId, {
      model_key: modelKey,
      feature,
      cost_usd: costUsd,
      price_usd: priceUsd,
      margin_usd: priceUsd - costUsd,
      input_tokens: tokens?.input,
      output_tokens: tokens?.output,
    })
  },

  /** When user purchases a credit package */
  creditsPurchased: async (
    userId: string,
    packageId: string,
    packageName: string,
    credits: number,
    bonusCredits: number,
    amountPaid: number,
    currency: string
  ) => {
    await trackServerEvent('credits_purchased', userId, {
      package_id: packageId,
      package_name: packageName,
      credits,
      bonus_credits: bonusCredits,
      total_credits: credits + bonusCredits,
      amount_paid: amountPaid,
      currency,
    })
    await identifyServerUser(userId, {
      has_purchased_credits: true,
      last_credit_purchase: new Date().toISOString(),
    })
  },

  /** When credits are consumed */
  creditsUsed: async (
    userId: string,
    amount: number,
    feature: string,
    balanceAfter: number
  ) => {
    await trackServerEvent('credits_used', userId, {
      amount,
      feature,
      balance_after: balanceAfter,
    })
  },

  /** When user hits their spending limit */
  spendingLimitReached: async (
    userId: string,
    limitAmount: number,
    currentSpent: number
  ) => {
    await trackServerEvent('spending_limit_reached', userId, {
      limit_amount: limitAmount,
      current_spent: currentSpent,
      overage: currentSpent - limitAmount,
    })
  },

  /** When included AI credits from subscription are depleted */
  includedCreditsDepleted: async (
    userId: string,
    planName: string,
    includedAmount: number
  ) => {
    await trackServerEvent('included_credits_depleted', userId, {
      plan_name: planName,
      included_amount: includedAmount,
    })
  },

  /** When user updates their spending limit */
  spendingLimitUpdated: async (
    userId: string,
    oldLimit: number,
    newLimit: number
  ) => {
    await trackServerEvent('spending_limit_updated', userId, {
      old_limit: oldLimit,
      new_limit: newLimit,
    })
  },

  /** When metered usage is reported to Stripe */
  meteredUsageReported: async (
    userId: string,
    amountUsd: number,
    periodStart: Date,
    periodEnd: Date
  ) => {
    await trackServerEvent('metered_usage_reported', userId, {
      amount_usd: amountUsd,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    })
  },
}

// ============================================
// Pricing / Checkout Events
// ============================================

/**
 * Pricing Page and Checkout Events
 */
export const ServerPricingEvents = {
  /** When user views the pricing page */
  pricingPageVisited: async (
    userId: string,
    role: 'stylist' | 'salon_owner' | 'unknown',
    selectedInterval?: string
  ) => {
    await trackServerEvent('pricing_page_visited', userId, {
      role,
      selected_interval: selectedInterval,
    })
  },

  /** When user views a specific plan */
  planViewed: async (
    userId: string,
    planId: string,
    planName: string,
    price: number,
    interval: string
  ) => {
    await trackServerEvent('plan_viewed', userId, {
      plan_id: planId,
      plan_name: planName,
      price,
      interval,
    })
  },

  /** When user starts checkout process */
  checkoutStarted: async (
    userId: string,
    planId: string,
    planName: string,
    price: number,
    interval: string,
    couponCode?: string
  ) => {
    await trackServerEvent('checkout_started', userId, {
      plan_id: planId,
      plan_name: planName,
      price,
      interval,
      coupon_code: couponCode,
      has_coupon: !!couponCode,
    })
  },

  /** When checkout is completed successfully */
  checkoutCompleted: async (
    userId: string,
    planId: string,
    planName: string,
    amount: number,
    interval: string,
    couponCode?: string,
    discountAmount?: number
  ) => {
    await trackServerEvent('checkout_completed', userId, {
      plan_id: planId,
      plan_name: planName,
      amount,
      interval,
      coupon_code: couponCode,
      discount_amount: discountAmount,
      revenue: amount / 100,
    })
    await identifyServerUser(userId, {
      subscription_plan: planName,
      subscription_interval: interval,
      is_paying_customer: true,
      first_payment_date: new Date().toISOString(),
    })
  },

  /** When user abandons checkout */
  checkoutAbandoned: async (
    userId: string,
    planId: string,
    planName: string,
    stage: 'plan_selection' | 'payment_form' | 'stripe_redirect' | 'unknown',
    reason?: string
  ) => {
    await trackServerEvent('checkout_abandoned', userId, {
      plan_id: planId,
      plan_name: planName,
      stage,
      reason,
    })
  },

  /** When paywall is shown to user */
  paywallShown: async (
    userId: string,
    trigger: string,
    feature?: string
  ) => {
    await trackServerEvent('paywall_shown', userId, {
      trigger,
      feature,
    })
  },

  /** When user clicks CTA on paywall */
  paywallCtaClicked: async (
    userId: string,
    planId: string,
    planName: string
  ) => {
    await trackServerEvent('paywall_cta_clicked', userId, {
      plan_id: planId,
      plan_name: planName,
    })
  },
}

// ============================================
// Admin Events
// ============================================

/**
 * Admin Dashboard Events
 */
export const ServerAdminEvents = {
  /** When admin creates a new subscription plan */
  planCreated: async (
    adminId: string,
    planId: string,
    planName: string,
    targetRole: 'stylist' | 'salon_owner',
    priceMonthly?: number
  ) => {
    await trackServerEvent('admin_plan_created', adminId, {
      plan_id: planId,
      plan_name: planName,
      target_role: targetRole,
      price_monthly: priceMonthly,
    })
  },

  /** When admin updates a subscription plan */
  planUpdated: async (
    adminId: string,
    planId: string,
    planName: string,
    changes: Record<string, unknown>
  ) => {
    await trackServerEvent('admin_plan_updated', adminId, {
      plan_id: planId,
      plan_name: planName,
      changes,
    })
  },

  /** When admin deletes/archives a subscription plan */
  planDeleted: async (
    adminId: string,
    planId: string,
    planName: string
  ) => {
    await trackServerEvent('admin_plan_deleted', adminId, {
      plan_id: planId,
      plan_name: planName,
    })
  },

  /** When admin creates a coupon */
  couponCreated: async (
    adminId: string,
    couponId: string,
    couponCode: string,
    discountType: 'percent' | 'fixed',
    discountValue: number,
    maxRedemptions?: number
  ) => {
    await trackServerEvent('admin_coupon_created', adminId, {
      coupon_id: couponId,
      coupon_code: couponCode,
      discount_type: discountType,
      discount_value: discountValue,
      max_redemptions: maxRedemptions,
    })
  },

  /** When a coupon is redeemed by a user */
  couponRedeemed: async (
    userId: string,
    couponCode: string,
    discountAmount: number,
    planId: string
  ) => {
    await trackServerEvent('coupon_redeemed', userId, {
      coupon_code: couponCode,
      discount_amount: discountAmount,
      plan_id: planId,
    })
  },

  /** When admin updates billing settings */
  billingSettingsUpdated: async (
    adminId: string,
    changes: Record<string, unknown>
  ) => {
    await trackServerEvent('admin_billing_settings_updated', adminId, {
      changes,
    })
  },

  /** When admin syncs plans with Stripe */
  stripeSyncCompleted: async (
    adminId: string,
    plansCreated: number,
    plansUpdated: number,
    errors: number
  ) => {
    await trackServerEvent('admin_stripe_sync_completed', adminId, {
      plans_created: plansCreated,
      plans_updated: plansUpdated,
      errors,
      success: errors === 0,
    })
  },

  /** When admin manages AI model settings */
  aiModelUpdated: async (
    adminId: string,
    modelId: string,
    modelKey: string,
    changes: Record<string, unknown>
  ) => {
    await trackServerEvent('admin_ai_model_updated', adminId, {
      model_id: modelId,
      model_key: modelKey,
      changes,
    })
  },

  /** When admin creates a referral campaign */
  referralCampaignCreated: async (
    adminId: string,
    campaignId: string,
    campaignName: string,
    referrerReward: number,
    friendReward: number
  ) => {
    await trackServerEvent('admin_referral_campaign_created', adminId, {
      campaign_id: campaignId,
      campaign_name: campaignName,
      referrer_reward_months: referrerReward,
      friend_reward_months: friendReward,
    })
  },
}

// Helper function
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
