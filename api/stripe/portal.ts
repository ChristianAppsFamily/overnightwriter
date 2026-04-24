// api/stripe/portal.ts
// Opens Stripe billing portal for subscription management

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, returnUrl } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!sub?.stripe_customer_id) return res.status(404).json({ error: 'No billing account found' })

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: returnUrl
  })

  return res.status(200).json({ url: session.url })
}
