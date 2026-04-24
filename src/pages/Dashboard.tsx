import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useScripts } from '../hooks/useScripts'
import { Script } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { scripts, loading } = useScripts()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedScript, setExpandedScript] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleScriptClick = (script: Script) => {
    if (expandedScript === script.id) {
      setExpandedScript(null)
    } else {
      setExpandedScript(script.id)
    }
  }

  const handleDraftClick = (scriptId: string, draftNumber: number) => {
    navigate(`/editor/${scriptId}/${draftNumber}`)
  }

  const displayName = user?.email?.split('@')[0] || 'Writer'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 28px',
        borderBottom: '0.5px solid #e8e8e8'
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          <span style={{ display: 'block', width: '18px', height: '1px', background: '#111' }} />
          <span style={{ display: 'block', width: '18px', height: '1px', background: '#111' }} />
          <span style={{ display: 'block', width: '18px', height: '1px', background: '#111' }} />
        </button>
        <span style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px', letterSpacing: '0.06em', marginLeft: '16px' }}>
          OvernightWriter
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{
            width: '240px',
            borderRight: '0.5px solid #e8e8e8',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 61px)'
          }}>
            <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
              {scripts.map(script => (
                <div key={script.id}>
                  <div
                    onClick={() => handleScriptClick(script)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '12px', letterSpacing: '0.03em', color: '#111' }}>
                      {script.title}
                    </span>
                    <span style={{ fontSize: '10px', color: '#bbb', letterSpacing: '0.05em', flexShrink: 0 }}>
                      ({script.draft_count})
                    </span>
                  </div>
                  {expandedScript === script.id && (
                    <div style={{ paddingLeft: '8px' }}>
                      {Array.from({ length: script.draft_count }, (_, i) => i + 1).map(num => (
                        <div
                          key={num}
                          onClick={() => handleDraftClick(script.id, num)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 20px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#888',
                            letterSpacing: '0.04em'
                          }}
                        >
                          <span style={{
                            width: '4px', height: '4px', borderRadius: '50%',
                            background: '#ccc', flexShrink: 0
                          }} />
                          Draft {num}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User panel */}
            <div style={{ borderTop: '0.5px solid #e8e8e8', position: 'relative' }}>
              {settingsOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: '64px',
                  left: '12px',
                  right: '12px',
                  background: '#fff',
                  border: '0.5px solid #e5e5e5',
                  zIndex: 10
                }}>
                  {[
                    { label: 'Account', action: () => {} },
                    { label: 'Preferences', action: () => {} },
                    { label: 'API Keys', action: () => navigate('/api-keys') },
                  ].map(item => (
                    <div
                      key={item.label}
                      onClick={item.action}
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '11px',
                        padding: '10px 16px',
                        color: '#666',
                        cursor: 'pointer',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                  <div style={{ height: '0.5px', background: '#e8e8e8' }} />
                  <div
                    onClick={async () => { await signOut(); navigate('/') }}
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '11px',
                      padding: '10px 16px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Sign Out
                  </div>
                </div>
              )}
              <div
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#f0f0f0', border: '0.5px solid #e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', letterSpacing: '0.05em', color: '#666', flexShrink: 0
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '9px', color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>
                    Free Plan
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#bbb' }}>↑</span>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ fontSize: '12px', color: '#bbb', letterSpacing: '0.08em' }}>Loading...</div>
          ) : (
            <>
              <button
                onClick={() => navigate('/new')}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  padding: '14px 44px',
                  background: 'transparent',
                  color: '#111',
                  border: '0.5px solid #111',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                + New Script
              </button>
              {scripts.length === 0 && (
                <div style={{ fontSize: '11px', color: '#ccc', letterSpacing: '0.05em' }}>
                  No scripts yet
                </div>
              )}
              {scripts.length > 0 && (
                <div style={{ fontSize: '11px', color: '#ccc', letterSpacing: '0.05em' }}>
                  {scripts.length} script{scripts.length !== 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
