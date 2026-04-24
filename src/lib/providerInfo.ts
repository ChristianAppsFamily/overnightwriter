export interface ProviderInfo {
  id: string
  name: string
  hint: string
  url: string
  getKeySteps: string[]
  useSteps: string[]
  notes?: string
}

export const PROVIDER_INFO: ProviderInfo[] = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    hint: 'sk-ant-api03-...',
    url: 'https://console.anthropic.com/settings/keys',
    getKeySteps: [
      'Go to console.anthropic.com and sign in or create an account',
      'Navigate to Settings → API Keys',
      'Click "Create Key", give it a name like "OvernightWriter"',
      'Copy the key immediately — it will not be shown again',
      'Paste it in the field above and click Save'
    ],
    useSteps: [
      'In the editor, press Cmd+G (Mac) or Ctrl+G (Windows) to open the AI bar',
      'Select "C" for Claude in the model selector',
      'Type your instruction — e.g. "Write the next scene where they argue"',
      'Press Enter — Claude writes directly into your draft in blue'
    ],
    notes: 'Claude is recommended for long-form narrative and complex character dialogue. Uses your Anthropic account credits.'
  },
  {
    id: 'openai',
    name: 'ChatGPT / GPT-4 (OpenAI)',
    hint: 'sk-proj-...',
    url: 'https://platform.openai.com/api-keys',
    getKeySteps: [
      'Go to platform.openai.com and sign in or create an account',
      'Navigate to API Keys in the left sidebar',
      'Click "Create new secret key", name it "OvernightWriter"',
      'Copy the key — it will only be shown once',
      'Paste it in the field above and click Save'
    ],
    useSteps: [
      'In the editor, press Cmd+G (Mac) or Ctrl+G (Windows) to open the AI bar',
      'Select "G" for GPT-4 in the model selector',
      'Type your instruction — e.g. "Continue the dialogue between Mario and Claire"',
      'Press Enter — GPT-4 writes directly into your draft in blue'
    ],
    notes: 'GPT-4o is used by default. Requires a funded OpenAI account. Usage is billed by OpenAI per token.'
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot AI)',
    hint: 'sk-...',
    url: 'https://platform.moonshot.cn/console/api-keys',
    getKeySteps: [
      'Go to platform.moonshot.cn and create an account',
      'Navigate to API Keys in your console',
      'Generate a new key and name it "OvernightWriter"',
      'Copy the key immediately',
      'Paste it in the field above and click Save'
    ],
    useSteps: [
      'In the editor, press Cmd+G (Mac) or Ctrl+G (Windows) to open the AI bar',
      'Select "K" for Kimi in the model selector',
      'Type your instruction — e.g. "Add a flashback scene to Mario\'s past"',
      'Press Enter — Kimi writes directly into your draft in blue'
    ],
    notes: 'Kimi excels at long-context writing and is strong with detailed scene work. Uses Moonshot AI credits.'
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    hint: 'AIzaSy...',
    url: 'https://aistudio.google.com/app/apikey',
    getKeySteps: [
      'Go to aistudio.google.com and sign in with your Google account',
      'Click "Get API Key" in the top navigation',
      'Create a new API key — select a Google Cloud project or create one',
      'Copy the generated key',
      'Paste it in the field above and click Save'
    ],
    useSteps: [
      'In the editor, press Cmd+G (Mac) or Ctrl+G (Windows) to open the AI bar',
      'Select "Ge" for Gemini in the model selector',
      'Type your instruction — e.g. "Write a tense confrontation scene"',
      'Press Enter — Gemini writes directly into your draft in blue'
    ],
    notes: 'Uses Gemini 1.5 Pro. Google offers a generous free tier. Billed through your Google Cloud account.'
  }
]
