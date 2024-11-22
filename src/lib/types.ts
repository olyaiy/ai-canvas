export type AIProvider = "gpt" | "claude"

export type GPTModelType = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'o1-mini' | 'o1-preview'
export type ClaudeModelType = 'claude-3-5-haiku-latest' | 'claude-3-5-sonnet-latest' | 'claude-3-opus-latest'

export const AI_CONFIGS = {
  gpt: {
    models: {
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4o': 'GPT-4o',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'o1-mini': 'O1 Mini',
      'o1-preview': 'O1 Preview'
    } as const,
    styles: {
      background: 'bg-[#212121]',
      handle: '!bg-[#10A37F]',
      handleHover: 'hover:!bg-[#0A8F6C]',
      handleRing: 'hover:before:!ring-[#10A37F]',
      handleOffset: 'hover:before:!ring-offset-[#212121]',
      input: 'bg-[#2E2E2E] border-gray-600 text-white',
      button: 'bg-white hover:bg-gray-200 text-gray-600',
      text: 'text-white'
    }
  },
  claude: {
    models: {
      'claude-3-5-haiku-latest': 'Claude 3 Haiku',
      'claude-3-5-sonnet-latest': 'Claude 3 Sonnet',
      'claude-3-opus-latest': 'Claude 3 Opus'
    } as const,
    styles: {
      background: 'bg-[#D4A27F]',
      handle: '!bg-[#6749C6]',
      handleHover: 'hover:!bg-[#5438B4]',
      handleRing: 'hover:before:!ring-[#6749C6]',
      handleOffset: 'hover:before:!ring-offset-[#D4A27F]',
      input: 'bg-white/80 border-[#262625] text-black',
      button: 'bg-[#262625] hover:bg-gray-700 text-white',
      text: 'text-black'
    }
  }
} as const

export type AIModelType = GPTModelType | ClaudeModelType

export interface AINodeData {
  value?: string
  model?: AIModelType
  systemPrompt: string
  temperature: number
  maxTokens: number
} 