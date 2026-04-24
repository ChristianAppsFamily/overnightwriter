import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { DraftBlock } from '../../types'
import { canAccess } from '../../lib/config'

const PROVIDERS = [
  { id: 'claude',  name: 'Claude',  short: 'C' },
  { id: 'openai',  name: 'GPT-4',   short: 'G' },
  { id: 'kimi',    name: 'Kimi',    short: 'K' },
  { id: 'gemini',  name: 'Gemini',  short: 'Ge' },
]

interface Props {
  bottomOffset?: number
  isOpen: boolean
  onClose: () => void
  currentBlocks: DraftBlock[]
  onBlocksGenerated: (blocks: DraftBlock[]) => void
  onOpenPricing: () => void
}

export default function AIGenerateBar({
  isOpen,
  onClose,
  currentBlocks,
  onBlocksGenerated,
  onOpenPricing,
  bottomOffset = 0
}: Props) {
  
  const { user } = useAuth()
  const { plan } = useSubscription()
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState('claude')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const hasAccess = canAccess(plan, 'writer')

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setError('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return
    if (!hasAccess) { onOpenPricing(); return }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          provider,
          prompt: prompt.trim(),
          currentBlocks
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Generation failed. Check your API key in Settings.')
        setLoading(false)
        return
      }

      onBlocksGenerated(data.blocks)
      setPrompt('')
      onClose()

    } catch (err) {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: `${bottomOffset || 0}px`, // above ad banner if free
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '0.5px solid #e8e8e8',
      padding: '14px 24px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>

      {/* No access state */}
      {!hasAccess ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            color: '#999',
            letterSpacing: '0.06em'
          }}>
            AI writing requires the Writer plan
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onOpenPricing}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                padding: '8px 20px',
                background: '#111',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Upgrade to Writer
            </button>
            <button
              onClick={onClose}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                padding: '8px 14px',
                background: 'transparent',
                color: '#bbb',
                border: '0.5px solid #e8e8e8',
                cursor: 'pointer'
              }}
            >
              esc
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main input row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Model selector */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  title={p.name}
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '9px',
                    letterSpacing: '0.08em',
                    padding: '4px 8px',
                    background: provider === p.id ? '#111' : 'transparent',
                    color: provider === p.id ? '#fff' : '#bbb',
                    border: `0.5px solid ${provider === p.id ? '#111' : '#e8e8e8'}`,
                    cursor: 'pointer'
                  }}
                >
                  {p.short}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: '0.5px', height: '20px', background: '#e8e8e8', flexShrink: 0 }} />

            {/* Prompt input */}
            <input
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
              placeholder="Write the next scene where... / Continue the dialogue... / Add a transition to..."
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '12px',
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: '#111',
                letterSpacing: '0.02em'
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={onClose}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  padding: '6px 10px',
                  background: 'transparent',
                  color: '#ccc',
                  border: '0.5px solid #e8e8e8',
                  cursor: 'pointer'
                }}
              >
                esc
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  padding: '6px 16px',
                  background: loading || !prompt.trim() ? '#e8e8e8' : '#111',
                  color: loading || !prompt.trim() ? '#bbb' : '#fff',
                  border: 'none',
                  cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                  minWidth: '64px'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#bbb',
                      animation: 'pulse 1s infinite'
                    }} />
                    Writing
                  </span>
                ) : 'Generate ↵'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: '#dc2626',
              letterSpacing: '0.04em',
              paddingLeft: '2px'
            }}>
              {error}
            </div>
          )}

          {/* Hint */}
          {!error && (
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '9px',
              color: '#ccc',
              letterSpacing: '0.06em',
              paddingLeft: '2px'
            }}>
              {PROVIDERS.find(p => p.id === provider)?.name} · Enter to generate · Esc to close · Written content appears in blue
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
