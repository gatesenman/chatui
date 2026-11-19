import { describe, expect, it } from 'vitest'
import type { ChatMessage, ChatSession } from '../types'
import {
  SESSION_STORAGE_KEY,
  loadSessions,
  messagesToMarkdown,
  saveSessions,
} from '../sessionPersist'

function mem(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem(k: string) {
      return k in data ? data[k] : null
    },
    setItem(k: string, v: string) {
      data[k] = v
    },
  }
}

describe('session persistence', () => {
  it('round-trips sessions through storage', () => {
    const storage = mem()
    const session: ChatSession = { id: 's1', title: 'Sales', createdAt: 1, updatedAt: 2 }
    const messages: ChatMessage[] = [
      { id: 'm1', role: 'user', status: 'completed', blocks: [{ type: 'text', text: 'hello' }], createdAt: 1 },
    ]
    saveSessions(storage, [{ session, messages }], 's1')
    expect(storage.data[SESSION_STORAGE_KEY]).toBeTruthy()
    const loaded = loadSessions(storage)
    expect(loaded?.activeId).toBe('s1')
    expect(loaded?.sessions[0].session.title).toBe('Sales')
    expect(loaded?.sessions[0].messages[0].blocks[0]).toEqual({ type: 'text', text: 'hello' })
  })

  it('returns null for missing or invalid payloads', () => {
    expect(loadSessions(mem())).toBeNull()
    expect(loadSessions(mem({ [SESSION_STORAGE_KEY]: 'not-json' }))).toBeNull()
  })
})

describe('messagesToMarkdown', () => {
  it('renders text, markdown and code blocks', () => {
    const md = messagesToMarkdown('Sales report', [
      {
        id: 'm1',
        role: 'user',
        status: 'completed',
        blocks: [{ type: 'text', text: '查询销售报表' }],
        createdAt: 1,
      },
      {
        id: 'm2',
        role: 'assistant',
        status: 'completed',
        blocks: [
          { type: 'markdown', content: 'Here is the SQL.' },
          { type: 'code', language: 'sql', code: 'select 1' },
        ],
        createdAt: 2,
      },
    ])
    expect(md).toContain('# Sales report')
    expect(md).toContain('## User')
    expect(md).toContain('查询销售报表')
    expect(md).toContain('## Assistant')
    expect(md).toContain('Here is the SQL.')
    expect(md).toContain('```sql')
    expect(md).toContain('select 1')
  })
})
