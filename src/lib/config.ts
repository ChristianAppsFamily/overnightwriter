// ============================================
// OvernightWriter — Payments & Ads Config
// Replace placeholder values before deploying
// ============================================

export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX', // Replace with your AdSense Publisher ID
  adUnitId: 'XXXXXXXXXX',                  // Replace with your AdSense Ad Unit ID
  enabled: true
}

export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with Stripe publishable key

  prices: {
    nomad: {
      monthly: 'price_nomad_monthly_XXXXXXXXXX',  // Replace with Stripe Price ID
      annual:  'price_nomad_annual_XXXXXXXXXX',   // Replace with Stripe Price ID
      amount_monthly: 4.99,
      amount_annual: 49
    },
    writer: {
      monthly: 'price_writer_monthly_XXXXXXXXXX', // Replace with Stripe Price ID
      annual:  'price_writer_annual_XXXXXXXXXX',  // Replace with Stripe Price ID
      amount_monthly: 9,
      amount_annual: 90
    },
    studio: {
      monthly: 'price_studio_monthly_XXXXXXXXXX', // Replace with Stripe Price ID
      annual:  'price_studio_annual_XXXXXXXXXX',  // Replace with Stripe Price ID
      amount_monthly: 29,
      amount_annual: 290
    }
  }
}

export type PlanId = 'free' | 'nomad' | 'writer' | 'studio'

export const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: [
    'Unlimited scripts & drafts',
    'Full screenplay editor',
    'Export PDF, Fountain, FDX, TXT',
    'Banner ads displayed'
  ],
  nomad: [
    'Everything in Free',
    'No ads',
    'Clean distraction-free writing'
  ],
  writer: [
    'Everything in Nomad',
    'No ads',
    'BYOK in-app AI writing',
    'Claude, GPT-4, Kimi, Gemini'
  ],
  studio: [
    'Everything in Writer',
    'No ads',
    'Agent API access',
    'Generate API keys',
    'OpenClaw writes while you sleep'
  ]
}

export const PLAN_NAMES: Record<PlanId, string> = {
  free: 'Free',
  nomad: 'Nomad',
  writer: 'Writer',
  studio: 'Studio'
}

export const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  nomad: 1,
  writer: 2,
  studio: 3
}

export function canAccess(userPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan]
}
