<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'start' | 'components' | 'protocol' | 'api' | 'faq'>('start')

const tabs = [
  { key: 'start', label: '快速开始' },
  { key: 'components', label: '组件一览' },
  { key: 'protocol', label: 'SSE 流式协议' },
  { key: 'api', label: 'API 接口' },
  { key: 'faq', label: '常见问题' }
] as const

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <div class="help">
    <header class="help__header">
      <div class="help__header-left">
        <button class="help__back" type="button" @click="emit('back')">← 返回 Demo</button>
        <h1 class="help__title">Agent Chat UI 帮助中心</h1>
      </div>
      <a href="https://github.com/gaosichun888/chatui" target="_blank" class="help__github">GitHub</a>
    </header>

    <div class="help__body">
      <nav class="help__nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="help__nav-item"
          :class="{ 'is-active': activeTab === tab.key }"
          type="button"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <main class="help__content">
        <!-- 快速开始 -->
        <section v-if="activeTab === 'start'" class="help__section">
          <h2>安装</h2>
          <pre class="help__code">npm install agent-chatbot-ui-vue</pre>

          <h2>引入组件</h2>
          <pre class="help__code">&lt;script setup lang="ts"&gt;
import { AgentChatbot, applyStreamEvent, connectSSE } from 'agent-chatbot-ui-vue'
import type { ChatMessage, ChatbotConfig, SendMessagePayload } from 'agent-chatbot-ui-vue'
import 'agent-chatbot-ui-vue/style.css'
&lt;/script&gt;</pre>

          <h2>基础用法</h2>
          <pre class="help__code">&lt;template&gt;
  &lt;AgentChatbot
    :config="config"
    :messages="messages"
    :sessions="sessions"
    :active-session-id="activeSessionId"
    :busy="busy"
    @send="onSend"
    @stop="onStop"
    @retry="onRetry"
    @session-select="onSessionSelect"
    @session-create="onSessionCreate"
    @hitl-action="onHitlAction"
    @form-submit="onFormSubmit"
    @feedback="onFeedback"
  /&gt;
&lt;/template&gt;</pre>

          <h2>ChatbotConfig 配置</h2>
          <pre class="help__code">const config: ChatbotConfig = {
  welcomeTitle: '你好，我是企业智能助手',
  welcomeMessage: '有什么可以帮你？',
  agentDescription: '支持数据查询、流程办理、智能报表等功能',
  quickActions: [
    { id: '1', label: '查询销售报表', icon: '[报表]', prompt: '查询销售报表' },
    { id: '2', label: '我要请假', icon: '[表单]', prompt: '我要请假' }
  ],
  input: { text: true, voice: true, file: true, image: true },
  theme: {
    title: '企业智能助手',
    avatar: '/logo.png',
    primaryColor: '#4f6ef7',
    layout: 'bubble',  // 'bubble' 气泡布局 | 'document' 文档流布局
    dark: false
  },
  showSessions: true,
  allowStop: true,
  enableFeedback: true,
  inputPlaceholder: '请输入消息...'
}</pre>

          <h2>对接 SSE 流式接口</h2>
          <pre class="help__code">import { connectSSE, applyStreamEvent } from 'agent-chatbot-ui-vue'

