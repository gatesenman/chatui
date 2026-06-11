/** 消息运行状态 */
export type MessageStatus =
  | 'pending'      // 排队中
  | 'thinking'     // 思考中
  | 'running'      // 执行中
  | 'streaming'    // 流式输出中
  | 'waiting_hitl' // 等待人工确认
  | 'completed'    // 完成
  | 'failed'       // 失败
  | 'canceled'     // 已取消

export type MessageRole = 'user' | 'assistant' | 'system'

/** 消息内容块：一条消息可由多个内容块组成 */
export type ContentBlock =
  | TextBlock
  | MarkdownBlock
  | CodeBlock
  | TableBlock
  | ChartBlock
  | FileBlock
  | FormBlock
  | HitlBlock
  | StepsBlock
  | CustomBlock

export interface TextBlock {
  type: 'text'
  text: string
}

export interface MarkdownBlock {
  type: 'markdown'
  content: string
}

export interface CodeBlock {
  type: 'code'
  language?: string
  code: string
}

export interface TableColumn {
  key: string
  title: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface TableBlock {
  type: 'table'
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  title?: string
}

export interface ChartBlock {
  type: 'chart'
  chartType: 'bar' | 'line' | 'pie'
  title?: string
  /** 类目轴标签 */
  labels: string[]
  series: { name: string; data: number[]; color?: string }[]
}

export interface FileBlock {
  type: 'file'
  fileId: string
  name: string
  size?: number
  mimeType?: string
  url?: string
  description?: string
}

/** 动态表单 Schema */
export interface FormFieldSchema {
  key: string
  label: string
  widget: 'input' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string | number | boolean }[]
  defaultValue?: unknown
  pattern?: string
  patternMessage?: string
  min?: number
  max?: number
  helpText?: string
}

export interface FormStepSchema {
  title: string
  description?: string
  fields: FormFieldSchema[]
}

export interface FormBlock {
  type: 'form'
  formId: string
  title?: string
  description?: string
  /** 单步表单只有一个 step；多步表单有多个 */
  steps: FormStepSchema[]
  submitText?: string
  /** 已提交后的只读值 */
  submitted?: boolean
  values?: Record<string, unknown>
}

/** HITL（人工确认）卡片 */
export type HitlActionType = 'approve' | 'reject' | 'modify' | 'supplement'

export interface HitlField {
  key: string
  label: string
  value: unknown
  editable?: boolean
}

export interface HitlBlock {
  type: 'hitl'
  taskId: string
  title: string
  description?: string
  fields: HitlField[]
  actions: HitlActionType[]
  /** 已处理后的状态 */
  resolved?: boolean
  resolution?: HitlActionType
  resolutionComment?: string
}

/** 执行步骤可视化 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface RuntimeStep {
  id: string
  name: string
  status: StepStatus
  detail?: string
  startedAt?: number
  finishedAt?: number
}

export interface StepsBlock {
  type: 'steps'
  steps: RuntimeStep[]
  traceId?: string
}

/** 业务方自定义组件块，通过 slot 渲染 */
export interface CustomBlock {
  type: 'custom'
  component: string
  props?: Record<string, unknown>
}

