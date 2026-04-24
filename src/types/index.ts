export type ElementType =
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition'

export interface Writer {
  name: string
  credit: 'Screenplay By' | 'Story By'
}

export interface Script {
  id: string
  title: string
  writers: Writer[]
  contact_email: string
  contact_phone: string
  user_id: string
  created_at: string
  updated_at: string
  draft_count: number
}

export interface Draft {
  id: string
  script_id: string
  draft_number: number
  content: DraftBlock[]
  created_at: string
  updated_at: string
}

export interface DraftBlock {
  id: string
  type: ElementType
  text: string
  ai_written: boolean
}

export interface ApiKey {
  id: string
  user_id: string
  label: string
  key_prefix: string
  created_at: string
}