// 发送消息并建立 SSE 连接
const abort = new AbortController()
await connectSSE({
  url: '/api/chat/stream',
  method: 'POST',
  headers: { Authorization: 'Bearer xxx' },
  body: { sessionId, text: userInput },
  signal: abort.signal,
  onEvent: (event) =&gt; applyStreamEvent(messages, event),
  onError: (err) =&gt; console.error('SSE 错误:', err),
  onClose: () =&gt; { busy.value = false }
})</pre>
        </section>

        <!-- 组件一览 -->
        <section v-if="activeTab === 'components'" class="help__section">
          <h2>组件架构</h2>
          <table class="help__table">
            <thead>
              <tr><th>组件</th><th>功能</th><th>可独立使用</th></tr>
            </thead>
            <tbody>
              <tr><td><code>AgentChatbot</code></td><td>聊天总容器（侧边栏 + 头部 + 消息列表 + 输入区）</td><td>是 (主入口)</td></tr>
              <tr><td><code>SessionSidebar</code></td><td>会话管理侧边栏（新建/搜索/删除/重命名）</td><td>是</td></tr>
              <tr><td><code>WelcomeBlock</code></td><td>欢迎语 + 快捷指令入口</td><td>是</td></tr>
              <tr><td><code>MessageItem</code></td><td>单条消息（自动分发内容块到各渲染器）</td><td>是</td></tr>
              <tr><td><code>MessageInput</code></td><td>输入框（文本/文件/语音/停止按钮）</td><td>是</td></tr>
              <tr><td><code>MessageStatusBadge</code></td><td>消息状态标签（思考中/执行中/失败等）</td><td>是</td></tr>
              <tr><td><code>FeedbackBar</code></td><td>点赞/点踩/人工修正反馈</td><td>是</td></tr>
              <tr><td><code>MarkdownRenderer</code></td><td>Markdown 渲染（含标题/列表/引用/链接）</td><td>是</td></tr>
              <tr><td><code>CodeBlockRenderer</code></td><td>代码块高亮 + 一键复制</td><td>是</td></tr>
              <tr><td><code>TableRenderer</code></td><td>结构化表格（排序/横向滚动）</td><td>是</td></tr>
              <tr><td><code>ChartRenderer</code></td><td>图表渲染（柱状图/折线图/饼图，纯 SVG）</td><td>是</td></tr>
              <tr><td><code>FileCard</code></td><td>文件卡片（名称/大小/下载）</td><td>是</td></tr>
              <tr><td><code>DynamicForm</code></td><td>Schema 驱动动态表单 / 多步骤表单</td><td>是</td></tr>
              <tr><td><code>ApprovalCard</code></td><td>HITL 审批确认卡片（同意/拒绝/修改/补充）</td><td>是</td></tr>
              <tr><td><code>ExecutionSteps</code></td><td>执行步骤可视化 + Trace 入口</td><td>是</td></tr>
            </tbody>
          </table>

          <h2>消息内容块 (ContentBlock)</h2>
          <p>一条 <code>ChatMessage</code> 由 <code>blocks: ContentBlock[]</code> 组成，支持以下类型：</p>
          <table class="help__table">
            <thead><tr><th>type</th><th>说明</th><th>对应渲染器</th></tr></thead>
            <tbody>
              <tr><td><code>text</code></td><td>纯文本</td><td>内联渲染</td></tr>
              <tr><td><code>markdown</code></td><td>Markdown 文本</td><td>MarkdownRenderer</td></tr>
              <tr><td><code>code</code></td><td>代码块（支持语言高亮）</td><td>CodeBlockRenderer</td></tr>
              <tr><td><code>table</code></td><td>结构化表格</td><td>TableRenderer</td></tr>
              <tr><td><code>chart</code></td><td>图表（bar/line/pie）</td><td>ChartRenderer</td></tr>
              <tr><td><code>file</code></td><td>文件/附件卡片</td><td>FileCard</td></tr>
              <tr><td><code>form</code></td><td>动态表单 / 多步骤表单</td><td>DynamicForm</td></tr>
              <tr><td><code>hitl</code></td><td>人工确认审批卡片</td><td>ApprovalCard</td></tr>
              <tr><td><code>steps</code></td><td>执行步骤进度</td><td>ExecutionSteps</td></tr>
              <tr><td><code>custom</code></td><td>自定义组件（通过 slot 渲染）</td><td>宿主提供</td></tr>
            </tbody>
          </table>
        </section>

        <!-- SSE 协议 -->
        <section v-if="activeTab === 'protocol'" class="help__section">
          <h2>SSE 流式事件协议</h2>
          <p>后端通过 Server-Sent Events 推送 <code>data: {JSON}</code> 行，每条 data 为一个 <code>StreamEvent</code> 对象。前端调用 <code>applyStreamEvent(messages, event)</code> 即可自动增量渲染。</p>

          <h3>事件类型</h3>
          <table class="help__table">
            <thead><tr><th>type</th><th>字段</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td><code>status</code></td><td><code>messageId</code>, <code>status</code></td><td>更新消息状态（thinking / running / waiting_hitl / ...）</td></tr>
              <tr><td><code>delta</code></td><td><code>messageId</code>, <code>text</code></td><td>追加流式文本（Markdown 增量），自动拼接到最后一个 markdown 块</td></tr>
              <tr><td><code>block</code></td><td><code>messageId</code>, <code>block</code></td><td>推送完整的结构化内容块（表格/图表/表单/HITL/文件等）</td></tr>
              <tr><td><code>step</code></td><td><code>messageId</code>, <code>step</code></td><td>更新执行步骤状态（识别意图/检索/调用工具等）</td></tr>
              <tr><td><code>error</code></td><td><code>messageId</code>, <code>message</code></td><td>标记消息失败并附带错误信息</td></tr>
              <tr><td><code>done</code></td><td><code>messageId</code></td><td>标记消息完成</td></tr>
            </tbody>
          </table>

          <h3>示例事件流</h3>
          <pre class="help__code">data: {"type":"status","messageId":"m-1","status":"thinking"}

