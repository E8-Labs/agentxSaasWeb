import { loadStripe } from '@stripe/stripe-js'

/**
 * Stripe Singleton
 *
 * This module ensures loadStripe() is called only once per application lifecycle.
 * Multiple calls to loadStripe() with the same key cause warnings and can lead
 * to issues with Stripe Elements.
 *
 * Usage:
 *   import { getStripe } from '@/lib/stripe'
 *   const stripePromise = getStripe()
 *   <Elements stripe={stripePromise}>...</Elements>
 */

const stripePublicKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY

let stripePromise = null

/**
 * Returns a singleton Promise that resolves to a Stripe instance.
 * Safe to call multiple times - will always return the same promise.
 */
export function getStripe() {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey)
  }
  return stripePromise
}

/**
 * The public key used for Stripe initialization.
 * Exported for cases where components need to check if Stripe is configured.
 */
export { stripePublicKey }
