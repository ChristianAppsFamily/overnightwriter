import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { PlanId } from '../lib/config'

interface SubscriptionContextType {
  plan: PlanId
  loading: boolean
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<PlanId>('free')
  const [loading, setLoading] = useState(true)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)

  const fetchSubscription = async () => {
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      // Check if trial is still active
      const now = new Date()
      const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null
      const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null

      if (data.status === 'trialing' && trialEnd && trialEnd > now) {
        setPlan(data.plan_id as PlanId)
      } else if (data.status === 'active' && periodEnd && periodEnd > now) {
        setPlan(data.plan_id as PlanId)
      } else {
        setPlan('free')
      }

      setTrialEndsAt(data.trial_ends_at)
      setCurrentPeriodEnd(data.current_period_end)
      setStripeCustomerId(data.stripe_customer_id)
    } else {
      setPlan('free')
    }

    setLoading(false)
  }

  useEffect(() => { fetchSubscription() }, [user])

  return (
    <SubscriptionContext.Provider value={{
      plan, loading, trialEndsAt, currentPeriodEnd, stripeCustomerId,
      refetch: fetchSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
