import Stripe from 'stripe'

// Check if Stripe is configured
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY

// Stripe Server-Side Client (only initialize if key exists)
export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null

// Helper to ensure stripe is available
export function getStripe() {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.')
  }
  return stripe
}