data: {"type":"step","messageId":"m-1","step":{"id":"s1","name":"识别意图","status":"running"}}

data: {"type":"step","messageId":"m-1","step":{"id":"s1","name":"识别意图","status":"completed"}}

data: {"type":"delta","messageId":"m-1","text":"根据你的问题，"}

data: {"type":"delta","messageId":"m-1","text":"已为你查询到以下数据：\n\n"}

data: {"type":"block","messageId":"m-1","block":{"type":"table","columns":[...],"rows":[...]}}

data: {"type":"done","messageId":"m-1"}</pre>

          <h3>消息状态流转</h3>
          <pre class="help__code">pending → thinking → running → streaming → completed
                                    ↘ waiting_hitl → (用户操作后) completed
                          ↘ failed (可重试)
          用户点击停止 → canceled</pre>
        </section>

        <!-- API 接口 -->
        <section v-if="activeTab === 'api'" class="help__section">
          <h2>推荐后端 API 接口</h2>
          <p>以下接口由宿主应用对接，组件库通过事件通知宿主应用调用对应 API。</p>

          <h3>会话管理</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/chat/sessions</code></td><td>新建会话</td></tr>
              <tr><td>GET</td><td><code>/api/chat/sessions</code></td><td>会话历史列表</td></tr>
              <tr><td>PUT</td><td><code>/api/chat/sessions/{id}/title</code></td><td>更新会话标题</td></tr>
              <tr><td>DELETE</td><td><code>/api/chat/sessions/{id}</code></td><td>删除会话</td></tr>
            </tbody>
          </table>

          <h3>消息与流式</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/chat/sessions/{id}/messages</code></td><td>发送消息</td></tr>
              <tr><td>POST</td><td><code>/api/chat/stream</code></td><td>SSE 流式输出（返回 text/event-stream）</td></tr>
              <tr><td>GET</td><td><code>/api/chat/messages/{id}/status</code></td><td>消息状态查询</td></tr>
              <tr><td>POST</td><td><code>/api/chat/messages/{id}/retry</code></td><td>消息重试</td></tr>
            </tbody>
          </table>

          <h3>HITL 人工确认</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/hitl/tasks/{id}/actions</code></td><td>审批操作（同意/拒绝/修改/补充）</td></tr>
              <tr><td>POST</td><td><code>/api/hitl/tasks/{id}/reject</code></td><td>拒绝并附原因</td></tr>
              <tr><td>POST</td><td><code>/api/runtime/tasks/{id}/resume</code></td><td>审批后恢复执行</td></tr>
              <tr><td>POST</td><td><code>/api/runtime/tasks/{id}/cancel</code></td><td>取消执行</td></tr>
            </tbody>
          </table>

          <h3>表单</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/chat/forms/{id}/submit</code></td><td>提交表单</td></tr>
              <tr><td>POST</td><td><code>/api/chat/forms/{id}/steps/{step}/submit</code></td><td>多步骤表单分步提交</td></tr>
            </tbody>
          </table>

          <h3>反馈</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/chat/messages/{id}/feedback</code></td><td>点赞/点踩</td></tr>
              <tr><td>POST</td><td><code>/api/chat/messages/{id}/correction</code></td><td>人工修正反馈</td></tr>
            </tbody>
          </table>

          <h3>文件</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/chat/files</code></td><td>上传文件</td></tr>
              <tr><td>GET</td><td><code>/api/files/{id}</code></td><td>下载文件</td></tr>
              <tr><td>POST</td><td><code>/api/chat/audio/transcribe</code></td><td>语音转文字</td></tr>
            </tbody>
          </table>

          <h3>配置</h3>
          <table class="help__table">
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>POST</td><td><code>/api/agents/{id}/chatbot-config</code></td><td>欢迎语配置</td></tr>
              <tr><td>POST</td><td><code>/api/agents/{id}/quick-actions</code></td><td>快捷指令配置</td></tr>
              <tr><td>POST</td><td><code>/api/agents/{id}/input-channels</code></td><td>输入能力配置</td></tr>
              <tr><td>POST</td><td><code>/api/agents/{id}/chatbot-theme</code></td><td>主题配置</td></tr>
              <tr><td>POST</td><td><code>/api/agents/{id}/response-component-policy</code></td><td>回复组件策略</td></tr>
            </tbody>
          </table>
        </section>

        <!-- FAQ -->
        <section v-if="activeTab === 'faq'" class="help__section">
          <h2>常见问题</h2>

          <div class="help__faq">
            <h3>如何自定义主题色？</h3>
            <p>通过 <code>config.theme.primaryColor</code> 设置主色调，组件内所有主色都会自动跟随。也可以在 CSS 中覆盖 <code>--ac-primary</code> 变量。</p>
          </div>

          <div class="help__faq">
            <h3>如何切换暗色模式？</h3>
            <p>设置 <code>config.theme.dark = true</code>，根组件会自动添加 <code>.ac-dark</code> 类名。也可以动态切换。</p>
          </div>

          <div class="help__faq">
            <h3>如何关闭语音/文件上传入口？</h3>
            <p>设置 <code>config.input = { text: true, voice: false, file: false, image: false }</code>，输入框区域会自动隐藏对应按钮。</p>
          </div>

          <div class="help__faq">
            <h3>如何渲染自定义内容块？</h3>
            <p>使用 <code>custom</code> 类型的 <code>ContentBlock</code>，并通过 <code>custom-block</code> 插槽自行渲染：</p>
            <pre class="help__code">&lt;AgentChatbot ...&gt;
  &lt;template #custom-block="{ block, message }"&gt;
    &lt;MyCustomCard :data="block.props" /&gt;
  &lt;/template&gt;
