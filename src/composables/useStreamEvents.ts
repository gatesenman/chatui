import type { ChatMessage, ContentBlock, StreamEvent } from '../types'

/**
 * 将一条 SSE 流式事件应用到消息列表（原地修改）。
 * 后端通过 SSE 推送 StreamEvent，前端逐条调用本函数即可完成增量渲染。
 */
export function applyStreamEvent(messages: ChatMessage[], event: StreamEvent): void {
  const msg = messages.find((m) => m.id === event.messageId)
  if (!msg) return

  switch (event.type) {
    case 'status':
      msg.status = event.status
      break
    case 'delta': {
      const last = msg.blocks[msg.blocks.length - 1]
      if (last && last.type === 'markdown') {
        last.content += event.text
      } else {
        msg.blocks.push({ type: 'markdown', content: event.text })
      }
      if (msg.status !== 'streaming') msg.status = 'streaming'
      break
    }
    case 'block':
      msg.blocks.push(event.block as ContentBlock)
      break
    case 'step': {
      let stepsBlock = msg.blocks.find((b) => b.type === 'steps')
      if (!stepsBlock) {
        stepsBlock = { type: 'steps', steps: [] }
        msg.blocks.unshift(stepsBlock)
      }
      if (stepsBlock.type === 'steps') {
        const existing = stepsBlock.steps.find((s) => s.id === event.step.id)
        if (existing) Object.assign(existing, event.step)
        else stepsBlock.steps.push(event.step)
      }
      break
    }
    case 'error':
      msg.status = 'failed'
      msg.error = event.message
      break
    case 'done':
      if (msg.status !== 'failed' && msg.status !== 'canceled') msg.status = 'completed'
      break
  }
}

export interface SSEClientOptions {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
  onEvent: (event: StreamEvent) => void
  onError?: (error: Error) => void
  onClose?: () => void
}

/**
 * 基于 fetch 的 SSE 客户端，支持 POST 请求和中断。
 * 解析 `data: {...}\n\n` 格式的事件流，每条 data 应为 StreamEvent JSON。
 */
export async function connectSSE(options: SSEClientOptions): Promise<void> {
  const { url, method = 'POST', headers, body, signal, onEvent, onError, onClose } = options
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    })
    if (!res.ok || !res.body) throw new Error(`SSE 连接失败: ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''
      for (const part of parts) {
        for (const line of part.split('\n')) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            onEvent(JSON.parse(data) as StreamEvent)
          } catch {
            // 忽略无法解析的事件
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') onError?.(err as Error)
  } finally {
    onClose?.()
  }
}
