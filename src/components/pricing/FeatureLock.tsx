import { useState, ReactNode } from 'react'
import { PlanId, canAccess } from '../../lib/config'
import { useSubscription } from '../../hooks/useSubscription'
import PricingModal from '../pricing/PricingModal'

interface Props {
  requiredPlan: PlanId
  children: ReactNode
  // If true, renders children but shows lock overlay on top
  // If false, renders a locked placeholder instead
  overlay?: boolean
}

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="0.8" fill="none"/>
    <circle cx="6" cy="8" r="0.8" fill="currentColor"/>
  </svg>
)

export default function FeatureLock({ requiredPlan, children, overlay = false }: Props) {
  const { plan } = useSubscription()
  const [modalOpen, setModalOpen] = useState(false)

  const hasAccess = canAccess(plan, requiredPlan)

  if (hasAccess) return <>{children}</>

  if (overlay) {
    return (
      <>
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
            {children}
          </div>
          <div
            onClick={() => setModalOpen(true)}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '6px'
            }}
          >
            <span style={{ color: '#999' }}><LockIcon /></span>
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: '#999'
            }}>
              Upgrade to unlock
            </span>
          </div>
        </div>
        <PricingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} highlightPlan={requiredPlan} />
      </>
    )
  }

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          opacity: 0.5
        }}
      >
        {children}
        <span style={{ color: '#bbb', display: 'flex', alignItems: 'center' }}><LockIcon /></span>
      </div>
      <PricingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} highlightPlan={requiredPlan} />
    </>
  )
}
