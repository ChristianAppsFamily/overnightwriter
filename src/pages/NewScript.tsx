import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScripts } from '../hooks/useScripts'
import { Writer } from '../types'

const inputStyle: React.CSSProperties = {
  fontFamily: '"DM Mono", monospace',
  fontSize: '13px',
  border: 'none',
  borderBottom: '0.5px solid #ddd',
  width: '100%',
  padding: '6px 0',
  background: 'transparent',
  color: '#111',
  outline: 'none'
}

const selectStyle: React.CSSProperties = {
  fontFamily: '"DM Mono", monospace',
  fontSize: '10px',
  letterSpacing: '0.04em',
  border: '0.5px solid #ddd',
  padding: '4px 6px',
  background: 'transparent',
  color: '#666',
  outline: 'none',
  cursor: 'pointer',
  flexShrink: 0
}

const labelStyle: React.CSSProperties = {
  fontFamily: '"DM Mono", monospace',
  fontSize: '10px',
  letterSpacing: '0.15em',
  color: '#aaa',
  textTransform: 'uppercase' as const,
  marginBottom: '10px',
  display: 'block'
}

export default function NewScript() {
  const navigate = useNavigate()
  const { createScript } = useScripts()

  const [title, setTitle] = useState('')
  const [writers, setWriters] = useState<Writer[]>([
    { name: '', credit: 'Screenplay By' }
  ])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateWriter = (i: number, field: keyof Writer, value: string) => {
    const updated = [...writers]
    updated[i] = { ...updated[i], [field]: value }
    setWriters(updated)
  }

  const addWriter = () => {
    if (writers.length >= 4) return
    setWriters([...writers, { name: '', credit: 'Screenplay By' }])
  }

  const handleCreate = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return }
    const validWriters = writers.filter(w => w.name.trim())
    if (validWriters.length === 0) { setError('Please add at least one writer.'); return }
    setLoading(true)
    setError('')
    const { script, draft, error } = await createScript(title.trim(), validWriters, contactEmail, contactPhone)
    setLoading(false)
    if (error || !script || !draft) { setError('Failed to create script. Please try again.'); return }
    navigate(`/editor/${script.id}/1`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        border: '0.5px solid #e5e5e5',
        padding: '44px'
      }}>

        {/* Step indicator */}
        <div style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: '#bbb',
          textTransform: 'uppercase',
          marginBottom: '36px'
        }}>
          New Script
        </div>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('writer-0')?.focus()}
            placeholder="Untitled Screenplay"
            style={{
              ...inputStyle,
              fontFamily: '"EB Garamond", serif',
              fontSize: '28px',
              fontWeight: 400
            }}
          />
        </div>

        {/* Writers */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Writers</label>
          {writers.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                id={`writer-${i}`}
                value={w.name}
                onChange={e => updateWriter(i, 'name', e.target.value)}
                placeholder={`Writer ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <select
                value={w.credit}
                onChange={e => updateWriter(i, 'credit', e.target.value as Writer['credit'])}
                style={selectStyle}
              >
                <option>Screenplay By</option>
                <option>Story By</option>
              </select>
            </div>
          ))}
          {writers.length < 4 && (
            <button
              onClick={addWriter}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: '#bbb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                marginTop: '4px'
              }}
            >
              + add writer
            </button>
          )}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '36px' }}>
          <label style={labelStyle}>Contact</label>
          <input
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            placeholder="Email"
            type="email"
            style={{ ...inputStyle, marginBottom: '10px' }}
          />
          <input
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="Phone"
            type="tel"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginBottom: '16px', letterSpacing: '0.05em' }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: '#bbb',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ← back
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              letterSpacing: '0.1em',
              padding: '11px 28px',
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '...' : 'Create Script →'}
          </button>
        </div>
      </div>
    </div>
  )
}