export interface Attachment {
  id: string
  name: string
  size?: number
  mimeType?: string
  url?: string
  /** 本地预览用 */
  previewUrl?: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  status: MessageStatus
  blocks: ContentBlock[]
  attachments?: Attachment[]
  createdAt: number
  error?: string
  /** 反馈状态 */
  feedback?: 'like' | 'dislike' | null
  correction?: string
  traceId?: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

/** 快捷指令 */
export interface QuickAction {
  id: string
  label: string
  icon?: string
  /** 点击后作为用户消息发送的文本 */
  prompt: string
  description?: string
}

/** 输入能力配置 */
export interface InputCapabilities {
  text?: boolean
  voice?: boolean
  file?: boolean
  image?: boolean
}

/** 主题配置 */
export interface ChatbotTheme {
  title?: string
  avatar?: string
  userAvatar?: string
  primaryColor?: string
  /** 'bubble' 气泡布局 | 'document' 文档流布局 */
  layout?: 'bubble' | 'document'
  dark?: boolean
  /** 头像形状 */
  avatarShape?: 'circle' | 'square' | 'rounded'
  /** 头像尺寸（px） */
  avatarSize?: number
  /** 气泡圆角（px） */
  bubbleRadius?: number
  /** 字体大小（px） */
  fontSize?: number
  /** 侧边栏宽度（px） */
  sidebarWidth?: number
  /** 消息区最大宽度（px），0 = 不限制 */
  maxMessageWidth?: number
  /** 是否显示气泡阴影 */
  bubbleShadow?: boolean
  /** 是否显示自定义滚动条 */
  customScrollbar?: boolean
  /** 消息间距（px） */
  messageGap?: number
  /** 头部高度（px） */
  headerHeight?: number
  /** 圆角大小（px），全局控制 */
  borderRadius?: number
  /** 背景图 */
  backgroundImage?: string
  /** 消息气泡用户侧颜色 */
  userBubbleColor?: string
  /** 消息气泡助手侧颜色 */
  assistantBubbleColor?: string
}

/** Chatbot 总配置 */
export interface ChatbotConfig {
  welcomeTitle?: string
  welcomeMessage?: string
  agentDescription?: string
  quickActions?: QuickAction[]
  input?: InputCapabilities
  theme?: ChatbotTheme
  /** 是否展示会话侧边栏 */
  showSessions?: boolean
  /** 是否展示停止按钮 */
  allowStop?: boolean
  /** 是否展示反馈（点赞点踩/修正） */
  enableFeedback?: boolean
  /** 占位文案 */
  inputPlaceholder?: string
  /** 国际化语言 'zh-CN' | 'en-US'，默认 zh-CN */
  locale?: string
  /** 时间戳格式 */
  timestampFormat?: 'relative' | 'time' | 'datetime' | 'hidden'
  /** 是否允许复制整条消息 */
  enableCopyMessage?: boolean
  /** 消息按时间分组间隔（分钟，0=不分组） */
  messageGroupInterval?: number
  /** 自动滚动策略 */
  autoScrollStrategy?: 'always' | 'smart' | 'never'
  /** 是否显示打字指示器动画 */
  showTypingIndicator?: boolean
  /** 是否显示"回到最新"按钮 */
  showScrollToBottom?: boolean
  /** 空状态自定义文案 */
  emptyStateTitle?: string
  emptyStateDescription?: string
  /** CSS 类名注入 */
  className?: {
    root?: string
    header?: string
    sidebar?: string
    messageList?: string
    input?: string
  }
}

/** SSE 流式事件协议 */
export type StreamEvent =
  | { type: 'status'; messageId: string; status: MessageStatus }
  | { type: 'delta'; messageId: string; text: string }
  | { type: 'block'; messageId: string; block: ContentBlock }
  | { type: 'step'; messageId: string; step: RuntimeStep }
  | { type: 'error'; messageId: string; message: string }
  | { type: 'done'; messageId: string }

export interface SendMessagePayload {
  text: string
  attachments?: Attachment[]
  /** 来源：手动输入 / 快捷指令 / 语音 */
  source?: 'input' | 'quick_action' | 'voice'
}

export interface HitlActionPayload {
  taskId: string
  messageId: string
  action: HitlActionType
  comment?: string
  /** modify 时修改后的字段值 */
  fields?: Record<string, unknown>
}

export interface FormSubmitPayload {
  formId: string
  messageId: string
  values: Record<string, unknown>
  /** 多步表单时的步骤索引（最后一步提交时为 steps.length - 1） */
  step?: number
}

export interface FeedbackPayload {
  messageId: string
  feedback: 'like' | 'dislike' | null
}

export interface CorrectionPayload {
  messageId: string
  correction: string
}
