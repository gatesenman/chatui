<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import HelpCenter from './help/HelpCenter.vue'
import {
  AgentChatbot,
  applyStreamEvent,
  type ChatMessage,
  type ChatSession,
  type ChatbotConfig,
  type CorrectionPayload,
  type FeedbackPayload,
  type FormSubmitPayload,
  type HitlActionPayload,
  type SendMessagePayload
} from '@agent/chat-ui'
import { runMockAgent } from './mockAgent'

const config = reactive<ChatbotConfig>({
  welcomeTitle: '你好，我是企业智能助手',
  welcomeMessage: '我可以帮你查询数据、生成报表、办理流程，复杂操作会先请你确认。',
  agentDescription: '支持流式回复、表格/图表/代码渲染、动态表单、人工审批（HITL）、执行过程可视化等能力。',
  quickActions: [
    { id: 'qa-1', label: '查询销售报表', icon: '[报表]', prompt: '查询2025年销售报表' },
    { id: 'qa-2', label: '我要请假', icon: '[表单]', prompt: '我要请假，请给我请假表单' },
    { id: 'qa-3', label: '办理退款审批', icon: '[审批]', prompt: '帮客户办理退款，金额12800元' },
    { id: 'qa-4', label: '生成 SQL', icon: '[代码]', prompt: '写一段统计部门报销的SQL代码' },
    { id: 'qa-5', label: '模拟失败', icon: '[警告]', prompt: '模拟失败场景' }
  ],
  input: { text: true, voice: true, file: true, image: true },
  theme: { title: '企业智能助手', primaryColor: '#4f6ef7', layout: 'bubble' },
  showSessions: true,
  allowStop: true,
  enableFeedback: true
})

interface SessionData {
  session: ChatSession
  messages: ChatMessage[]
}

let idSeq = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${++idSeq}`

const sessionsData = reactive<SessionData[]>([])
const activeSessionId = ref<string | null>(null)
const busy = ref(false)
let abortController: AbortController | null = null

function createSession(): SessionData {
  const session: ChatSession = {
    id: uid('s'),
    title: '新会话',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const data: SessionData = { session, messages: reactive([]) }
  sessionsData.unshift(data)
  activeSessionId.value = session.id
  return data
}

createSession()

const active = computed(() => sessionsData.find((d) => d.session.id === activeSessionId.value))
const sessions = computed(() => sessionsData.map((d) => d.session))
const messages = computed<ChatMessage[]>(() => active.value?.messages ?? [])

async function runAgent(prompt: string) {
  const data = active.value
  if (!data) return
  const assistantMsg: ChatMessage = reactive({
    id: uid('m'),
    role: 'assistant',
    status: 'pending',
    blocks: [],
    createdAt: Date.now(),
    traceId: uid('trace')
  })
  data.messages.push(assistantMsg)
  busy.value = true
  abortController = new AbortController()
  try {
    await runMockAgent(prompt, assistantMsg.id, (e) => applyStreamEvent(data.messages, e), abortController.signal)
  } finally {
    busy.value = false
    abortController = null
    if (['pending', 'thinking', 'running', 'streaming'].includes(assistantMsg.status)) {
      assistantMsg.status = assistantMsg.error ? 'failed' : 'canceled'
    }
    data.session.updatedAt = Date.now()
  }
}

function onSend(payload: SendMessagePayload) {
  const data = active.value ?? createSession()
  data.messages.push({
    id: uid('m'),
    role: 'user',
    status: 'completed',
    blocks: [{ type: 'text', text: payload.text }],
    attachments: payload.attachments,
    createdAt: Date.now()
  })
  // 首轮对话后自动生成会话标题
  if (data.session.title === '新会话' && payload.text) {
    data.session.title = payload.text.slice(0, 18)
  }
  data.session.updatedAt = Date.now()
  void runAgent(payload.text)
}

function onStop() {
  abortController?.abort()
  const last = messages.value[messages.value.length - 1]
  if (last && last.role === 'assistant') last.status = 'canceled'
}

function onRetry(messageId: string) {
  const data = active.value
  if (!data) return
  const idx = data.messages.findIndex((m) => m.id === messageId)
  if (idx < 0) return
  // 找到该回复对应的上一条用户消息
  let prompt = ''
  for (let i = idx; i >= 0; i--) {
    const m = data.messages[i]
    if (m.role === 'user') {
      const block = m.blocks.find((b) => b.type === 'text')
      prompt = block && block.type === 'text' ? block.text : ''
      break
    }
  }
  data.messages.splice(idx, 1)
  void runAgent(prompt.replace('模拟失败', '重试后成功'))
}

function onHitlAction(payload: HitlActionPayload) {
  const data = active.value
  if (!data) return
  const msg = data.messages.find((m) => m.id === payload.messageId)
  if (msg) msg.status = 'completed'
  // 审批后恢复原执行链路（模拟 POST /api/runtime/tasks/{id}/resume）
  void (async () => {
    const followUp: ChatMessage = reactive({
      id: uid('m'),
      role: 'assistant',
      status: 'running',
      blocks: [],
      createdAt: Date.now()
    })
    data.messages.push(followUp)
    busy.value = true
    abortController = new AbortController()
    const signal = abortController.signal
    const emit = (text: string) => applyStreamEvent(data.messages, { type: 'delta', messageId: followUp.id, text })
    try {
      await new Promise((r) => setTimeout(r, 700))
      if (signal.aborted) return
      if (payload.action === 'approve' || payload.action === 'modify') {
        applyStreamEvent(data.messages, {
          type: 'step',
          messageId: followUp.id,
          step: { id: 'resume-1', name: '调用支付系统执行退款', status: 'completed' }
        })
        emit(
          payload.action === 'modify'
            ? `已按你修改后的内容执行退款（${JSON.stringify(payload.fields)}），任务编号 RT-88321，预计 1-3 个工作日到账。`
            : '[通过] 审批通过，退款已提交支付系统执行，任务编号 RT-88321，预计 1-3 个工作日到账。'
        )
      } else if (payload.action === 'reject') {
        emit(`已取消本次退款${payload.comment ? `（原因：${payload.comment}）` : ''}。如需改为部分退款或补偿优惠券，可以告诉我，我来重新生成方案。`)
      } else {
        emit(`已收到补充信息：「${payload.comment}」，方案已更新，请再次确认。`)
      }
      applyStreamEvent(data.messages, { type: 'done', messageId: followUp.id })
    } finally {
      busy.value = false
      abortController = null
    }
  })()
}

function onFormSubmit(payload: FormSubmitPayload) {
  const data = active.value
  if (!data) return
  const summary = Object.entries(payload.values)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : v}`)
    .join('；')
  data.messages.push({
    id: uid('m'),
    role: 'assistant',
    status: 'completed',
    blocks: [
      {
        type: 'markdown',
        content: `[表单] 表单 **${payload.formId}** 已提交成功（${summary}），已发起审批流程，进度会同步给你。`
      }
    ],
    createdAt: Date.now()
  })
}

