import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Script, Draft } from '../../types'
import { supabase } from '../../lib/supabase'

interface Props {
  scripts: Script[]
  currentScriptId: string
  currentDraftNumber: number
  onDraftSwitch: (scriptId: string, draftNumber: number) => void
  onNewDraft: () => void
}

export default function EditorSidebar({ scripts, currentScriptId, currentDraftNumber, onDraftSwitch, onNewDraft }: Props) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [expandedScript, setExpandedScript] = useState<string | null>(currentScriptId)
  const [draftsByScript, setDraftsByScript] = useState<Record<string, Draft[]>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)

  const displayName = user?.email?.split('@')[0] || 'Writer'
  const initials = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!expandedScript) return
    supabase
      .from('drafts')
      .select('id, draft_number, script_id, created_at')
      .eq('script_id', expandedScript)
      .order('draft_number', { ascending: true })
      .then(({ data }) => {
        if (data) setDraftsByScript(prev => ({ ...prev, [expandedScript]: data as Draft[] }))
      })
  }, [expandedScript])

  // Reload drafts when new draft is created
  useEffect(() => {
    if (!currentScriptId) return
    supabase
      .from('drafts')
      .select('id, draft_number, script_id, created_at')
      .eq('script_id', currentScriptId)
      .order('draft_number', { ascending: true })
      .then(({ data }) => {
        if (data) setDraftsByScript(prev => ({ ...prev, [currentScriptId]: data as Draft[] }))
      })
  }, [currentScriptId, currentDraftNumber])

  return (
    <div style={{ width: '224px', borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* Scripts list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {scripts.map(script => (
          <div key={script.id}>
            {/* Script row */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: script.id === currentScriptId ? '#f8f8f8' : 'transparent' }}>
              <div
                onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', minWidth: 0 }}
              >
                <span style={{ fontSize: '12px', letterSpacing: '0.03em', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {script.title}
                </span>
                <span style={{ fontSize: '10px', color: '#bbb', letterSpacing: '0.05em', flexShrink: 0, marginLeft: '6px' }}>
                  ({script.draft_count})
                </span>
              </div>
              {/* FIX #3: + button to add new draft — only show for current script */}
              {script.id === currentScriptId && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNewDraft() }}
                  title="New Draft"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '14px', padding: '0 0 0 6px', lineHeight: 1, flexShrink: 0 }}
                >
                  +
                </button>
              )}
            </div>

            {/* Drafts list */}
            {expandedScript === script.id && draftsByScript[script.id]?.map(d => (
              <div
                key={d.id}
                onClick={() => onDraftSwitch(script.id, d.draft_number)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 20px 4px 28px', cursor: 'pointer',
                  fontSize: '11px', letterSpacing: '0.04em',
                  color: d.draft_number === currentDraftNumber && script.id === currentScriptId ? '#111' : '#999',
                  background: d.draft_number === currentDraftNumber && script.id === currentScriptId ? '#f4f4f4' : 'transparent'
                }}
              >
                <span style={{
                  width: '4px', height: '4px', borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                  background: d.draft_number === currentDraftNumber && script.id === currentScriptId ? '#111' : '#ddd'
                }} />
                Draft {d.draft_number}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* User panel */}
      <div style={{ borderTop: '0.5px solid #e8e8e8', position: 'relative' }}>
        {settingsOpen && (
          <div style={{ position: 'absolute', bottom: '64px', left: '12px', right: '12px', background: '#fff', border: '0.5px solid #e5e5e5', zIndex: 100 }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', padding: '10px 16px', color: '#666', cursor: 'pointer', letterSpacing: '0.04em' }} onClick={() => navigate('/settings')}>Settings</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', padding: '10px 16px', color: '#666', cursor: 'pointer', letterSpacing: '0.04em' }} onClick={() => navigate('/api-keys')}>API Keys</div>
            <div style={{ height: '0.5px', background: '#e8e8e8' }} />
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', padding: '10px 16px', color: '#dc2626', cursor: 'pointer', letterSpacing: '0.04em' }} onClick={async () => { await signOut(); navigate('/') }}>Sign Out</div>
          </div>
        )}
        <div onClick={() => setSettingsOpen(!settingsOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0f0f0', border: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', letterSpacing: '0.05em', color: '#666', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ fontSize: '9px', color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>Free Plan</div>
          </div>
          <span style={{ fontSize: '10px', color: '#bbb' }}>↑</span>
        </div>
      </div>
    </div>
  )
}
