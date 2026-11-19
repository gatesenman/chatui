import type { ChatMessage, ChatSession, ContentBlock } from './types'

export const SESSION_STORAGE_KEY = 'chatui.demo.sessions.v1'

export interface StoredSession {
  session: ChatSession
  messages: ChatMessage[]
}

export interface StoredState {
  sessions: StoredSession[]
  activeId: string | null
}

export interface MemoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function loadSessions(storage: MemoryStorage): StoredState | null {
  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as StoredState
    if (!data || !Array.isArray(data.sessions)) return null
    return {
      sessions: data.sessions.filter((s) => s && s.session && s.session.id),
      activeId: data.activeId ?? data.sessions[0]?.session.id ?? null,
    }
  } catch {
    return null
  }
}

export function saveSessions(
  storage: MemoryStorage,
  sessions: StoredSession[],
  activeId: string | null,
): void {
  storage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ sessions, activeId } satisfies StoredState),
  )
}

function blockToMarkdown(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return block.text
    case 'markdown':
      return block.content
    case 'code':
      return '```' + (block.language || '') + '\n' + block.code + '\n```'
    default:
      return '<!-- ' + block.type + ' -->'
  }
}

export function messagesToMarkdown(title: string, messages: ChatMessage[]): string {
  const lines = ['# ' + (title || 'Conversation'), '']
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'User' : msg.role === 'system' ? 'System' : 'Assistant'
    lines.push('## ' + role)
    lines.push('')
    const body = (msg.blocks || []).map(blockToMarkdown).filter(Boolean).join('\n\n')
    lines.push(body || '_(empty)_')
    lines.push('')
  }
  return lines.join('\n')
}
