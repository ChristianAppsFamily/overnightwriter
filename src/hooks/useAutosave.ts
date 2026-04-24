import { useEffect, useRef, useState } from 'react'
import { DraftBlock } from '../types'

export function useAutosave(
  content: DraftBlock[],
  onSave: (content: DraftBlock[]) => Promise<void>,
  enabled: boolean,
  intervalMs = 5000
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)
  const contentRef = useRef(content)
  const dirtyRef = useRef(false)

  useEffect(() => {
    contentRef.current = content
    dirtyRef.current = true
  }, [content])

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return
      setSaving(true)
      await onSave(contentRef.current)
      dirtyRef.current = false
      setLastSaved(new Date())
      setSaving(false)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [enabled, intervalMs, onSave])

  const manualSave = async () => {
    setSaving(true)
    await onSave(contentRef.current)
    dirtyRef.current = false
    setLastSaved(new Date())
    setSaving(false)
  }

  return { lastSaved, saving, manualSave }
}
