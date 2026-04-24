import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { canAccess } from '../lib/config'
import PricingModal from '../components/pricing/PricingModal'

interface ApiKey {
  id: string
  label: string
  key_prefix: string
  created_at: string
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const random = Array.from(crypto.getRandomValues(new Uint8Array(40)))
    .map(b => chars[b % chars.length]).join('')
  return `claw_${random}`
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ApiKeys() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plan } = useSubscription()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyLabel, setNewKeyLabel] = useState('OpenClaw')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)

  const hasAccess = canAccess(plan, 'studio')

  useEffect(() => {
    if (!user || !hasAccess) { setLoading(false); return }
    fetchKeys()
  }, [user, hasAccess])

  const fetchKeys = async () => {
    if (!user) return
    const { data } = await supabase
      .from('api_keys')
      .select('id, label, key_prefix, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setKeys(data || [])
    setLoading(false)
  }

  const handleGenerate = async () => {
    if (!user || !hasAccess) return
    setGenerating(true)

    const rawKey = generateApiKey()
    const hash = await hashKey(rawKey)
    const prefix = rawKey.slice(0, 12) + '...'

    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      label: newKeyLabel || 'Agent Key',
      key_hash: hash,
      key_prefix: prefix
    })

    if (!error) {
      setGeneratedKey(rawKey)
      await fetchKeys()
    }
    setGenerating(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('api_keys').delete().eq('id', id)
    setKeys(keys.filter(k => k.id !== id))
  }

  const handleCopy = () => {
    if (!generatedKey) return
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: '"DM Mono", monospace',
    fontSize: '10px',
    letterSpacing: '0.15em',
    color: '#aaa',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 28px', borderBottom: '0.5px solid #e8e8e8', gap: '16px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#bbb', letterSpacing: '0.08em' }}
        >
          ← back
        </button>
        <span style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px', letterSpacing: '0.06em' }}>
          API Keys
        </span>
      </div>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '48px 28px', width: '100%' }}>

        {/* Studio gate */}
        {!hasAccess ? (
          <div style={{ border: '0.5px solid #e8e8e8', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔒</div>
            <div style={{ fontFamily: '"EB Garamond", serif', fontSize: '22px', color: '#111', marginBottom: '8px' }}>
              Studio Feature
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#999', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '28px' }}>
              API keys let OpenClaw and other agents<br />
              write in your scripts while you sleep.
            </div>
            <button
              onClick={() => setPricingOpen(true)}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px',
                letterSpacing: '0.1em',
                padding: '12px 32px',
                background: '#111',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Upgrade to Studio
            </button>
            <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} highlightPlan="studio" />
          </div>
        ) : (
          <>
            {/* Generate new key */}
            <div style={{ marginBottom: '44px' }}>
              <label style={labelStyle}>Generate New Key</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  value={newKeyLabel}
                  onChange={e => setNewKeyLabel(e.target.value)}
                  placeholder="Label (e.g. OpenClaw)"
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '12px',
                    flex: 1,
                    padding: '9px 0',
                    border: 'none',
                    borderBottom: '0.5px solid #ddd',
                    outline: 'none',
                    background: 'transparent',
                    color: '#111'
                  }}
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    padding: '9px 20px',
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.6 : 1,
                    flexShrink: 0
                  }}
                >
                  {generating ? '...' : 'Generate'}
                </button>
              </div>

              {/* Show generated key once */}
              {generatedKey && (
                <div style={{
                  background: '#f8f8f8',
                  border: '0.5px solid #e8e8e8',
                  padding: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    color: '#dc2626',
                    marginBottom: '10px',
                    textTransform: 'uppercase'
                  }}>
                    Copy this key now — it will not be shown again
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <code style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '11px',
                      color: '#111',
                      flex: 1,
                      wordBreak: 'break-all',
                      letterSpacing: '0.04em'
                    }}>
                      {generatedKey}
                    </code>
                    <button
                      onClick={handleCopy}
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '9px',
                        letterSpacing: '0.1em',
                        padding: '6px 12px',
                        background: copied ? '#111' : 'transparent',
                        color: copied ? '#fff' : '#111',
                        border: '0.5px solid #ccc',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '9px',
                    color: '#bbb',
                    marginTop: '10px',
                    lineHeight: 1.7,
                    letterSpacing: '0.04em'
                  }}>
                    Paste this into OpenClaw's system prompt or agent config.<br />
                    Use as: <code style={{ color: '#888' }}>Authorization: Bearer {generatedKey.slice(0, 16)}...</code>
                  </div>
                </div>
              )}
            </div>

            {/* Existing keys */}
            <div>
              <label style={labelStyle}>Active Keys</label>
              {loading ? (
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#ccc' }}>Loading...</div>
              ) : keys.length === 0 ? (
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#ccc', letterSpacing: '0.06em' }}>
                  No keys yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {keys.map(key => (
                    <div
                      key={key.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 0',
                        borderBottom: '0.5px solid #f0f0f0'
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#111', marginBottom: '3px' }}>
                          {key.label}
                        </div>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#ccc', letterSpacing: '0.04em' }}>
                          {key.key_prefix} · Created {new Date(key.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(key.id)}
                        style={{
                          fontFamily: '"DM Mono", monospace',
                          fontSize: '9px',
                          letterSpacing: '0.1em',
                          padding: '5px 10px',
                          background: 'transparent',
                          color: '#dc2626',
                          border: '0.5px solid #fca5a5',
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: '44px',
              padding: '20px',
              background: '#fafafa',
              border: '0.5px solid #e8e8e8'
            }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase', marginBottom: '12px' }}>
                How to use with OpenClaw
              </div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#aaa', lineHeight: 2, letterSpacing: '0.04em' }}>
                1. Generate a key above and copy it<br />
                2. Paste it into OpenClaw's system prompt<br />
                3. Tell OpenClaw: "Go write in [Script Title] Draft [N]"<br />
                4. OpenClaw reads the script, continues writing, saves in blue<br />
                5. Come back and see what was written
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
