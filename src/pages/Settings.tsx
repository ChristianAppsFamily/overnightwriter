import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { canAccess } from '../lib/config'
import { PROVIDER_INFO } from '../lib/providerInfo'
import PricingModal from '../components/pricing/PricingModal'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plan, trialEndsAt, currentPeriodEnd } = useSubscription()
  const [modelKeys, setModelKeys] = useState<Record<string, string>>({})
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({})
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [expandedInstructions, setExpandedInstructions] = useState<string | null>(null)
  const [autosave, setAutosave] = useState(true)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const hasWriterAccess = canAccess(plan, 'writer')
  const hasStudioAccess = canAccess(plan, 'studio')

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAutosave(data.autosave ?? true)
          const masked: Record<string, boolean> = {}
          PROVIDER_INFO.forEach(p => { if (data[`${p.id}_key_set`]) masked[p.id] = true })
          setSavedKeys(masked)
        }
      })
  }, [user])

  const saveModelKey = async (providerId: string) => {
    if (!user || !modelKeys[providerId]) return
    setSaving(providerId)
    const res = await fetch('/api/settings/model-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, provider: providerId, key: modelKeys[providerId] })
    })
    if (res.ok) {
      await supabase.from('user_preferences').upsert(
        { user_id: user.id, [`${providerId}_key_set`]: true }, { onConflict: 'user_id' }
      )
      setSavedKeys(prev => ({ ...prev, [providerId]: true }))
      setModelKeys(prev => ({ ...prev, [providerId]: '' }))
      setSaveMsg(`${providerId} key saved`)
      setTimeout(() => setSaveMsg(null), 2000)
    }
    setSaving(null)
  }

  const removeModelKey = async (providerId: string) => {
    if (!user) return
    await fetch('/api/settings/model-key', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, provider: providerId })
    })
    await supabase.from('user_preferences').upsert(
      { user_id: user.id, [`${providerId}_key_set`]: false }, { onConflict: 'user_id' }
    )
    setSavedKeys(prev => ({ ...prev, [providerId]: false }))
  }

  const saveAutosave = async (value: boolean) => {
    if (!user) return
    setAutosave(value)
    await supabase.from('user_preferences').upsert({ user_id: user.id, autosave: value }, { onConflict: 'user_id' })
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.15em',
    color: '#aaa', textTransform: 'uppercase', display: 'block', marginBottom: '16px'
  }
  const sectionStyle: React.CSSProperties = {
    borderBottom: '0.5px solid #f0f0f0', paddingBottom: '36px', marginBottom: '36px'
  }
  const lockRowStyle: React.CSSProperties = {
    border: '0.5px solid #e8e8e8', padding: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
  }

  const LockBadge = ({ tier }: { tier: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="0.8"/>
        <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      </svg>
      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.08em' }}>{tier}</span>
    </div>
  )

  const InstructionSteps = ({ title, steps }: { title: string; steps: string[] }) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
        {title}
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#888', letterSpacing: '0.03em', lineHeight: 1.8, paddingLeft: '14px', position: 'relative', marginBottom: '2px' }}>
          <span style={{ position: 'absolute', left: 0, color: '#ccc' }}>{i + 1}.</span>
          {step}
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 28px', borderBottom: '0.5px solid #e8e8e8', gap: '16px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#bbb', letterSpacing: '0.08em' }}>← back</button>
        <span style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px', letterSpacing: '0.06em' }}>Settings</span>
        {saveMsg && <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#22c55e', letterSpacing: '0.06em', marginLeft: 'auto' }}>● {saveMsg}</span>}
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 28px' }}>

        {/* Plan status */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Plan</label>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: '"EB Garamond", serif', fontSize: '22px', color: '#111', marginBottom: '4px', textTransform: 'capitalize' }}>{plan} Plan</div>
              {trialEndsAt && plan !== 'free' && <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#f59e0b', letterSpacing: '0.06em' }}>Trial ends {new Date(trialEndsAt).toLocaleDateString()}</div>}
              {currentPeriodEnd && plan !== 'free' && !trialEndsAt && <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#bbb', letterSpacing: '0.06em' }}>Renews {new Date(currentPeriodEnd).toLocaleDateString()}</div>}
              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Editor', has: true },
                  { label: 'No Ads', has: canAccess(plan, 'nomad') },
                  { label: 'In-App AI', has: hasWriterAccess },
                  { label: 'Agent API', has: hasStudioAccess },
                ].map(f => (
                  <span key={f.label} style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.08em', padding: '3px 8px', background: f.has ? '#f0f0f0' : 'transparent', color: f.has ? '#666' : '#ddd', border: '0.5px solid', borderColor: f.has ? '#e0e0e0' : '#f0f0f0' }}>
                    {f.has ? '✓' : '·'} {f.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
              {plan !== 'studio' && (
                <button onClick={() => setPricingOpen(true)} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', padding: '9px 20px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>Upgrade</button>
              )}
              {plan !== 'free' && (
                <button onClick={async () => {
                  const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id, returnUrl: window.location.href }) })
                  const { url } = await res.json()
                  if (url) window.location.href = url
                }} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', padding: '9px 20px', background: 'transparent', color: '#888', border: '0.5px solid #ddd', cursor: 'pointer' }}>Manage Billing</button>
              )}
            </div>
          </div>
        </div>

        {/* Autosave */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Editor</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#111', marginBottom: '3px' }}>Autosave</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#bbb', letterSpacing: '0.04em' }}>Saves every 5 seconds while you write</div>
            </div>
            <button onClick={() => saveAutosave(!autosave)} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.08em', padding: '6px 16px', background: autosave ? '#111' : 'transparent', color: autosave ? '#fff' : '#999', border: '0.5px solid #ddd', cursor: 'pointer' }}>
              {autosave ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* AI Models BYOK */}
        <div style={sectionStyle}>
          <label style={labelStyle}>AI Models — Bring Your Own Key</label>

          {!hasWriterAccess ? (
            <div onClick={() => setPricingOpen(true)} style={lockRowStyle}>
              <div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#999', letterSpacing: '0.06em', marginBottom: '4px' }}>Connect Claude, GPT-4, Kimi, or Gemini</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#ccc', letterSpacing: '0.04em' }}>Use AI to write directly in your screenplay — Cmd+G in editor</div>
              </div>
              <LockBadge tier="Writer" />
            </div>
          ) : (
            <div>
              {PROVIDER_INFO.map((provider, idx) => (
                <div key={provider.id} style={{ borderBottom: idx < PROVIDER_INFO.length - 1 ? '0.5px solid #f5f5f5' : 'none', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#111' }}>{provider.name}</div>
                    {savedKeys[provider.id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: '#22c55e', letterSpacing: '0.08em' }}>● Connected</span>
                        <button onClick={() => removeModelKey(provider.id)} style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.08em', padding: '3px 8px', background: 'transparent', color: '#dc2626', border: '0.5px solid #fca5a5', cursor: 'pointer' }}>Remove</button>
                      </div>
                    ) : (
                      <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: '#bbb', letterSpacing: '0.06em' }}>Get API key ↗</a>
                    )}
                  </div>

                  {!savedKeys[provider.id] && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input type="password" value={modelKeys[provider.id] || ''} onChange={e => setModelKeys(prev => ({ ...prev, [provider.id]: e.target.value }))} placeholder={provider.hint}
                        style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', flex: 1, padding: '8px 0', border: 'none', borderBottom: '0.5px solid #e8e8e8', outline: 'none', background: 'transparent', color: '#111' }} />
                      <button onClick={() => saveModelKey(provider.id)} disabled={saving === provider.id || !modelKeys[provider.id]}
                        style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.1em', padding: '6px 14px', background: '#111', color: '#fff', border: 'none', cursor: !modelKeys[provider.id] ? 'not-allowed' : 'pointer', opacity: !modelKeys[provider.id] ? 0.4 : 1, flexShrink: 0 }}>
                        {saving === provider.id ? '...' : 'Save'}
                      </button>
                    </div>
                  )}

                  <button onClick={() => setExpandedInstructions(expandedInstructions === provider.id ? null : provider.id)}
                    style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.1em', color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {expandedInstructions === provider.id ? '▾' : '▸'} How to set up & use
                  </button>

                  {expandedInstructions === provider.id && (
                    <div style={{ marginTop: '12px', padding: '16px', background: '#fafafa', border: '0.5px solid #f0f0f0' }}>
                      <InstructionSteps title="Getting your API key" steps={provider.getKeySteps} />
                      <InstructionSteps title="Using in the editor" steps={provider.useSteps} />
                      {provider.notes && (
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: '#bbb', letterSpacing: '0.04em', lineHeight: 1.7, borderTop: '0.5px solid #efefef', paddingTop: '10px', marginTop: '4px' }}>
                          {provider.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent API - Studio */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Agent API Keys</label>

          {!hasStudioAccess ? (
            <div onClick={() => setPricingOpen(true)} style={lockRowStyle}>
              <div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#999', letterSpacing: '0.06em', marginBottom: '4px' }}>Let OpenClaw write while you sleep</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#ccc', letterSpacing: '0.04em' }}>Generate API keys for external agents to access your scripts</div>
              </div>
              <LockBadge tier="Studio" />
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#888', letterSpacing: '0.04em', lineHeight: 1.8, marginBottom: '16px' }}>
                Generate keys so OpenClaw or any agent can read and write your scripts autonomously. Agent-written content appears in blue.
              </div>
              <button onClick={() => navigate('/api-keys')} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', padding: '10px 24px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>
                Manage API Keys →
              </button>

              <button onClick={() => setExpandedProvider(expandedProvider === 'openclaw' ? null : 'openclaw')}
                style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.1em', color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {expandedProvider === 'openclaw' ? '▾' : '▸'} How to connect OpenClaw
              </button>

              {expandedProvider === 'openclaw' && (
                <div style={{ marginTop: '12px', padding: '16px', background: '#fafafa', border: '0.5px solid #f0f0f0' }}>
                  <InstructionSteps title="Setup" steps={[
                    'Go to API Keys and generate a new key labeled "OpenClaw"',
                    'Copy the key immediately — it is only shown once',
                    'Open OpenClaw on your Mac or via Telegram',
                    'Paste the key into OpenClaw\'s system prompt or agent config',
                    'OpenClaw is now authorized to read and write your scripts'
                  ]} />
                  <InstructionSteps title="How to use" steps={[
                    'Tell OpenClaw: "Go write in The Last Burger, Draft 2"',
                    'OpenClaw reads your current draft for context first',
                    'It writes from where you left off using its own model',
                    'Come back and log in — new content appears in blue',
                    'To start a fresh draft: "Continue The Last Burger — start new draft"'
                  ]} />
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: '#bbb', letterSpacing: '0.04em', lineHeight: 1.7, borderTop: '0.5px solid #efefef', paddingTop: '10px', marginTop: '4px' }}>
                    OpenClaw uses its own model — you don't need a BYOK key for agent writing. Studio plan includes both in-app AI and agent access.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account */}
        <div>
          <label style={labelStyle}>Account</label>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#999', letterSpacing: '0.04em' }}>{user?.email}</div>
        </div>

      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} highlightPlan={!hasWriterAccess ? 'writer' : 'studio'} />
    </div>
  )
}