function onFeedback(payload: FeedbackPayload) {
  const msg = messages.value.find((m) => m.id === payload.messageId)
  if (msg) msg.feedback = payload.feedback
}

function onCorrection(payload: CorrectionPayload) {
  const msg = messages.value.find((m) => m.id === payload.messageId)
  if (msg) msg.correction = payload.correction
}

const traceId = ref<string | null>(null)
const page = ref<'demo' | 'help'>('demo')

function onSessionRemove(id: string) {
  const idx = sessionsData.findIndex((d) => d.session.id === id)
  if (idx >= 0) sessionsData.splice(idx, 1)
  if (activeSessionId.value === id) activeSessionId.value = sessionsData[0]?.session.id ?? null
  if (!sessionsData.length) createSession()
}

function onSessionRename(id: string, title: string) {
  const data = sessionsData.find((d) => d.session.id === id)
  if (data) data.session.title = title
}
</script>

<template>
  <HelpCenter v-if="page === 'help'" @back="page = 'demo'" />
  <div v-else class="demo">
    <div class="demo__toolbar">
      <strong>Agent Chat UI Demo</strong>
      <button class="demo__help-btn" type="button" @click="page = 'help'">[?] 帮助中心</button>
      <label><input v-model="config.showSessions" type="checkbox" /> 会话侧边栏</label>
      <label><input v-model="config.input!.voice" type="checkbox" /> 语音输入</label>
      <label><input v-model="config.input!.file" type="checkbox" /> 文件上传</label>
      <label><input v-model="config.theme!.dark" type="checkbox" /> 暗色主题</label>
      <label>
        主题色
        <input v-model="config.theme!.primaryColor" type="color" />
      </label>
      <label>
        布局
        <select v-model="config.theme!.layout">
          <option value="bubble">气泡</option>
          <option value="document">文档</option>
        </select>
      </label>
    </div>
    <div class="demo__chat">
      <AgentChatbot
        :config="config"
        :messages="messages"
        :sessions="sessions"
        :active-session-id="activeSessionId"
        :busy="busy"
        @send="onSend"
        @stop="onStop"
        @retry="onRetry"
        @session-select="activeSessionId = $event"
        @session-create="createSession()"
        @session-remove="onSessionRemove"
        @session-rename="onSessionRename"
        @hitl-action="onHitlAction"
        @form-submit="onFormSubmit"
        @feedback="onFeedback"
        @correction="onCorrection"
        @open-trace="traceId = $event"
      />
    </div>
    <div v-if="traceId" class="demo__trace" @click.self="traceId = null">
      <div class="demo__trace-panel">
        <div class="demo__trace-header">
          <strong>Trace 详情</strong>
          <button type="button" @click="traceId = null">x</button>
        </div>
        <p>traceId: <code>{{ traceId }}</code></p>
        <p>真实系统中这里展示完整执行链路（GET /api/traces/{traceId}），宿主应用可监听 <code>open-trace</code> 事件自行跳转或渲染。</p>
      </div>
    </div>
  </div>
</template>

<style>
.demo { height: 100%; display: flex; flex-direction: column; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.demo__toolbar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
  font-size: 13px;
  flex-wrap: wrap;
}
.demo__toolbar label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
.demo__help-btn { border: 1px solid #4f6ef7; background: none; color: #4f6ef7; border-radius: 6px; padding: 3px 10px; cursor: pointer; font-size: 13px; }
.demo__help-btn:hover { background: rgba(79,110,247,0.08); }
.demo__chat { flex: 1; min-height: 0; }
.demo__trace {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-end;
  z-index: 50;
}
.demo__trace-panel { width: 420px; background: #fff; padding: 20px; overflow-y: auto; font-size: 14px; }
.demo__trace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.demo__trace-header button { border: none; background: none; cursor: pointer; font-size: 15px; }
</style>
