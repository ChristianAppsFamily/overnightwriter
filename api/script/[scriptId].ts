// api/script/[scriptId].ts
// Vercel serverless API for OpenClaw agent access
// Deploy this in your /api folder at the project root

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS for agent access
)

interface DraftBlock {
  id: string
  type: string
  text: string
  ai_written: boolean
}

async function validateApiKey(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const key = authHeader.slice(7)
  const hash = createHash('sha256').update(key).digest('hex')

  const { data } = await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key_hash', hash)
    .single()

  return data?.user_id || null
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // Auth
  const userId = await validateApiKey(req.headers.authorization)
  if (!userId) return res.status(401).json({ error: 'Invalid or missing API key' })

  const { scriptId } = req.query
  const draftNumber = parseInt(req.query.draft || '1')
  const scriptTitle = req.query.title as string

  // Resolve script — by ID or by title
  let resolvedScriptId = scriptId
  if (!resolvedScriptId && scriptTitle) {
    const { data: scriptByTitle } = await supabase
      .from('scripts')
      .select('id')
      .eq('user_id', userId)
      .ilike('title', scriptTitle)
      .single()
    resolvedScriptId = scriptByTitle?.id
  }

  if (!resolvedScriptId) return res.status(404).json({ error: 'Script not found' })

  // Verify ownership
  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', resolvedScriptId)
    .eq('user_id', userId)
    .single()

  if (!script) return res.status(404).json({ error: 'Script not found or access denied' })

  // GET — read script content
  if (req.method === 'GET') {
    const { data: draft } = await supabase
      .from('drafts')
      .select('*')
      .eq('script_id', resolvedScriptId)
      .eq('draft_number', draftNumber)
      .single()

    if (!draft) return res.status(404).json({ error: `Draft ${draftNumber} not found` })

    return res.status(200).json({
      script: {
        id: script.id,
        title: script.title,
        writers: script.writers,
        draft_count: script.draft_count
      },
      draft: {
        id: draft.id,
        draft_number: draft.draft_number,
        content: draft.content,
        updated_at: draft.updated_at
      },
      // Fountain export for easy AI reading
      fountain: blocksToFountain(draft.content)
    })
  }

  // POST — append AI content to draft
  if (req.method === 'POST') {
    const { blocks, action } = req.body

    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({ error: 'body.blocks must be an array of DraftBlock' })
    }

    // Get current draft
    const { data: currentDraft } = await supabase
      .from('drafts')
      .select('*')
      .eq('script_id', resolvedScriptId)
      .eq('draft_number', draftNumber)
      .single()

    if (!currentDraft) return res.status(404).json({ error: `Draft ${draftNumber} not found` })

    // Mark all incoming blocks as AI written
    const aiBlocks: DraftBlock[] = blocks.map((b: DraftBlock) => ({
      ...b,
      ai_written: true
    }))

    let newContent: DraftBlock[]

    if (action === 'overwrite') {
      // Replace all content
      newContent = aiBlocks
    } else {
      // Default: append after existing content
      newContent = [...currentDraft.content, ...aiBlocks]
    }

    const { data: updatedDraft, error } = await supabase
      .from('drafts')
      .update({
        content: newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentDraft.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Update script updated_at
    await supabase
      .from('scripts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', resolvedScriptId)

    return res.status(200).json({
      success: true,
      blocks_added: aiBlocks.length,
      draft: {
        id: updatedDraft.id,
        draft_number: updatedDraft.draft_number,
        block_count: newContent.length,
        updated_at: updatedDraft.updated_at
      }
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function blocksToFountain(blocks: DraftBlock[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'scene-heading': return `\n${b.text.toUpperCase()}\n`
      case 'action': return `\n${b.text}\n`
      case 'character': return `\n${b.text.toUpperCase()}`
      case 'dialogue': return b.text
      case 'parenthetical': return `(${b.text})`
      case 'transition': return `\n${b.text.toUpperCase()}\n`
      default: return b.text
    }
  }).join('\n').trim()
}