&lt;/AgentChatbot&gt;</pre>
          </div>

          <div class="help__faq">
            <h3>如何对接后端 SSE？</h3>
            <p>使用内置的 <code>connectSSE</code>，传入你的 API 地址和 token。或者使用你自己的 SSE 客户端，只要将每条事件传给 <code>applyStreamEvent(messages, event)</code> 即可。</p>
          </div>

          <div class="help__faq">
            <h3>多步骤表单如何配置？</h3>
            <p>在 <code>FormBlock</code> 的 <code>steps</code> 数组中定义多个步骤，每个步骤包含各自的 <code>fields</code>。组件会自动渲染步骤条和分步校验。</p>
          </div>

          <div class="help__faq">
            <h3>HITL 审批后如何恢复执行？</h3>
            <p>监听 <code>hitl-action</code> 事件，根据 <code>payload.action</code> 调用后端 <code>POST /api/hitl/tasks/{id}/actions</code>。审批通过后后端调 <code>POST /api/runtime/tasks/{id}/resume</code> 恢复执行，继续推送 SSE 事件。</p>
          </div>

          <div class="help__faq">
            <h3>如何不使用 AgentChatbot 整体组件？</h3>
            <p>所有子组件都可以独立导入使用。例如只想用表格渲染：</p>
            <pre class="help__code">import { TableRenderer } from 'agent-chatbot-ui-vue'</pre>
          </div>

          <div class="help__faq">
            <h3>浏览器兼容性？</h3>
            <p>支持所有现代浏览器（Chrome/Firefox/Safari/Edge 最近两个主版本）。需要 ES2020 运行时。</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style>
.help { height: 100%; display: flex; flex-direction: column; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #1f2329; }
.help__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
}
.help__header-left { display: flex; align-items: center; gap: 16px; }
.help__back {
  border: none;
  background: none;
  color: #4f6ef7;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.help__back:hover { text-decoration: underline; }
.help__title { margin: 0; font-size: 18px; }
.help__github {
  color: #4f6ef7;
  text-decoration: none;
  font-size: 14px;
}
.help__github:hover { text-decoration: underline; }
.help__body { flex: 1; display: flex; min-height: 0; overflow: hidden; }
.help__nav {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  background: #f5f6fa;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.help__nav-item {
  border: none;
  background: none;
  text-align: left;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  color: #6b7280;
}
.help__nav-item:hover { background: rgba(79, 110, 247, 0.06); color: #1f2329; }
.help__nav-item.is-active { color: #4f6ef7; font-weight: 600; background: rgba(79, 110, 247, 0.1); border-right: 3px solid #4f6ef7; }
.help__content { flex: 1; overflow-y: auto; padding: 24px 32px; max-width: 900px; }
.help__section h2 { font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e4e7ed; }
.help__section h2:first-child { margin-top: 0; }
.help__section h3 { font-size: 15px; margin: 18px 0 8px; }
.help__section p { line-height: 1.65; margin: 6px 0; }
.help__code {
  background: #1e1e2e;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  overflow-x: auto;
  font-size: 12.5px;
  line-height: 1.55;
  margin: 8px 0;
  white-space: pre;
}
.help__table { border-collapse: collapse; width: 100%; margin: 8px 0 16px; }
.help__table th, .help__table td { border: 1px solid #e4e7ed; padding: 8px 12px; font-size: 13px; text-align: left; }
.help__table th { background: #f5f6fa; font-weight: 600; }
.help__table code { background: #f0f1f5; padding: 1px 5px; border-radius: 3px; font-size: 12.5px; }
.help__faq { margin-bottom: 20px; }
.help__faq h3 { color: #4f6ef7; }
</style>
